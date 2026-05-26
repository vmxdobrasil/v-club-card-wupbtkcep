migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('companies')
    col.fields.add(new TextField({ name: 'zip_code' }))
    col.fields.add(new TextField({ name: 'address_street' }))
    col.fields.add(new TextField({ name: 'address_number' }))
    col.fields.add(new TextField({ name: 'address_neighborhood' }))
    col.fields.add(new TextField({ name: 'address_city' }))
    col.fields.add(new TextField({ name: 'address_state' }))
    col.fields.add(new RelationField({ name: 'parent_id', collectionId: col.id, maxSelect: 1 }))

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
  },
)
