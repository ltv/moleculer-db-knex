import { KnexDbMixin } from '../KnexDbMixin';
import { ServiceBroker, Context } from 'moleculer';
import { Config, ConnectionConfig } from 'knex';

const connection: ConnectionConfig = {
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT
} as any;

const configs: Config = {
  client: 'postgresql',
  connection,
  pool: {
    min: 2,
    max: 10
  }
};

describe('>> KnexDBMixin <<', () => {
  const entityInserted = jest.fn();
  const entityUpdated = jest.fn();
  const entityDeleted = jest.fn();

  const broker: ServiceBroker = new ServiceBroker({
    logger: false
  });

  const service = broker.createService({
    name: 'public',
    mixins: [
      KnexDbMixin({
        schema: 'public',
        table: 'PubPost',
        idField: 'id',
        knex: {
          configs
        }
      })
    ],
    actions: {
      findPostWithDb() {
        return this.db({ schema: 'public', table: 'PubPost' }).select('*');
      },

      findPostWithDbWithoutSchema() {
        return this.db({ table: 'PubPost' }).select('*');
      }
    },
    entityInserted,
    entityUpdated,
    entityDeleted
  });

  const postData = {
    title: 'KnexDBMixin',
    content: 'OK Good'
  };

  let insertedPost: any = {};

  beforeAll(() => broker.start().then(() => service.clean()));
  afterAll(() => broker.stop());

  it('Should create service correctly', () => {
    const { schema } = service;
    expect(schema).toMatchObject({
      name: 'public',
      settings: {
        idField: expect.any(String)
      },
      actions: {
        find: expect.any(Object),
        findById: expect.any(Object),
        insert: expect.any(Object),
        updateById: expect.any(Object),
        deleteById: expect.any(Object)
      },
      methods: expect.any(Object),
      created: expect.any(Function)
    });
  });

  it('Should create PubPost', async () => {
    expect.assertions(2);
    const post = await broker.call('public.insert', {
      entity: postData
    });
    insertedPost = { ...post };
    expect({
      id: post.id,
      title: post.title,
      content: post.content
    }).toMatchObject({
      ...postData,
      id: expect.any(Number)
    });
    expect(entityInserted).toBeCalledTimes(1);
  });

  it('Should update PubPost correctly', async () => {
    expect.assertions(2);
    const tobeUpdated = { title: 'New Title', content: 'New Content' };
    const updated = await broker.call('public.updateById', {
      id: insertedPost.id,
      entity: tobeUpdated
    });

    expect(updated).toEqual({
      id: insertedPost.id,
      ...tobeUpdated
    });
    expect(entityUpdated).toBeCalledTimes(1);
  });

  it('Should delete PubPost', async () => {
    expect.assertions(2);
    const deleted = await broker.call('public.deleteById', {
      id: insertedPost.id
    });
    expect(deleted.id).toEqual(insertedPost.id);
    expect(entityDeleted).toBeCalledTimes(1);
  });

  describe('Test find action', () => {
    const posts = [
      { title: 'Post 1', content: 'Post 1' },
      { title: 'Post 2', content: 'Post 2' },
      { title: 'Post 3', content: 'Post 3' }
    ];
    const createPosts = () =>
      Promise.all(posts.map(p => broker.call('public.insert', { entity: p })));

    let createdPosts = [];
    beforeAll(async () => createPosts());
    afterAll(() => service.clean());

    it('Should find all posts', async () => {
      const foundPosts = await broker.call('public.find');
      createdPosts = [...foundPosts];
      expect(foundPosts.length).toBe(3);
    });

    it('Should find correct post', async () => {
      expect.assertions(2);
      const foundPosts = await broker.call('public.find', {
        field: 'title',
        operator: '=',
        value: createdPosts[0].title
      });

      expect(foundPosts.length).toEqual(1);
      expect(foundPosts[0]).toMatchObject(createdPosts[0]);
    });

    it('Should find correct post by id', async () => {
      const foundPosts = await broker.call('public.findById', {
        id: createdPosts[0].id
      });

      expect(foundPosts).toMatchObject(createdPosts[0]);
    });

    it('Should find correct post with custom operator', async () => {
      expect.assertions(3);
      const foundPosts = await broker.call('public.find', {
        field: 'id',
        operator: '>',
        value: createdPosts[0].id
      });

      expect(foundPosts.length).toEqual(2);
      expect(foundPosts[0]).toMatchObject(createdPosts[1]);
      expect(foundPosts[1]).toMatchObject(createdPosts[2]);
    });

    it('Should find with custom db', async () => {
      const foundPosts = await broker.call('public.findPostWithDb');
      createdPosts = [...foundPosts];
      expect(foundPosts.length).toBe(3);
    });

    it('Should find with custom db without schema', async () => {
      const foundPosts = await broker.call(
        'public.findPostWithDbWithoutSchema'
      );
      createdPosts = [...foundPosts];
      expect(foundPosts.length).toBe(3);
    });
  });
});

