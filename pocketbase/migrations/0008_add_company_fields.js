migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('companies')
    col.fields.add(new TextField({ name: 'zip_code' }))
    col.fields.add(new TextField({ name: 'address' }))
    col.fields.add(new TextField({ name: 'neighborhood' }))
    col.fields.add(new TextField({ name: 'city' }))
    col.fields.add(new TextField({ name: 'state' }))
    col.fields.add(
      new RelationField({ name: 'parent_company_id', collectionId: col.id, maxSelect: 1 }),
    )

    col.fields.add(new TextField({ name: 'number' }))
    col.fields.add(new TextField({ name: 'complement' }))
    col.fields.add(new TextField({ name: 'phone' }))
    col.fields.add(new TextField({ name: 'whatsapp' }))
    col.fields.add(new BoolField({ name: 'is_headquarters' }))
    col.fields.add(new TextField({ name: 'market_segment' }))
    col.fields.add(
      new RelationField({ name: 'cobranded_id', collectionId: '_pb_users_auth_', maxSelect: 1 }),
    )
    col.fields.add(
      new RelationField({ name: 'affiliate_id', collectionId: '_pb_users_auth_', maxSelect: 1 }),
    )
    col.fields.add(new BoolField({ name: 'is_partner' }))

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('companies')
    col.fields.removeByName('zip_code')
    col.fields.removeByName('address')
    col.fields.removeByName('neighborhood')
    col.fields.removeByName('city')
    col.fields.removeByName('state')
    col.fields.removeByName('parent_company_id')
    col.fields.removeByName('number')
    col.fields.removeByName('complement')
    col.fields.removeByName('phone')
    col.fields.removeByName('whatsapp')
    col.fields.removeByName('is_headquarters')
    col.fields.removeByName('market_segment')
    col.fields.removeByName('cobranded_id')
    col.fields.removeByName('affiliate_id')
    col.fields.removeByName('is_partner')
    app.save(col)
  },
)
