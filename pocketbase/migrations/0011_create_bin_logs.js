migrate(
  (app) => {
    const companies = app.findCollectionByNameOrId('companies')

    const collection = new Collection({
      name: 'bin_logs',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'company_id',
          type: 'relation',
          collectionId: companies.id,
          required: true,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'user_id', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        { name: 'old_prefix', type: 'text' },
        { name: 'new_prefix', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('bin_logs')
    app.delete(collection)
  },
)
