migrate(
  (app) => {
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
    const productsCol = new Collection({
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

    // 3. Create company_products
    const companyProductsCol = new Collection({
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

    // 4. Create bin_prefix_history
    const binPrefixHistoryCol = new Collection({
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

    // 5. Create catalogs
    const catalogsCol = new Collection({
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

    // 6. Create catalog_items
    const catalogItemsCol = new Collection({
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
  },
  (app) => {
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
