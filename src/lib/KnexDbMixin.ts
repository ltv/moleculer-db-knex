// tslint:disable: no-shadowed-variable
import Knex, { Config, QueryBuilder } from 'knex';
import capitalize from 'lodash.capitalize';
import { Context, ServiceSchema } from 'moleculer';

export interface MoleculerKnexDbOptions {
  schema: string; // database schema
  table: string; // table name
  idField?: string;
  tenantField?: string;
  knex: {
    configs?: Config;
    instance?: Knex;
  };
}

const defaultOptions: MoleculerKnexDbOptions = {
  schema: 'public',
  table: '',
  idField: 'id',
  tenantField: 'tenantId',
  knex: null
};

export function KnexDbMixin(options: MoleculerKnexDbOptions): ServiceSchema {
  const opts: MoleculerKnexDbOptions = { ...defaultOptions, ...options };
  let knex: Knex;
  const { idField, tenantField } = opts;

  const schema: ServiceSchema = {
    name: '',
    settings: { idField, tenantField },
    actions: {
      find: {
        params: {
          where: {
            type: 'object',
            optional: true
          }
        },
        cache: {
          keys: ['where']
        },
        handler(ctx: Context<{ where: any }>) {
          const { where = {} } = ctx.params;
          return this.find(where);
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
        async handler(ctx: Context<{ [key: string]: any }>) {
          try {
            const res: any[] = await this.find({
              [this.settings.idField]: ctx.params[this.settings.idField]
            });
            return res && res.length ? res[0] : null;
          } catch (e) {
            this.logger.error(e);
            return null;
          }
        }
      },

      insert: {
        params: {
          entity: {
            type: 'any'
          }
        },
        handler(ctx: Context<{ entity: any }>) {
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
        handler(ctx: Context<{ [key: string]: any; entity: any }>) {
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
        handler(ctx: Context<{ [key: string]: any; entity: any }>) {
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

      db(options?: {
        schema?: string;
        table: string;
        tenant?: number | string;
      }): QueryBuilder {
        const { schema = 'public', table, tenant = null } = options || {
          ...opts
        };
        const db = this.knex()(table).withSchema(schema);

        // Check if configured tenant, will be use the tenant
        if (tenant && this.settings.tenantField) {
          return db.where(this.settings.tenantField, '=', tenant);
        }

        // return knex db builder
        return db;
      },

      find<T = any[]>(where?: { [key: string]: number | boolean | string }): T {
        where = where || {};
        const keys = Object.keys(where);

        const db = this.db();

        if (keys.length > 0) {
          keys.forEach((k: string) => {
            db.where(k, where[k]);
          });
        }

        return db.select('*');
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
