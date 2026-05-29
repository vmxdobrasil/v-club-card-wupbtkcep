migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('companies')

    if (!col.fields.getByName('cnpj')) {
      col.fields.add(new TextField({ name: 'cnpj' }))
    }
    if (!col.fields.getByName('address')) {
      col.fields.add(new TextField({ name: 'address' }))
    }
    if (!col.fields.getByName('zip_code')) {
      col.fields.add(new TextField({ name: 'zip_code' }))
    }
    if (!col.fields.getByName('phone')) {
      col.fields.add(new TextField({ name: 'phone' }))
    }
    if (!col.fields.getByName('responsible_name')) {
      col.fields.add(new TextField({ name: 'responsible_name' }))
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('companies')

    const fieldsToRemove = ['cnpj', 'address', 'zip_code', 'phone', 'responsible_name']
    for (const field of fieldsToRemove) {
      if (col.fields.getByName(field)) {
        col.fields.removeByName(field)
      }
    }

    app.save(col)
  },
)
