migrate(
  (app) => {
    const companiesId = app.findCollectionByNameOrId('companies').id
    const cardHoldersId = app.findCollectionByNameOrId('card_holders').id
    const collection = new Collection({
      name: 'transactions',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.role = 'master'",
      deleteRule: "@request.auth.role = 'master'",
      fields: [
        {
          name: 'holder_id',
          type: 'relation',
          required: true,
          collectionId: cardHoldersId,
          maxSelect: 1,
        },
        {
          name: 'company_id',
          type: 'relation',
          required: true,
          collectionId: companiesId,
          maxSelect: 1,
        },
        { name: 'partner_id', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        { name: 'amount', type: 'number', required: true, min: 0.01 },
        { name: 'type', type: 'select', values: ['debit', 'credit'], maxSelect: 1, required: true },
        {
          name: 'status',
          type: 'select',
          values: ['pending', 'approved', 'rejected'],
          maxSelect: 1,
          required: true,
        },
        { name: 'split_data', type: 'json' },
        { name: 'gateway_ref', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('transactions')
    app.delete(collection)
  },
)
