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
  },
  (app) => {
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
  },
)
