migrate(
  (app) => {
    const collection = new Collection({
      name: 'companies',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'master'",
      updateRule: "@request.auth.role = 'master' || @request.auth.id = owner_id",
      deleteRule: "@request.auth.role = 'master'",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'logo', type: 'file', maxSelect: 1, mimeTypes: ['image/jpeg', 'image/png'] },
        { name: 'bin_prefix', type: 'text', required: true },
        { name: 'commission_rate', type: 'number', required: true, min: 0.00025, max: 0.01 },
        {
          name: 'modality',
          type: 'select',
          values: ['1', '2', 'both'],
          maxSelect: 1,
          required: true,
        },
        {
          name: 'gateway_provider',
          type: 'select',
          values: ['Asaas', 'Alternative', 'None/Manual'],
          maxSelect: 1,
          required: true,
        },
        {
          name: 'status',
          type: 'select',
          values: ['active', 'inactive'],
          maxSelect: 1,
          required: true,
        },
        { name: 'owner_id', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('companies')
    app.delete(collection)
  },
)
