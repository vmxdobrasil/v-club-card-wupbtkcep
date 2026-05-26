migrate(
  (app) => {
    const products = app.findCollectionByNameOrId('products')

    if (!products.fields.getByName('company_id')) {
      products.fields.add(
        new RelationField({
          name: 'company_id',
          collectionId: app.findCollectionByNameOrId('companies').id,
          maxSelect: 1,
        }),
      )
    }
    if (!products.fields.getByName('price')) {
      products.fields.add(new NumberField({ name: 'price' }))
    }
    if (!products.fields.getByName('category')) {
      products.fields.add(new TextField({ name: 'category' }))
    }
    if (!products.fields.getByName('embedding')) {
      products.fields.add(new VectorField({ name: 'embedding', dimensions: 1536 }))
    }

    products.updateRule = "@request.auth.role = 'master' || company_id.owner_id = @request.auth.id"
    products.deleteRule = "@request.auth.role = 'master' || company_id.owner_id = @request.auth.id"

    app.save(products)

    const catalogs = app.findCollectionByNameOrId('catalogs')
    if (!catalogs.fields.getByName('products')) {
      catalogs.fields.add(
        new RelationField({ name: 'products', collectionId: products.id, maxSelect: 2000 }),
      )
    }
    app.save(catalogs)
  },
  (app) => {
    // Revert is not implemented for additive schema updates
  },
)
