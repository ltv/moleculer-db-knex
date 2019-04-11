import { Service } from '@ltv/moleculer-decorators';
import { KnexDbMixin } from '../../lib/KnexDbMixin';

@Service({
  name: 'PubPost',
  mixins: [
    KnexDbMixin({
      schema: 'adm',
      table: 'PubPost',
      knex: {
        configs: {}
      }
    })
  ]
})
class PubPostService {}

export = PubPostService;
