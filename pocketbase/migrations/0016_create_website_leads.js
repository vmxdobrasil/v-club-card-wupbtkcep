migrate(
  (app) => {
    const collection = new Collection({
      name: 'website_leads',
      type: 'base',
      listRule: "@request.auth.role = 'master'",
      viewRule: "@request.auth.role = 'master'",
      createRule: '',
      updateRule: "@request.auth.role = 'master'",
      deleteRule: "@request.auth.role = 'master'",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('website_leads')
    app.delete(collection)
  },
)
