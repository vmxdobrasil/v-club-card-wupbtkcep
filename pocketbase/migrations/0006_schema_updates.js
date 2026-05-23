migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('companies')

    // Remove empty/duplicate bin_prefix and cnpj to ensure unique indexes can be created
    app
      .db()
      .newQuery(
        `DELETE FROM companies WHERE id NOT IN (SELECT MIN(id) FROM companies GROUP BY bin_prefix) AND bin_prefix != ''`,
      )
      .execute()
    app
      .db()
      .newQuery(
        `DELETE FROM companies WHERE id NOT IN (SELECT MIN(id) FROM companies GROUP BY cnpj) AND cnpj != '' AND cnpj IS NOT NULL`,
      )
      .execute()

    // New text fields
    if (!col.fields.getByName('cnpj'))
      col.fields.add(new TextField({ name: 'cnpj', required: true }))
    if (!col.fields.getByName('zip_code')) col.fields.add(new TextField({ name: 'zip_code' }))
    if (!col.fields.getByName('address')) col.fields.add(new TextField({ name: 'address' }))
    if (!col.fields.getByName('phone')) col.fields.add(new TextField({ name: 'phone' }))
    if (!col.fields.getByName('whatsapp')) col.fields.add(new TextField({ name: 'whatsapp' }))
    if (!col.fields.getByName('market_segment'))
      col.fields.add(new TextField({ name: 'market_segment' }))

    // Hierarchy
    if (!col.fields.getByName('is_headquarters'))
      col.fields.add(new BoolField({ name: 'is_headquarters' }))
    if (!col.fields.getByName('parent_company_id'))
      col.fields.add(
        new RelationField({ name: 'parent_company_id', collectionId: col.id, maxSelect: 1 }),
      )

    // Ecosystem
    if (!col.fields.getByName('cobranded_id'))
      col.fields.add(
        new RelationField({ name: 'cobranded_id', collectionId: '_pb_users_auth_', maxSelect: 1 }),
      )
    if (!col.fields.getByName('affiliate_id'))
      col.fields.add(
        new RelationField({ name: 'affiliate_id', collectionId: '_pb_users_auth_', maxSelect: 1 }),
      )

    // Remove old legacy fields to avoid confusion (they will be dropped from schema)
    const legacyFields = ['is_matrix', 'matrix_id', 'co_manager_id', 'partner_id']
    for (const f of legacyFields) {
      if (col.fields.getByName(f)) col.fields.removeByName(f)
    }

    // Create unique indexes
    try {
      col.addIndex('idx_companies_cnpj', true, 'cnpj', "cnpj != ''")
      col.addIndex('idx_companies_bin', true, 'bin_prefix', "bin_prefix != ''")
    } catch (err) {
      console.log('Index creation bypassed:', err.message)
    }

    app.save(col)

    // Products Collection
    try {
      app.findCollectionByNameOrId('products')
    } catch (_) {
      const products = new Collection({
        name: 'products',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.role = 'master' || @request.auth.role = 'partner'",
        updateRule: "@request.auth.role = 'master' || @request.auth.role = 'partner'",
        deleteRule: "@request.auth.role = 'master'",
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'description', type: 'text' },
          { name: 'base_price', type: 'number' },
          { name: 'status', type: 'select', values: ['active', 'inactive'], required: true },
          { name: 'partner_id', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(products)
    }

    // Company Products Collection (Catalog assignment)
    try {
      app.findCollectionByNameOrId('company_products')
    } catch (_) {
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
            collectionId: app.findCollectionByNameOrId('companies').id,
            required: true,
            maxSelect: 1,
          },
          {
            name: 'product_id',
            type: 'relation',
            collectionId: app.findCollectionByNameOrId('products').id,
            required: true,
            maxSelect: 1,
          },
          { name: 'custom_price', type: 'number' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(companyProducts)
    }

    // Audit Logs Collection
    try {
      app.findCollectionByNameOrId('audit_logs')
    } catch (_) {
      const logs = new Collection({
        name: 'audit_logs',
        type: 'base',
        listRule: "@request.auth.role = 'master'",
        viewRule: "@request.auth.role = 'master'",
        createRule: null, // Hook-only
        updateRule: null,
        deleteRule: null,
        fields: [
          { name: 'action', type: 'text', required: true },
          { name: 'collection_name', type: 'text', required: true },
          { name: 'record_id', type: 'text', required: true },
          { name: 'user_id', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
          { name: 'details', type: 'json' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(logs)
    }
  },
  (app) => {
    // Not implemented
  },
)
