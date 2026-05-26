migrate(
  (app) => {
    const companyCol = app.findCollectionByNameOrId('companies')

    const collection = new Collection({
      name: 'bin_prefix_history',
      type: 'base',
      listRule: "@request.auth.role = 'master' || @request.auth.role = 'company'",
      viewRule: "@request.auth.role = 'master' || @request.auth.role = 'company'",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'company_id',
          type: 'relation',
          required: true,
          collectionId: companyCol.id,
          maxSelect: 1,
        },
        { name: 'old_prefix', type: 'text' },
        { name: 'new_prefix', type: 'text' },
        {
          name: 'changed_by',
          type: 'relation',
          required: false,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('bin_prefix_history')
    app.delete(collection)
  },
)
