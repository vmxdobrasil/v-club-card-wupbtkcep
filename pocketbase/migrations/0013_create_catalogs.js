migrate(
  (app) => {
    const collection = new Collection({
      name: 'catalogs',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'master'",
      updateRule: "@request.auth.role = 'master'",
      deleteRule: "@request.auth.role = 'master'",
      fields: [
        { name: 'name', type: 'text', required: true },
        {
          name: 'company_id',
          type: 'relation',
          required: false,
          collectionId: app.findCollectionByNameOrId('companies').id,
          maxSelect: 1,
        },
        { name: 'product_links', type: 'json' },
        { name: 'status', type: 'select', values: ['active', 'inactive'] },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)

    const items = new Collection({
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
          required: true,
          collectionId: collection.id,
          maxSelect: 1,
        },
        {
          name: 'product_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('products').id,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(items)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('catalog_items'))
    app.delete(app.findCollectionByNameOrId('catalogs'))
  },
)
