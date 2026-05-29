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
    fields.forEach((f) => {
      let field = col.fields.getByName(f.name)
      if (!field) {
        col.fields.add(new TextField({ name: f.name }))
        modified = true
      } else if (f.name === 'cnpj') {
        // Ensure no strict pattern/length prevents standard formatting
        field.pattern = ''
        field.min = 0
        field.max = 0
        modified = true
      }
    })

    if (modified) {
      app.save(col)
    }
  },
  (app) => {
    // Down migration is skipped since it's just ensuring fields and reverting could drop data
  },
)
