migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('companies')
    col.fields.add(new TextField({ name: 'cnpj' }))
    col.fields.add(new TextField({ name: 'zip_code' }))
    col.fields.add(new TextField({ name: 'address' }))
    col.fields.add(new TextField({ name: 'number' }))
    col.fields.add(new TextField({ name: 'complement' }))
    col.fields.add(new TextField({ name: 'neighborhood' }))
    col.fields.add(new TextField({ name: 'city' }))
    col.fields.add(new TextField({ name: 'state' }))
    col.fields.add(new TextField({ name: 'phone' }))
    col.fields.add(new TextField({ name: 'whatsapp' }))
    col.fields.add(new BoolField({ name: 'is_headquarters' }))
    col.fields.add(new TextField({ name: 'market_segment' }))

    const usersId = '_pb_users_auth_'
    col.fields.add(new RelationField({ name: 'parent_id', collectionId: col.id, maxSelect: 1 }))
    col.fields.add(new RelationField({ name: 'cobranded_id', collectionId: usersId, maxSelect: 1 }))
    col.fields.add(new RelationField({ name: 'affiliate_id', collectionId: usersId, maxSelect: 1 }))

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
          collectionId: col.id,
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
