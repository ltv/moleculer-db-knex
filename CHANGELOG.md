# CHANGELOGS

## v0.1.0

- Create KnexDB mixin

```js
broker.createService({
  name: 'public',
  mixins: [
    MoleculerKnexDbMixin({
      schema: 'adm',
      table: 'PubPost',
      knex: {
        configs
      }
    })
  ]
});
```
