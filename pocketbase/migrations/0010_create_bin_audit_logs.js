migrate(
  (app) => {
    const companies = app.findCollectionByNameOrId('companies')
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    const collection = new Collection({
      name: 'bin_audit_logs',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'master'",
      updateRule: "@request.auth.role = 'master'",
      deleteRule: "@request.auth.role = 'master'",
      fields: [
        {
          name: 'company_id',
          type: 'relation',
          collectionId: companies.id,
          required: true,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'old_prefix', type: 'text' },
        { name: 'new_prefix', type: 'text' },
        {
          name: 'changed_by',
          type: 'relation',
          collectionId: users.id,
          required: true,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('bin_audit_logs'))
  },
)
