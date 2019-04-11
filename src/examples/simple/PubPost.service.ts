import { Service } from '@ltv/moleculer-decorators';
import { MoleculerKnexDbMixin } from '../../lib/KnexDbMixin';

@Service({
  name: 'PubPost',
  mixins: [
    MoleculerKnexDbMixin({
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
