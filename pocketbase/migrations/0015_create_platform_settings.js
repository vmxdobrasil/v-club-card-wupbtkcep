migrate(
  (app) => {
    const collection = new Collection({
      name: 'platform_settings',
      type: 'base',
      listRule: "@request.auth.role = 'master'",
      viewRule: "@request.auth.role = 'master'",
      createRule: "@request.auth.role = 'master'",
      updateRule: "@request.auth.role = 'master'",
      deleteRule: "@request.auth.role = 'master'",
      fields: [
        { name: 'key', type: 'text', required: true },
        { name: 'value', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_platform_settings_key ON platform_settings (key)'],
    })
    app.save(collection)
  },
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId('platform_settings')
      app.delete(collection)
    } catch (err) {}
  },
)
