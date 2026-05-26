migrate(
  (app) => {
    const companyCol = app.findCollectionByNameOrId('companies')
    const productCol = app.findCollectionByNameOrId('products')

    const collection = new Collection({
      name: 'company_products',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'master'",
      updateRule: "@request.auth.role = 'master'",
      deleteRule: "@request.auth.role = 'master'",
      fields: [
        {
          name: 'company_id',
          type: 'relation',
          required: true,
          collectionId: companyCol.id,
          maxSelect: 1,
        },
        {
          name: 'product_id',
          type: 'relation',
          required: true,
          collectionId: productCol.id,
          maxSelect: 1,
        },
        { name: 'status', type: 'select', values: ['active', 'inactive'], required: false },
        { name: 'custom_price', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('company_products')
    app.delete(collection)
  },
)
