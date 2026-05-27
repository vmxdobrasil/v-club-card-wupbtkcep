migrate(
  (app) => {
    const companies = app.findCollectionByNameOrId('companies')

    const products = new Collection({
      name: 'products',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'price', type: 'number', required: true },
        {
          name: 'image',
          type: 'file',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
        {
          name: 'company_id',
          type: 'relation',
          required: true,
          collectionId: companies.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'stock_status',
          type: 'select',
          values: ['in_stock', 'out_of_stock'],
          required: true,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(products)

    const catalogs = new Collection({
      name: 'catalogs',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text' },
        {
          name: 'company_id',
          type: 'relation',
          required: true,
          collectionId: companies.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'status', type: 'select', values: ['active', 'inactive'], required: true },
        {
          name: 'products',
          type: 'relation',
          required: false,
          collectionId: products.id,
          cascadeDelete: false,
          maxSelect: 100,
        },
        { name: 'vector', type: 'vector', dimensions: 1536, distance: 'cosine' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(catalogs)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('catalogs'))
    } catch (e) {}
    try {
      app.delete(app.findCollectionByNameOrId('products'))
    } catch (e) {}
  },
)
