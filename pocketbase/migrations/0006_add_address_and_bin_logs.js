migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('companies')

    if (!col.fields.getByName('number')) col.fields.add(new TextField({ name: 'number' }))
    if (!col.fields.getByName('complement')) col.fields.add(new TextField({ name: 'complement' }))
    if (!col.fields.getByName('neighborhood'))
      col.fields.add(new TextField({ name: 'neighborhood' }))
    if (!col.fields.getByName('city')) col.fields.add(new TextField({ name: 'city' }))
    if (!col.fields.getByName('state')) col.fields.add(new TextField({ name: 'state' }))

    app.save(col)

    let binLogs
    try {
      binLogs = app.findCollectionByNameOrId('bin_logs')
    } catch (_) {
      binLogs = new Collection({
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
            collectionId: col.id,
            required: true,
            maxSelect: 1,
          },
          { name: 'previous_bin', type: 'text' },
          { name: 'new_bin', type: 'text' },
          { name: 'changed_by', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(binLogs)
    }
  },
  (app) => {
    // down not implemented to prevent dataloss
  },
)
