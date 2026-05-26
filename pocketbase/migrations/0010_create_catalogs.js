migrate(
  (app) => {
    const companiesId = app.findCollectionByNameOrId('companies').id
    const collection = new Collection({
      name: 'catalogs',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'status', type: 'select', values: ['active', 'inactive'], required: true },
        {
          name: 'cover_image',
          type: 'file',
          maxSelect: 1,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
        { name: 'company_id', type: 'relation', collectionId: companiesId, maxSelect: 1 },
        { name: 'partner_id', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        { name: 'product_links', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('catalogs'))
  },
)
