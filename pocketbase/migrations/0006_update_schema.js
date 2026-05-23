migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('companies')

    if (!col.fields.getByName('cnpj')) col.fields.add(new TextField({ name: 'cnpj' }))
    if (!col.fields.getByName('cep')) col.fields.add(new TextField({ name: 'cep' }))
    if (!col.fields.getByName('address')) col.fields.add(new TextField({ name: 'address' }))
    if (!col.fields.getByName('number')) col.fields.add(new TextField({ name: 'number' }))
    if (!col.fields.getByName('complement')) col.fields.add(new TextField({ name: 'complement' }))
    if (!col.fields.getByName('neighborhood'))
      col.fields.add(new TextField({ name: 'neighborhood' }))
    if (!col.fields.getByName('city')) col.fields.add(new TextField({ name: 'city' }))
    if (!col.fields.getByName('state')) col.fields.add(new TextField({ name: 'state' }))
    if (!col.fields.getByName('phone')) col.fields.add(new TextField({ name: 'phone' }))
    if (!col.fields.getByName('whatsapp')) col.fields.add(new TextField({ name: 'whatsapp' }))
    if (!col.fields.getByName('is_headquarters'))
      col.fields.add(new BoolField({ name: 'is_headquarters' }))
    if (!col.fields.getByName('market_segment'))
      col.fields.add(new TextField({ name: 'market_segment' }))
    if (!col.fields.getByName('social_links'))
      col.fields.add(new JSONField({ name: 'social_links' }))

    const usersId = '_pb_users_auth_'
    if (!col.fields.getByName('parent_company_id'))
      col.fields.add(
        new RelationField({ name: 'parent_company_id', collectionId: col.id, maxSelect: 1 }),
      )
    if (!col.fields.getByName('cobranded_id'))
      col.fields.add(
        new RelationField({ name: 'cobranded_id', collectionId: usersId, maxSelect: 1 }),
      )
    if (!col.fields.getByName('affiliate_id'))
      col.fields.add(
        new RelationField({ name: 'affiliate_id', collectionId: usersId, maxSelect: 1 }),
      )

    app.save(col)

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

    const collection = new Collection({
      name: 'bin_logs',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'company_id',
          type: 'relation',
          required: true,
          collectionId: col.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'old_prefix', type: 'text' },
        { name: 'new_prefix', type: 'text' },
        {
          name: 'user_id',
          type: 'relation',
          collectionId: usersId,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId('bin_logs')
      app.delete(collection)
    } catch (_) {}

    const col = app.findCollectionByNameOrId('companies')
    ;[
      'cnpj',
      'cep',
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
      'social_links',
      'parent_company_id',
      'cobranded_id',
      'affiliate_id',
    ].forEach((f) => {
      if (col.fields.getByName(f)) col.fields.removeByName(f)
    })
    col.removeIndex('idx_companies_cnpj')
    app.save(col)
  },
)
