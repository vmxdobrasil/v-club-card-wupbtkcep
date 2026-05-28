migrate(
  (app) => {
    const cardHolders = app.findCollectionByNameOrId('card_holders')
    if (!cardHolders.fields.getByName('asaas_customer_id')) {
      cardHolders.fields.add(
        new TextField({
          name: 'asaas_customer_id',
          required: false,
        }),
      )
      app.save(cardHolders)
    }

    const companies = app.findCollectionByNameOrId('companies')
    if (!companies.fields.getByName('asaas_wallet_id')) {
      companies.fields.add(
        new TextField({
          name: 'asaas_wallet_id',
          required: false,
        }),
      )
      app.save(companies)
    }
  },
  (app) => {
    const cardHolders = app.findCollectionByNameOrId('card_holders')
    if (cardHolders.fields.getByName('asaas_customer_id')) {
      cardHolders.fields.removeByName('asaas_customer_id')
      app.save(cardHolders)
    }

    const companies = app.findCollectionByNameOrId('companies')
    if (companies.fields.getByName('asaas_wallet_id')) {
      companies.fields.removeByName('asaas_wallet_id')
      app.save(companies)
    }
  },
)
