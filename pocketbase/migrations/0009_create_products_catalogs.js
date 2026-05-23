migrate(
  (app) => {
    const usersId = '_pb_users_auth_'
    const companiesId = app.findCollectionByNameOrId('companies').id

    const products = new Collection({
      name: 'products',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'master' || @request.auth.role = 'partner'",
      updateRule:
        "@request.auth.role = 'master' || (@request.auth.role = 'partner' && partner_id = @request.auth.id)",
      deleteRule:
        "@request.auth.role = 'master' || (@request.auth.role = 'partner' && partner_id = @request.auth.id)",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'price', type: 'number', required: true },
        { name: 'status', type: 'select', values: ['active', 'inactive'], required: true },
        { name: 'partner_id', type: 'relation', collectionId: usersId, maxSelect: 1 },
        {
          name: 'image',
          type: 'file',
          maxSelect: 1,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
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
          collectionId: companiesId,
          required: true,
          maxSelect: 1,
        },
        {
          name: 'product_id',
          type: 'relation',
          collectionId: products.id,
          required: true,
          maxSelect: 1,
        },
        { name: 'custom_price', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(companyProducts)

    const binLogs = new Collection({
      name: 'bin_logs',
      type: 'base',
      listRule: "@request.auth.role = 'master'",
      viewRule: "@request.auth.role = 'master'",
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        {
          name: 'company_id',
          type: 'relation',
          collectionId: companiesId,
          required: true,
          maxSelect: 1,
        },
        { name: 'old_bin', type: 'text' },
        { name: 'new_bin', type: 'text' },
        { name: 'changed_by', type: 'relation', collectionId: usersId, maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(binLogs)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('bin_logs'))
    app.delete(app.findCollectionByNameOrId('company_products'))
    app.delete(app.findCollectionByNameOrId('products'))
  },
)