describe('>> KnexDBMixin with Cacher <<', () => {
  const broker: ServiceBroker = new ServiceBroker({
    logger: false,
    cacher: 'Memory'
  });

  const service = broker.createService({
    name: 'public',
    mixins: [
      KnexDbMixin({
        schema: 'public',
        table: 'PubPost',
        idField: 'id',
        knex: {
          configs
        }
      })
    ],
    actions: {
      getCache: {
        params: {
          key: 'string'
        },
        handler(ctx: Context) {
          const { key } = ctx.params;
          return this.broker.cacher.get(key);
        }
      }
    }
  });

  beforeAll(() => broker.start().then(() => service.clean()));
  afterAll(() => broker.stop());

  describe('Test with find action', () => {
    const posts = [
      { title: 'Post 1', content: 'Post 1' },
      { title: 'Post 2', content: 'Post 2' },
      { title: 'Post 3', content: 'Post 3' }
    ];
    const createPosts = () =>
      Promise.all(posts.map(p => broker.call('public.insert', { entity: p })));

    let createdPosts = [];
    beforeAll(async () => createPosts());
    afterAll(() => service.clean());

    it('Should find all posts', async () => {
      expect.assertions(2);
      const foundPosts = await broker.call('public.find');
      const fromCached = await broker.call('public.getCache', {
        key: 'public.find:undefined|undefined|undefined'
      });
      createdPosts = [...foundPosts];
      expect(foundPosts.length).toBe(3);
      expect(fromCached).toMatchObject(foundPosts);
    });

    it('Should find correct post', async () => {
      expect.assertions(3);
      const foundPosts = await broker.call('public.find', {
        field: 'title',
        operator: '=',
        value: createdPosts[0].title
      });
      const fromCached = await broker.call('public.getCache', {
        key: `public.find:title|${createdPosts[0].title}|=`
      });

      expect(foundPosts.length).toEqual(1);
      expect(foundPosts[0]).toMatchObject(createdPosts[0]);
      expect(fromCached).toMatchObject(foundPosts);
    });

    it('Should find correct post by id', async () => {
      expect.assertions(2);
      const foundPosts = await broker.call('public.findById', {
        id: createdPosts[0].id
      });
      const fromCached = await broker.call('public.getCache', {
        key: `public.findById:${createdPosts[0].id}`
      });

      expect(foundPosts).toMatchObject(createdPosts[0]);
      expect(fromCached).toMatchObject(foundPosts);
    });

    it('Should find correct post with custom operator', async () => {
      expect.assertions(4);
      const foundPosts = await broker.call('public.find', {
        field: 'id',
        operator: '>',
        value: createdPosts[0].id
      });
      const fromCached = await broker.call('public.getCache', {
        key: `public.find:id|${createdPosts[0].id}|>`
      });

      expect(foundPosts.length).toEqual(2);
      expect(foundPosts[0]).toMatchObject(createdPosts[1]);
      expect(foundPosts[1]).toMatchObject(createdPosts[2]);
      expect(fromCached).toMatchObject(foundPosts);
    });
  });
});
