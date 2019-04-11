# CHANGELOGS

## v0.1.0

- Create KnexDB mixin

```js
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
