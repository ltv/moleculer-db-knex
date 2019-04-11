# Moleculer KnexDB Mixin

This package use for creating mixin for each service which can support

[![CircleCI](https://circleci.com/gh/ltv/moleculer-db-knex.svg?style=svg)](https://circleci.com/gh/ltv/moleculer-db-knex)
[![Coverage Status](https://coveralls.io/repos/github/ltv/moleculer-db-knex/badge.svg?branch=master)](https://coveralls.io/github/ltv/moleculer-db-knex?branch=master)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/moleculer-db-knex.svg)](https://badge.fury.io/js/moleculer-db-knex)

## Usage

```bash
yarn add moleculer-db-knex
```

```js
const connection: ConnectionConfig = {
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS
};

const configs: Config = {
  client: 'postgresql',
  connection,
  pool: {
    min: 2,
    max: 10
  }
};

broker.createService({
  name: 'public',
  mixins: [
    KnexDbMixin({
      schema: 'adm',
      table: 'PubPost',
      knex: {
        configs
      }
    })
  ]
});
```

- This mixin will create actions for service:

```js
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
        }
      },

      deleteById: {
        params: {
          [idField]: {
            type: 'any'
          }
        },
        handler(ctx: Context) {
        }
      }
```

- Service methods available:

````js
/**
 * Clear the cache & call entity lifecycle events
 *
 * @param {String} type
 * @param {Object|Array|Number} json
 * @param {Context} ctx
 * @returns {Promise}
 */
entityChanged(type, json, ctx) {},

/**
 * Clear cached entities
 *
 * @methods
 * @returns {Promise}
 */
clearCache() {},

db(options?: { schema?: string; table: string }): QueryBuilder {},

find(opts?: { field: string; value: any; operator: string }) {},


insert(entity: any, returning?: string | string[]) {},


update(opts: {
  field: string;
  value: any;
  entity: any;
  returning?: string | string[];
}) {},


delete(opts: {
  field: string;
  value: any;
  returning?: string | string[];
}) {},

clean() {}
```

## Test

Before testing, please provision env with docker

```bash
yarn provision:dev
```

And then

```bash
yarn test:unit
```
