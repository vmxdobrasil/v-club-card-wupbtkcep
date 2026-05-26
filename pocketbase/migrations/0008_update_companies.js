migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('companies')

    if (!col.fields.getByName('parent_company_id')) {
      col.fields.add(
        new RelationField({ name: 'parent_company_id', collectionId: col.id, maxSelect: 1 }),
      )
    }
    if (!col.fields.getByName('cep')) {
      col.fields.add(new TextField({ name: 'cep' }))
    }
    if (!col.fields.getByName('address')) {
      col.fields.add(new TextField({ name: 'address' }))
    }
    if (!col.fields.getByName('number')) {
      col.fields.add(new TextField({ name: 'number' }))
    }
    if (!col.fields.getByName('neighborhood')) {
      col.fields.add(new TextField({ name: 'neighborhood' }))
    }
    if (!col.fields.getByName('city')) {
      col.fields.add(new TextField({ name: 'city' }))
    }
    if (!col.fields.getByName('state')) {
      col.fields.add(new TextField({ name: 'state' }))
    }
    if (!col.fields.getByName('complement')) {
      col.fields.add(new TextField({ name: 'complement' }))
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('companies')
    col.fields.removeByName('parent_company_id')
    col.fields.removeByName('cep')
    col.fields.removeByName('address')
    col.fields.removeByName('number')
    col.fields.removeByName('neighborhood')
    col.fields.removeByName('city')
    col.fields.removeByName('state')
    col.fields.removeByName('complement')
    app.save(col)
  },
)
