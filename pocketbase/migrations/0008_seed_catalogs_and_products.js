migrate(
  (app) => {
    // 1. Create collections
    const catalogs = new Collection({
      name: 'catalogs',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'master'",
      updateRule: "@request.auth.role = 'master'",
      deleteRule: "@request.auth.role = 'master'",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text' },
        {
          name: 'company_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('companies').id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['active', 'inactive'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(catalogs)

    const products = new Collection({
      name: 'products',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'master'",
      updateRule: "@request.auth.role = 'master'",
      deleteRule: "@request.auth.role = 'master'",
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
          name: 'catalog_id',
          type: 'relation',
          required: true,
          collectionId: catalogs.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['active', 'inactive'],
          maxSelect: 1,
        },
        { name: 'sort_order', type: 'number', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_products_sort_order ON products (sort_order)'],
    })
    app.save(products)

    // 2. Seed data
    const companies = app.findRecordsByFilter('companies', '1=1', '', 1, 0)
    if (companies.length === 0) return
    const company = companies[0]

    let catalog
    try {
      catalog = app.findFirstRecordByData('catalogs', 'name', 'Summer Essentials')
    } catch (_) {
      catalog = new Record(catalogs)
      catalog.set('name', 'Summer Essentials')
      catalog.set('description', 'Best products for summer season')
      catalog.set('company_id', company.id)
      catalog.set('status', 'active')
      app.save(catalog)
    }

    const productsData = [
      { name: 'Sunscreen SPF 50', price: 19.99, sort: 1 },
      { name: 'Aloe Vera Gel', price: 9.99, sort: 2 },
      { name: 'Sunglasses', price: 29.99, sort: 3 },
    ]

    for (const p of productsData) {
      try {
        app.findFirstRecordByData('products', 'name', p.name)
      } catch (_) {
        const prod = new Record(products)
        prod.set('name', p.name)
        prod.set('description', 'A great summer product')
        prod.set('price', p.price)
        prod.set('catalog_id', catalog.id)
        prod.set('status', 'active')
        prod.set('sort_order', p.sort)
        app.save(prod)
      }
    }
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('products'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('catalogs'))
    } catch (_) {}
  },
)
