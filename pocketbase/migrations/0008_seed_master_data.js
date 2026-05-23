migrate(
  (app) => {
    // --- SCHEMA UPDATES ---
    // 1. Update companies
    const companiesCol = app.findCollectionByNameOrId('companies')
    if (!companiesCol.fields.getByName('parent_company_id')) {
      companiesCol.fields.add(
        new RelationField({
          name: 'parent_company_id',
          collectionId: companiesCol.id,
          maxSelect: 1,
        }),
      )
    }
    if (!companiesCol.fields.getByName('cep'))
      companiesCol.fields.add(new TextField({ name: 'cep' }))
    if (!companiesCol.fields.getByName('address'))
      companiesCol.fields.add(new TextField({ name: 'address' }))
    if (!companiesCol.fields.getByName('number'))
      companiesCol.fields.add(new TextField({ name: 'number' }))
    if (!companiesCol.fields.getByName('neighborhood'))
      companiesCol.fields.add(new TextField({ name: 'neighborhood' }))
    if (!companiesCol.fields.getByName('city'))
      companiesCol.fields.add(new TextField({ name: 'city' }))
    if (!companiesCol.fields.getByName('state'))
      companiesCol.fields.add(new TextField({ name: 'state' }))
    if (!companiesCol.fields.getByName('complement'))
      companiesCol.fields.add(new TextField({ name: 'complement' }))
    app.save(companiesCol)

    // 2. Create products
    let productsCol
    try {
      productsCol = app.findCollectionByNameOrId('products')
    } catch (_) {
      productsCol = new Collection({
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
            name: 'partner_id',
            type: 'relation',
            required: false,
            collectionId: '_pb_users_auth_',
            maxSelect: 1,
          },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(productsCol)
    }

    // 3. Create company_products
    let companyProductsCol
    try {
      companyProductsCol = app.findCollectionByNameOrId('company_products')
    } catch (_) {
      companyProductsCol = new Collection({
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
            collectionId: companiesCol.id,
            maxSelect: 1,
          },
          {
            name: 'product_id',
            type: 'relation',
            required: true,
            collectionId: productsCol.id,
            maxSelect: 1,
          },
          { name: 'status', type: 'select', values: ['active', 'inactive'], required: false },
          { name: 'custom_price', type: 'number' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(companyProductsCol)
    }

    // 4. Create bin_prefix_history
    let binPrefixHistoryCol
    try {
      binPrefixHistoryCol = app.findCollectionByNameOrId('bin_prefix_history')
    } catch (_) {
      binPrefixHistoryCol = new Collection({
        name: 'bin_prefix_history',
        type: 'base',
        listRule: "@request.auth.role = 'master' || @request.auth.role = 'company'",
        viewRule: "@request.auth.role = 'master' || @request.auth.role = 'company'",
        createRule: null,
        updateRule: null,
        deleteRule: null,
        fields: [
          {
            name: 'company_id',
            type: 'relation',
            required: true,
            collectionId: companiesCol.id,
            maxSelect: 1,
          },
          { name: 'old_prefix', type: 'text' },
          { name: 'new_prefix', type: 'text' },
          {
            name: 'changed_by',
            type: 'relation',
            required: false,
            collectionId: '_pb_users_auth_',
            maxSelect: 1,
          },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(binPrefixHistoryCol)
    }

    // 5. Create catalogs
    let catalogsCol
    try {
      catalogsCol = app.findCollectionByNameOrId('catalogs')
    } catch (_) {
      catalogsCol = new Collection({
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
            collectionId: companiesCol.id,
            maxSelect: 1,
          },
          { name: 'product_links', type: 'json' },
          { name: 'status', type: 'select', values: ['active', 'inactive'] },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(catalogsCol)
    }

    // 6. Create catalog_items
    let catalogItemsCol
    try {
      catalogItemsCol = app.findCollectionByNameOrId('catalog_items')
    } catch (_) {
      catalogItemsCol = new Collection({
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
            collectionId: catalogsCol.id,
            maxSelect: 1,
          },
          {
            name: 'product_id',
            type: 'relation',
            required: true,
            collectionId: productsCol.id,
            maxSelect: 1,
          },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(catalogItemsCol)
    }

    // --- SEED DATA ---

    // Seed Matrix 1
    let matrix1
    try {
      matrix1 = app.findFirstRecordByData('companies', 'cnpj', '00.000.000/0001-01')
    } catch (_) {
      matrix1 = new Record(companiesCol)
      matrix1.set('name', 'Matrix Alpha Corp')
      matrix1.set('cnpj', '00.000.000/0001-01')
      matrix1.set('bin_prefix', '123456')
      matrix1.set('commission_rate', 5)
      matrix1.set('modality', 'both')
      matrix1.set('gateway_provider', 'Asaas')
      matrix1.set('status', 'active')
      matrix1.set('is_headquarters', true)
      app.save(matrix1)
    }

    // Seed Matrix 2
    let matrix2
    try {
      matrix2 = app.findFirstRecordByData('companies', 'cnpj', '11.111.111/0001-11')
    } catch (_) {
      matrix2 = new Record(companiesCol)
      matrix2.set('name', 'Matrix Beta Inc')
      matrix2.set('cnpj', '11.111.111/0001-11')
      matrix2.set('bin_prefix', '654321')
      matrix2.set('commission_rate', 3)
      matrix2.set('modality', '1')
      matrix2.set('gateway_provider', 'Alternative')
      matrix2.set('status', 'active')
      matrix2.set('is_headquarters', true)
      app.save(matrix2)
    }

    // Seed Branch 1
    try {
      app.findFirstRecordByData('companies', 'cnpj', '00.000.000/0002-02')
    } catch (_) {
      const branch1 = new Record(companiesCol)
      branch1.set('name', 'Alpha Branch SP')
      branch1.set('cnpj', '00.000.000/0002-02')
      branch1.set('bin_prefix', '123456')
      branch1.set('commission_rate', 5)
      branch1.set('modality', 'both')
      branch1.set('gateway_provider', 'Asaas')
      branch1.set('status', 'active')
      branch1.set('is_headquarters', false)
      branch1.set('parent_company_id', matrix1.id)
      app.save(branch1)
    }

    // Seed Branch 2
    try {
      app.findFirstRecordByData('companies', 'cnpj', '00.000.000/0003-03')
    } catch (_) {
      const branch2 = new Record(companiesCol)
      branch2.set('name', 'Alpha Branch RJ')
      branch2.set('cnpj', '00.000.000/0003-03')
      branch2.set('bin_prefix', '123456')
      branch2.set('commission_rate', 5)
      branch2.set('modality', 'both')
      branch2.set('gateway_provider', 'Asaas')
      branch2.set('status', 'active')
      branch2.set('is_headquarters', false)
      branch2.set('parent_company_id', matrix1.id)
      app.save(branch2)
    }

    // Seed Branch 3
    try {
      app.findFirstRecordByData('companies', 'cnpj', '11.111.111/0002-22')
    } catch (_) {
      const branch3 = new Record(companiesCol)
      branch3.set('name', 'Beta Branch Sul')
      branch3.set('cnpj', '11.111.111/0002-22')
      branch3.set('bin_prefix', '654321')
      branch3.set('commission_rate', 3)
      branch3.set('modality', '1')
      branch3.set('gateway_provider', 'Alternative')
      branch3.set('status', 'active')
      branch3.set('is_headquarters', false)
      branch3.set('parent_company_id', matrix2.id)
      app.save(branch3)
    }

    // Seed Products
    const sampleProducts = [
      { name: 'Corporate Credit Card', description: 'Standard card', price: 10.0 },
      { name: 'Premium Credit Card', description: 'Premium card with perks', price: 25.0 },
      { name: 'Payroll Advance', description: 'Consigned loan', price: 5.0 },
      { name: 'Meal Voucher', description: 'Meal allowance', price: 0.0 },
      { name: 'Fuel Voucher', description: 'Fuel allowance', price: 0.0 },
    ]

    sampleProducts.forEach((p) => {
      try {
        app.findFirstRecordByData('products', 'name', p.name)
      } catch (_) {
        const prod = new Record(productsCol)
        prod.set('name', p.name)
        prod.set('description', p.description)
        prod.set('price', p.price)
        app.save(prod)
      }
    })

    // Seed BIN History
    try {
      app.findFirstRecordByData('bin_prefix_history', 'company_id', matrix1.id)
    } catch (_) {
      const history1 = new Record(binPrefixHistoryCol)
      history1.set('company_id', matrix1.id)
      history1.set('old_prefix', '111111')
      history1.set('new_prefix', '123456')
      app.saveNoValidate(history1)
    }
  },
  (app) => {
    // Safe down
    try {
      app.delete(app.findCollectionByNameOrId('catalog_items'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('catalogs'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('bin_prefix_history'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('company_products'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('products'))
    } catch (_) {}

    try {
      const col = app.findCollectionByNameOrId('companies')
      col.fields.removeByName('parent_company_id')
      col.fields.removeByName('cep')
      col.fields.removeByName('address')
      col.fields.removeByName('number')
      col.fields.removeByName('neighborhood')
      col.fields.removeByName('city')
      col.fields.removeByName('state')
      col.fields.removeByName('complement')
      app.save(col)
    } catch (_) {}
  },
)
