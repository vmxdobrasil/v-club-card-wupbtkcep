migrate(
  (app) => {
    // === 1. Update companies ===
    const col = app.findCollectionByNameOrId('companies')

    const addField = (field) => {
      if (!col.fields.getByName(field.name)) col.fields.add(field)
    }

    addField(new TextField({ name: 'cnpj' }))
    addField(new TextField({ name: 'address' }))
    addField(new TextField({ name: 'zip_code' }))
    addField(new TextField({ name: 'phone' }))
    addField(new TextField({ name: 'whatsapp' }))
    addField(new BoolField({ name: 'is_matrix' }))
    addField(new RelationField({ name: 'matrix_id', collectionId: col.id, maxSelect: 1 }))
    addField(new TextField({ name: 'market_segment' }))
    addField(
      new RelationField({ name: 'co_manager_id', collectionId: '_pb_users_auth_', maxSelect: 1 }),
    )
    addField(
      new RelationField({ name: 'partner_id', collectionId: '_pb_users_auth_', maxSelect: 1 }),
    )
    addField(new JSONField({ name: 'change_log' }))

    const oldFields = ['is_headquarters', 'parent_company_id', 'co_manager', 'partner_affiliate']
    for (const f of oldFields) {
      if (col.fields.getByName(f)) col.fields.removeByName(f)
    }

    app.save(col)

    // Give existing records a fake unique CNPJ and set them as Matrix to pass validation safely
    app
      .db()
      .newQuery(
        "UPDATE companies SET cnpj = '00.000.000/' || substr(id, 1, 4) || '-' || substr(id, 5, 2) WHERE cnpj IS NULL OR cnpj = ''",
      )
      .execute()
    app
      .db()
      .newQuery('UPDATE companies SET is_matrix = 1 WHERE is_matrix IS NULL OR is_matrix = 0')
      .execute()

    const col2 = app.findCollectionByNameOrId('companies')
    const cnpjField = col2.fields.getByName('cnpj')
    if (cnpjField) {
      cnpjField.required = true
    }
    app.save(col2)

    col2.addIndex('idx_companies_cnpj', true, 'cnpj', '')
    col2.addIndex('idx_companies_bin', true, 'bin_prefix', '')
    app.save(col2)

    // === 2. Create products and catalogs ===
    let products
    if (!app.hasTable('products')) {
      products = new Collection({
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
    } else {
      products = app.findCollectionByNameOrId('products')
    }

    if (!app.hasTable('company_products')) {
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
            collectionId: col2.id,
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
    }

    let catalogs
    if (!app.hasTable('catalogs')) {
      catalogs = new Collection({
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
    } else {
      catalogs = app.findCollectionByNameOrId('catalogs')
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
            collectionId: catalogs.id,
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
    try {
      app.delete(app.findCollectionByNameOrId('company_products'))
    } catch (e) {}
    try {
      app.delete(app.findCollectionByNameOrId('catalog_items'))
    } catch (e) {}
    try {
      app.delete(app.findCollectionByNameOrId('catalogs'))
    } catch (e) {}
    try {
      app.delete(app.findCollectionByNameOrId('products'))
    } catch (e) {}

    try {
      const col = app.findCollectionByNameOrId('companies')
      col.removeIndex('idx_companies_cnpj')
      col.removeIndex('idx_companies_bin')

      const newFields = [
        'cnpj',
        'address',
        'zip_code',
        'phone',
        'whatsapp',
        'is_matrix',
        'matrix_id',
        'market_segment',
        'co_manager_id',
        'partner_id',
        'change_log',
      ]
      for (const f of newFields) {
        if (col.fields.getByName(f)) col.fields.removeByName(f)
      }

      app.save(col)
    } catch (e) {}
  },
)
