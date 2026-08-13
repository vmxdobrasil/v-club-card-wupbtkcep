migrate(
  (app) => {
    // 1. Create or update asaas_config collection
    let configCol
    try {
      configCol = app.findCollectionByNameOrId('asaas_config')
    } catch (_) {
      configCol = new Collection({
        name: 'asaas_config',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: 'api_key', type: 'text', required: true },
          {
            name: 'environment',
            type: 'select',
            required: true,
            values: ['sandbox', 'production'],
            maxSelect: 1,
          },
          {
            name: 'status',
            type: 'select',
            values: ['active', 'inactive', 'testing', 'error'],
            maxSelect: 1,
          },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(configCol)
    }

    // 2. Ensure transactions collection has all needed fields for Asaas charges
    const txCol = app.findCollectionByNameOrId('transactions')

    if (!txCol.fields.getByName('billing_type')) {
      txCol.fields.add(
        new SelectField({
          name: 'billing_type',
          values: ['PIX', 'BOLETO', 'CREDIT_CARD', 'UNDEFINED'],
          maxSelect: 1,
        }),
      )
    }

    if (!txCol.fields.getByName('description')) {
      txCol.fields.add(new TextField({ name: 'description' }))
    }

    if (!txCol.fields.getByName('due_date')) {
      txCol.fields.add(new DateField({ name: 'due_date' }))
    }

    if (!txCol.fields.getByName('customer_name')) {
      txCol.fields.add(new TextField({ name: 'customer_name' }))
    }

    if (!txCol.fields.getByName('customer_cpf_cnpj')) {
      txCol.fields.add(new TextField({ name: 'customer_cpf_cnpj' }))
    }

    if (!txCol.fields.getByName('customer_email')) {
      txCol.fields.add(new EmailField({ name: 'customer_email' }))
    }

    if (!txCol.fields.getByName('payment_link')) {
      txCol.fields.add(new URLField({ name: 'payment_link' }))
    }

    app.save(txCol)
  },
  (app) => {
    try {
      const configCol = app.findCollectionByNameOrId('asaas_config')
      app.delete(configCol)
    } catch (_) {}
  },
)
