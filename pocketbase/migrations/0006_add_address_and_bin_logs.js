migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('companies')

    if (!col.fields.getByName('cnpj')) col.fields.add(new TextField({ name: 'cnpj' }))
    if (!col.fields.getByName('address')) col.fields.add(new TextField({ name: 'address' }))
    if (!col.fields.getByName('number')) col.fields.add(new TextField({ name: 'number' }))
    if (!col.fields.getByName('complement')) col.fields.add(new TextField({ name: 'complement' }))
    if (!col.fields.getByName('neighborhood'))
      col.fields.add(new TextField({ name: 'neighborhood' }))
    if (!col.fields.getByName('city')) col.fields.add(new TextField({ name: 'city' }))
    if (!col.fields.getByName('state')) col.fields.add(new TextField({ name: 'state' }))
    if (!col.fields.getByName('zip_code')) col.fields.add(new TextField({ name: 'zip_code' }))
    if (!col.fields.getByName('phone')) col.fields.add(new TextField({ name: 'phone' }))
    if (!col.fields.getByName('whatsapp')) col.fields.add(new TextField({ name: 'whatsapp' }))
    if (!col.fields.getByName('is_headquarters'))
      col.fields.add(new BoolField({ name: 'is_headquarters' }))
    if (!col.fields.getByName('parent_company_id'))
      col.fields.add(
        new RelationField({ name: 'parent_company_id', collectionId: col.id, maxSelect: 1 }),
      )
    if (!col.fields.getByName('market_segment'))
      col.fields.add(new TextField({ name: 'market_segment' }))
    if (!col.fields.getByName('cobranded_id'))
      col.fields.add(
        new RelationField({ name: 'cobranded_id', collectionId: '_pb_users_auth_', maxSelect: 1 }),
      )
    if (!col.fields.getByName('affiliate_id'))
      col.fields.add(
        new RelationField({ name: 'affiliate_id', collectionId: '_pb_users_auth_', maxSelect: 1 }),
      )

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
