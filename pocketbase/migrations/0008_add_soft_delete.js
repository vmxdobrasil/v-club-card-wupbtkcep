migrate(
  (app) => {
    const collections = ['companies', 'card_holders', 'products', 'catalogs']
    for (const name of collections) {
      const col = app.findCollectionByNameOrId(name)
      if (!col.fields.getByName('deleted_at')) {
        col.fields.add(new DateField({ name: 'deleted_at', required: false }))
        app.save(col)
      }
    }
  },
  (app) => {
    const collections = ['companies', 'card_holders', 'products', 'catalogs']
    for (const name of collections) {
      try {
        const col = app.findCollectionByNameOrId(name)
        col.fields.removeByName('deleted_at')
        app.save(col)
      } catch (_) {}
    }
  },
)
