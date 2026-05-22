migrate(
  (app) => {
    const products = new Collection({
      name: 'products',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'master' || @request.auth.role = 'partner'",
      updateRule: "@request.auth.role = 'master' || @request.auth.role = 'partner'",
      deleteRule: "@request.auth.role = 'master' || @request.auth.role = 'partner'",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'base_price', type: 'number' },
        { name: 'status', type: 'select', values: ['active', 'inactive'], required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(products)

    const companyProducts = new Collection({
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
          collectionId: app.findCollectionByNameOrId('companies').id,
          maxSelect: 1,
        },
        {
          name: 'product_id',
          type: 'relation',
          required: true,
          collectionId: products.id,
          maxSelect: 1,
        },
        { name: 'custom_price', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(companyProducts)

    if (!app.hasTable('catalogs')) {
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
          { name: 'status', type: 'select', values: ['active', 'inactive'] },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(catalogs)
    }

    if (!app.hasTable('catalog_items')) {
      const catalogItems = new Collection({
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
            collectionId: app.findCollectionByNameOrId('catalogs').id,
            maxSelect: 1,
          },
          {
            name: 'product_id',
            type: 'relation',
            required: true,
            collectionId: products.id,
            maxSelect: 1,
          },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(catalogItems)
    }
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('company_products'))
    app.delete(app.findCollectionByNameOrId('products'))
    try {
      app.delete(app.findCollectionByNameOrId('catalog_items'))
      app.delete(app.findCollectionByNameOrId('catalogs'))
    } catch (e) {}
  },
)
