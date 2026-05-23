migrate(
  (app) => {
    // 1. Add company fields
    const col = app.findCollectionByNameOrId('companies')
    if (!col.fields.getByName('zip_code')) col.fields.add(new TextField({ name: 'zip_code' }))
    if (!col.fields.getByName('address_street'))
      col.fields.add(new TextField({ name: 'address_street' }))
    if (!col.fields.getByName('address_number'))
      col.fields.add(new TextField({ name: 'address_number' }))
    if (!col.fields.getByName('address_neighborhood'))
      col.fields.add(new TextField({ name: 'address_neighborhood' }))
    if (!col.fields.getByName('address_city'))
      col.fields.add(new TextField({ name: 'address_city' }))
    if (!col.fields.getByName('address_state'))
      col.fields.add(new TextField({ name: 'address_state' }))
    if (!col.fields.getByName('parent_id'))
      col.fields.add(new RelationField({ name: 'parent_id', collectionId: col.id, maxSelect: 1 }))
    if (!col.fields.getByName('complement')) col.fields.add(new TextField({ name: 'complement' }))
    if (!col.fields.getByName('phone')) col.fields.add(new TextField({ name: 'phone' }))
    if (!col.fields.getByName('whatsapp')) col.fields.add(new TextField({ name: 'whatsapp' }))
    if (!col.fields.getByName('is_headquarters'))
      col.fields.add(new BoolField({ name: 'is_headquarters' }))
    if (!col.fields.getByName('market_segment'))
      col.fields.add(new TextField({ name: 'market_segment' }))
    if (!col.fields.getByName('cobranded_id'))
      col.fields.add(
        new RelationField({ name: 'cobranded_id', collectionId: '_pb_users_auth_', maxSelect: 1 }),
      )
    if (!col.fields.getByName('affiliate_id'))
      col.fields.add(
        new RelationField({ name: 'affiliate_id', collectionId: '_pb_users_auth_', maxSelect: 1 }),
      )
    if (!col.fields.getByName('is_partner')) col.fields.add(new BoolField({ name: 'is_partner' }))
    app.save(col)

    // 2. Create products and catalogs
    const usersId = '_pb_users_auth_'
    const companiesId = col.id

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
        {
          name: 'status',
          type: 'select',
          values: ['active', 'inactive'],
          maxSelect: 1,
          required: true,
        },
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
        {
          name: 'company_id',
          type: 'relation',
          collectionId: companiesId,
          required: true,
          maxSelect: 1,
        },
        { name: 'items', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(catalogs)

    // 3. Create bin_audit_logs
    const binAuditLogs = new Collection({
      name: 'bin_audit_logs',
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
          cascadeDelete: true,
        },
        { name: 'old_prefix', type: 'text' },
        { name: 'new_prefix', type: 'text' },
        {
          name: 'changed_by',
          type: 'relation',
          collectionId: usersId,
          required: true,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(binAuditLogs)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('bin_audit_logs'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('catalogs'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('company_products'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('products'))
    } catch (_) {}

    try {
      const col = app.findCollectionByNameOrId('companies')
      col.fields.removeByName('zip_code')
      col.fields.removeByName('address_street')
      col.fields.removeByName('address_number')
      col.fields.removeByName('address_neighborhood')
      col.fields.removeByName('address_city')
      col.fields.removeByName('address_state')
      col.fields.removeByName('parent_id')
      col.fields.removeByName('complement')
      col.fields.removeByName('phone')
      col.fields.removeByName('whatsapp')
      col.fields.removeByName('is_headquarters')
      col.fields.removeByName('market_segment')
      col.fields.removeByName('cobranded_id')
      col.fields.removeByName('affiliate_id')
      col.fields.removeByName('is_partner')
      app.save(col)
    } catch (_) {}
  },
)
