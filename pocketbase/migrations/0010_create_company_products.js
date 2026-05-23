migrate(
  (app) => {
    const products = app.findCollectionByNameOrId('products')
    const companies = app.findCollectionByNameOrId('companies')

    const collection = new Collection({
      name: 'company_products',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'master' || @request.auth.role = 'company'",
      updateRule: "@request.auth.role = 'master' || @request.auth.role = 'company'",
      deleteRule: "@request.auth.role = 'master' || @request.auth.role = 'company'",
      fields: [
        {
          name: 'company_id',
          type: 'relation',
          collectionId: companies.id,
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
