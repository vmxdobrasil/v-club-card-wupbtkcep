migrate(
  (app) => {
    const collection = new Collection({
      name: 'catalogs',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.role = 'master' || @request.auth.role = 'company'",
      updateRule: "@request.auth.role = 'master' || company_id.owner_id = @request.auth.id",
      deleteRule: "@request.auth.role = 'master' || company_id.owner_id = @request.auth.id",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text' },
        {
          name: 'company_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('companies').id,
          maxSelect: 1,
        },
        { name: 'status', type: 'select', required: true, values: ['active', 'inactive'] },
        { name: 'start_date', type: 'date' },
        { name: 'end_date', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('catalogs')
    app.delete(collection)
  },
)
