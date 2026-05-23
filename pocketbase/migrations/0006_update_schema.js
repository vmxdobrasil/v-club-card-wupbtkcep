migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('companies')
    const usersId = '_pb_users_auth_'

    const fieldsToAdd = [
      new TextField({ name: 'cnpj' }),
      new TextField({ name: 'zip_code' }),
      new TextField({ name: 'address' }),
      new TextField({ name: 'number' }),
      new TextField({ name: 'complement' }),
      new TextField({ name: 'neighborhood' }),
      new TextField({ name: 'city' }),
      new TextField({ name: 'state' }),
      new TextField({ name: 'phone' }),
      new TextField({ name: 'whatsapp' }),
      new BoolField({ name: 'is_headquarters' }),
      new TextField({ name: 'market_segment' }),
      new RelationField({ name: 'parent_id', collectionId: col.id, maxSelect: 1 }),
      new RelationField({ name: 'cobranded_id', collectionId: usersId, maxSelect: 1 }),
      new RelationField({ name: 'affiliate_id', collectionId: usersId, maxSelect: 1 }),
    ]

    fieldsToAdd.forEach((f) => {
      if (!col.fields.getByName(f.name)) {
        col.fields.add(f)
      }
    })

    app.save(col)

    // De-duplicate if needed before index creation (though normally cnpj is empty on existing records)
    app
      .db()
      .newQuery(`
    DELETE FROM companies WHERE id NOT IN (
      SELECT MIN(id) FROM companies GROUP BY cnpj
    ) AND cnpj IS NOT NULL AND cnpj != ''
  `)
      .execute()

    col.addIndex('idx_companies_cnpj', true, 'cnpj', "cnpj != ''")
    app.save(col)

    try {
      app.findCollectionByNameOrId('products')
    } catch (_) {
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
    }

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
            collectionId: col.id,
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

    try {
      app.findCollectionByNameOrId('bin_logs')
    } catch (_) {
      const binLogs = new Collection({
        name: 'bin_logs',
        type: 'base',
        listRule: "@request.auth.role = 'master'",
        viewRule: "@request.auth.role = 'master'",
        createRule: null,
        updateRule: null,
        deleteRule: null,
        fields: [
          {
            name: 'company_id',
            type: 'relation',
            collectionId: col.id,
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
    }
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('bin_logs'))
    } catch (e) {}
    try {
      app.delete(app.findCollectionByNameOrId('company_products'))
    } catch (e) {}
    try {
      app.delete(app.findCollectionByNameOrId('products'))
    } catch (e) {}

    try {
      const col = app.findCollectionByNameOrId('companies')
      ;[
        'cnpj',
        'zip_code',
        'address',
        'number',
        'complement',
        'neighborhood',
        'city',
        'state',
        'phone',
        'whatsapp',
        'is_headquarters',
        'market_segment',
        'parent_id',
        'cobranded_id',
        'affiliate_id',
      ].forEach((f) => col.fields.removeByName(f))
      col.removeIndex('idx_companies_cnpj')
      app.save(col)
    } catch (e) {}
  },
)
