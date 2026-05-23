migrate(
  (app) => {
    const catalogs = app.findCollectionByNameOrId('catalogs')
    const products = app.findCollectionByNameOrId('products')

    const collection = new Collection({
      name: 'catalog_items',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'master'",
      updateRule: "@request.auth.role = 'master'",
      deleteRule: "@request.auth.role = 'master'",
      fields: [
        {
          name: 'catalog_id',
          type: 'relation',
          collectionId: catalogs.id,
          required: true,
          maxSelect: 1,
          cascadeDelete: true,
        },
        {
          name: 'product_id',
          type: 'relation',
          collectionId: products.id,
          required: true,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('catalog_items')
    app.delete(collection)
  },
)
