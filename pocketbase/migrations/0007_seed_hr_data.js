migrate(
  (app) => {
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
      const pb = new Record(app.findCollectionByNameOrId('payroll_batches'))
      pb.set('company_id', company.id)
      pb.set('type', 'export')
      pb.set('status', 'processed')
      pb.set('batch_date', new Date().toISOString().replace('T', ' '))
      app.save(pb)
    }
  },
  (app) => {},
)
