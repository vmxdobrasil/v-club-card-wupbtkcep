migrate(
  (app) => {
    const companiesId = app.findCollectionByNameOrId('companies').id
    const collection = new Collection({
      name: 'card_holders',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.role = 'master' || @request.auth.role = 'company'",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        {
          name: 'company_id',
          type: 'relation',
          required: true,
          collectionId: companiesId,
          maxSelect: 1,
        },
        { name: 'card_number', type: 'text', required: false, min: 16, max: 16 },
        { name: 'cvv', type: 'text', required: false, min: 3, max: 4 },
        { name: 'expiry', type: 'date', required: false },
        { name: 'total_limit', type: 'number', required: true, min: 0 },
        { name: 'used_limit', type: 'number', required: true, min: 0 },
        { name: 'max_consigned_margin', type: 'number' },
        {
          name: 'status',
          type: 'select',
          values: ['active', 'blocked', 'canceled'],
          maxSelect: 1,
          required: true,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_card_holders_number ON card_holders (card_number)'],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('card_holders')
    app.delete(collection)
  },
)
