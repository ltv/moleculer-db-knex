// tslint:disable: no-shadowed-variable
import Knex, { Config, QueryBuilder } from 'knex';
import capitalize from 'lodash.capitalize';
import { Context, ServiceSchema } from 'moleculer';

export interface MoleculerKnexDbOptions {
  schema: string; // database schema
  table: string; // table name
  idField?: string;
  knex: {
    configs?: Config;
    instance?: Knex
  };
}

const defaultOptions: MoleculerKnexDbOptions = {
  schema: 'public',
  table: '',
  idField: 'id',
  knex: null
};

export function KnexDbMixin(
  options: MoleculerKnexDbOptions
): ServiceSchema {
  const opts: MoleculerKnexDbOptions = { ...defaultOptions, ...options };
  let knex: Knex;
  const { idField } = opts;

  const schema: ServiceSchema = {
    name: '',
    settings: { idField },
    actions: {
      find: {
        params: {
          field: {
            type: 'string',
            optional: true
          },
          value: {
            type: 'any',
            optional: true
          },
          operator: {
            type: 'string',
            optional: true
          }
        },
        cache: {
          keys: ['field', 'value', 'operator']
        },
        handler(ctx: Context) {
          const { field, value, operator = '=' } = ctx.params;
          return this.find(
            !field || !value ? undefined : { field, value, operator }
          );
        }
      },

      findById: {
        params: {
          [idField]: {
            type: 'any'
          }
        },
        cache: {
          keys: [idField]
        },
        handler(ctx: Context) {
          return this.find({
            field: this.settings.idField,
            value: ctx.params[this.settings.idField]
          }).then(res => res && res[0]);
        }
      },

      insert: {
        params: {
          entity: {
            type: 'any'
          }
        },
        handler(ctx: Context) {
          const { entity } = ctx.params;
          return this.insert(entity).then(res =>
            this.entityChanged('inserted', res, ctx).then(() => res)
          );
        }
      },

      updateById: {
        params: {
          [idField]: {
            type: 'any'
          },
          entity: {
            type: 'any'
          }
        },
        handler(ctx: Context) {
          const { entity } = ctx.params;
          return this.update({
            field: this.settings.idField,
            value: ctx.params[this.settings.idField],
            entity
          }).then(res =>
            this.entityChanged('updated', res, ctx).then(() => res)
          );
        }
      },

      deleteById: {
        params: {
          [idField]: {
            type: 'any'
          }
        },
        handler(ctx: Context) {
          return this.delete({
            field: this.settings.idField,
            value: ctx.params[this.settings.idField]
          }).then(res =>
            this.entityChanged('deleted', res, ctx).then(() => res)
          );
        }
      }
    },

    methods: {
      /**
       * Clear the cache & call entity lifecycle events
       *
       * @param {String} type
       * @param {Object|Array|Number} json
       * @param {Context} ctx
       * @returns {Promise}
       */
      entityChanged(type, json, ctx) {
        return this.clearCache().then(() => {
          const eventName = `entity${capitalize(type)}`;
          if (this.schema[eventName] != null) {
            return this.schema[eventName].call(this, json, ctx);
          }
        });
      },

      /**
       * Clear cached entities
       *
       * @methods
       * @returns {Promise}
       */
      clearCache() {
        this.broker.broadcast(`cache.clean.${this.name}`);
        if (this.broker.cacher) {
          return this.broker.cacher.clean(`${this.name}.*`);
        }
        return Promise.resolve();
      },

      connect() {
        if (!opts.knex.instance) {
          opts.knex.instance = Knex(opts.knex.configs);
        }
        return opts.knex.instance;
      },

      knex(): Knex {
        return knex;
      },

      db(options?: { schema?: string; table: string }): QueryBuilder {
        const { schema = 'public', table } = options || { ...opts };
        return this.knex()(table).withSchema(schema);
      },

      find<T = any>(opts?: { field: string; value: any; operator: string }): T {
        return !opts
          ? this.db().select('*')
          : this.db()
            .where(opts.field, opts.operator || '=', opts.value)
            .select('*');
      },

      insert<T = any>(entity: any, returning?: string | string[]): T {
        return this.db()
          .insert(entity, returning || '*')
          .then(res => res && res[0]);
      },

      update<T = any>(opts: {
        field: string;
        value: any;
        entity: any;
        returning?: string | string[];
      }): T {
        return this.db()
          .where(opts.field, opts.value)
          .update(opts.entity, opts.returning || '*')
          .then(res => res && res[0]);
      },

      delete<T = any>(opts: {
        field: string;
        value: any;
        returning?: string | string[];
      }): T {
        return this.db()
          .where(opts.field, opts.value)
          .del(opts.returning || '*')
          .then(res => res && res[0]);
      },

      clean(): void {
        return this.db()
          .whereNotNull(this.settings.idField)
          .del();
      }
    },

    created() {
      knex = this.connect();
    }
  };
  return schema;
}
