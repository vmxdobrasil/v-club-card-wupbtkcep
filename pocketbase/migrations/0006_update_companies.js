migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('companies')

    col.fields.add(new TextField({ name: 'cnpj' }))
    col.fields.add(new TextField({ name: 'address' }))
    col.fields.add(new TextField({ name: 'zip_code' }))
    col.fields.add(new TextField({ name: 'phone' }))
    col.fields.add(new TextField({ name: 'whatsapp' }))
    col.fields.add(new BoolField({ name: 'is_headquarters' }))
    col.fields.add(
      new RelationField({ name: 'parent_company_id', collectionId: col.id, maxSelect: 1 }),
    )
    col.fields.add(new TextField({ name: 'market_segment' }))
    col.fields.add(new TextField({ name: 'co_manager' }))
    col.fields.add(new TextField({ name: 'partner_affiliate' }))

    app.save(col)

    // Give existing records a fake unique CNPJ and set them as Headquarters to pass validation and constraints safely
    app
      .db()
      .newQuery(
        "UPDATE companies SET cnpj = '00.000.000/' || substr(id, 1, 4) || '-' || substr(id, 5, 2) WHERE cnpj IS NULL OR cnpj = ''",
      )
      .execute()
    app
      .db()
      .newQuery(
        'UPDATE companies SET is_headquarters = 1 WHERE is_headquarters IS NULL OR is_headquarters = 0',
      )
      .execute()

    const col2 = app.findCollectionByNameOrId('companies')
    const cnpjField = col2.fields.getByName('cnpj')
    if (cnpjField) {
      cnpjField.required = true
    }
    app.save(col2)

    col2.addIndex('idx_companies_cnpj', true, 'cnpj', '')
    app.save(col2)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('companies')
    col.removeIndex('idx_companies_cnpj')

    col.fields.removeByName('cnpj')
    col.fields.removeByName('address')
    col.fields.removeByName('zip_code')
    col.fields.removeByName('phone')
    col.fields.removeByName('whatsapp')
    col.fields.removeByName('is_headquarters')
    col.fields.removeByName('parent_company_id')
    col.fields.removeByName('market_segment')
    col.fields.removeByName('co_manager')
    col.fields.removeByName('partner_affiliate')

    app.save(col)
  },
)
