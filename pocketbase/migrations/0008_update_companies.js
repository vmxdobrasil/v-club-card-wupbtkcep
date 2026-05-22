migrate(
  (app) => {
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

    // Remove old fields if they exist
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
  },
  (app) => {
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
      col.fields.removeByName(f)
    }

    app.save(col)
  },
)
