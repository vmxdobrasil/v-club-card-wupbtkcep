migrate(
  (app) => {
    const collection = new Collection({
      name: 'payroll_batches',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (@request.auth.role = 'master' || @request.auth.id = company_id.owner_id)",
      viewRule:
        "@request.auth.id != '' && (@request.auth.role = 'master' || @request.auth.id = company_id.owner_id)",
      createRule:
        "@request.auth.id != '' && (@request.auth.role = 'master' || @request.auth.id = company_id.owner_id)",
      updateRule:
        "@request.auth.id != '' && (@request.auth.role = 'master' || @request.auth.id = company_id.owner_id)",
      deleteRule:
        "@request.auth.id != '' && (@request.auth.role = 'master' || @request.auth.id = company_id.owner_id)",
      fields: [
        {
          name: 'company_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('companies').id,
          maxSelect: 1,
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          values: ['export', 'import'],
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['pending', 'processed', 'error'],
          maxSelect: 1,
        },
        { name: 'batch_date', type: 'date', required: true },
        {
          name: 'file_record',
          type: 'file',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: [
            'text/csv',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/plain',
          ],
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_payroll_batches_company_date ON payroll_batches (company_id, batch_date)',
      ],
    })
    app.save(collection)

    let company
    try {
      company = app.findFirstRecordByData('companies', 'name', 'Tech Solutions')
    } catch (_) {
      try {
        company = app.findFirstRecordByFilter('companies', "status='active'")
      } catch (_) {
        const users = app.findCollectionByNameOrId('_pb_users_auth_')
        let owner
        try {
          owner = app.findAuthRecordByEmail('users', 'admin@example.com')
        } catch (_) {
          owner = new Record(users)
          owner.setEmail('admin@example.com')
          owner.setPassword('Skip@Pass')
          owner.setVerified(true)
          owner.set('role', 'company')
          app.save(owner)
        }

        const comps = app.findCollectionByNameOrId('companies')
        company = new Record(comps)
        company.set('name', 'Tech Solutions')
        company.set('bin_prefix', '411111')
        company.set('commission_rate', 2.5)
        company.set('modality', 'both')
        company.set('gateway_provider', 'None/Manual')
        company.set('status', 'active')
        company.set('owner_id', owner.id)
        app.save(company)
      }
    }

    for (let i = 1; i <= 3; i++) {
      let user
      try {
        user = app.findAuthRecordByEmail('users', `holder${i}@example.com`)
      } catch (_) {
        user = new Record(app.findCollectionByNameOrId('_pb_users_auth_'))
        user.setEmail(`holder${i}@example.com`)
        user.setPassword('Skip@Pass')
        user.setVerified(true)
        user.set('name', `Colaborador ${i}`)
        user.set('role', 'holder')
        app.save(user)
      }

      try {
        app.findFirstRecordByData('card_holders', 'user_id', user.id)
      } catch (_) {
        const ch = new Record(app.findCollectionByNameOrId('card_holders'))
        ch.set('user_id', user.id)
        ch.set('company_id', company.id)
        ch.set('card_number', `411111111111111${i}`)
        ch.set('cvv', `12${i}`)
        ch.set('expiry', '2029-12-31 00:00:00.000Z')
        ch.set('total_limit', 1000 + i * 500)
        ch.set('used_limit', 100 * i)
        ch.set('max_consigned_margin', 300 + i * 100)
        ch.set('status', 'active')
        app.save(ch)
      }
    }

    try {
      app.findFirstRecordByData('payroll_batches', 'company_id', company.id)
    } catch (_) {
      const pb = new Record(collection)
      pb.set('company_id', company.id)
      pb.set('type', 'export')
      pb.set('status', 'processed')
      pb.set('batch_date', new Date().toISOString().replace('T', ' '))
      app.save(pb)
    }
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('payroll_batches')
    app.delete(collection)
  },
)
