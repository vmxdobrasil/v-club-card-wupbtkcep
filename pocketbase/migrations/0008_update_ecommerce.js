migrate(
  (app) => {
    let products
    try {
      products = app.findCollectionByNameOrId('products')
    } catch (_) {
      products = new Collection({
        name: 'products',
        type: 'base',
        listRule: '',
        viewRule: '',
        createRule: "@request.auth.id != ''",
        updateRule: '',
        deleteRule: '',
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'description', type: 'text' },
          {
            name: 'image',
            type: 'file',
            maxSelect: 1,
            maxSize: 5242880,
            mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
          },
          { name: 'stock_status', type: 'select', values: ['in_stock', 'out_of_stock'] },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(products)
    }

    if (!products.fields.getByName('company_id')) {
      try {
        const companiesId = app.findCollectionByNameOrId('companies').id
        products.fields.add(
          new RelationField({ name: 'company_id', collectionId: companiesId, maxSelect: 1 }),
        )
      } catch (_) {}
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

    let catalogs
    try {
      catalogs = app.findCollectionByNameOrId('catalogs')
    } catch (_) {
      catalogs = new Collection({
        name: 'catalogs',
        type: 'base',
        listRule: '',
        viewRule: '',
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'status', type: 'select', values: ['active', 'inactive'] },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(catalogs)
    }

    if (!catalogs.fields.getByName('company_id')) {
      try {
        const companiesId = app.findCollectionByNameOrId('companies').id
        catalogs.fields.add(
          new RelationField({ name: 'company_id', collectionId: companiesId, maxSelect: 1 }),
        )
      } catch (_) {}
    }

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
