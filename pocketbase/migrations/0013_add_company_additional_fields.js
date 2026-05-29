migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('companies')

    const fields = [
      { name: 'cnpj', type: 'text' },
      { name: 'address', type: 'text' },
      { name: 'zip_code', type: 'text' },
      { name: 'phone', type: 'text' },
      { name: 'responsible_name', type: 'text' },
    ]

    let modified = false
    for (const f of fields) {
      if (!col.fields.getByName(f.name)) {
        col.fields.add(new TextField({ name: f.name }))
        modified = true
      }
    }

    if (modified) {
      app.save(col)
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('companies')
    let modified = false
    const fieldsToRemove = ['cnpj', 'address', 'zip_code', 'phone', 'responsible_name']

    for (const name of fieldsToRemove) {
      if (col.fields.getByName(name)) {
        col.fields.removeByName(name)
        modified = true
      }
    }

    if (modified) {
      app.save(col)
    }
  },
)
