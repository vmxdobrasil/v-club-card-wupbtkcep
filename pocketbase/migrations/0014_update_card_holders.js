migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('card_holders')

    if (!col.fields.getByName('cpf')) col.fields.add(new TextField({ name: 'cpf' }))
    if (!col.fields.getByName('address')) col.fields.add(new TextField({ name: 'address' }))
    if (!col.fields.getByName('cep')) col.fields.add(new TextField({ name: 'cep' }))
    if (!col.fields.getByName('whatsapp')) col.fields.add(new TextField({ name: 'whatsapp' }))

    if (!col.fields.getByName('card_type')) {
      col.fields.add(
        new SelectField({
          name: 'card_type',
          values: ['physical_virtual', 'virtual_only'],
          maxSelect: 1,
        }),
      )
    }

    if (!col.fields.getByName('credit_source')) {
      col.fields.add(
        new SelectField({
          name: 'credit_source',
          values: ['proprietary', 'asaas'],
          maxSelect: 1,
        }),
      )
    }

    if (!col.fields.getByName('parent_holder_id')) {
      col.fields.add(
        new RelationField({
          name: 'parent_holder_id',
          collectionId: col.id,
          cascadeDelete: false,
          maxSelect: 1,
        }),
      )
    }

    col.addIndex('idx_card_holders_cpf', true, 'cpf', "cpf != ''")
    col.addIndex('idx_card_holders_parent', false, 'parent_holder_id', '')

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('card_holders')
    col.fields.removeByName('cpf')
    col.fields.removeByName('address')
    col.fields.removeByName('cep')
    col.fields.removeByName('whatsapp')
    col.fields.removeByName('card_type')
    col.fields.removeByName('credit_source')
    col.fields.removeByName('parent_holder_id')
    col.removeIndex('idx_card_holders_cpf')
    col.removeIndex('idx_card_holders_parent')
    app.save(col)
  },
)
