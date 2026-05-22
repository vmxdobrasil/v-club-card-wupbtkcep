migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    const createAuth = (email, name, role) => {
      try {
        return app.findAuthRecordByEmail('users', email)
      } catch (_) {
        const record = new Record(users)
        record.setEmail(email)
        record.setPassword('Skip@Pass')
        record.setVerified(true)
        record.set('name', name)
        record.set('role', role)
        app.save(record)
        return record
      }
    }

    const master = createAuth('valterpmendonca@gmail.com', 'Admin VMX', 'master')
    const companyUser = createAuth('rh@techsolutions.com', 'RH Manager', 'company')
    const partnerUser = createAuth('loja@farmacia.com', 'Gerente Loja', 'partner')
    const holderUser = createAuth('joao@techsolutions.com', 'João Silva', 'holder')

    const companies = app.findCollectionByNameOrId('companies')
    let comp1
    try {
      comp1 = app.findFirstRecordByData('companies', 'name', 'Tech Solutions LTDA')
    } catch (_) {
      comp1 = new Record(companies)
      comp1.set('name', 'Tech Solutions LTDA')
      comp1.set('bin_prefix', '636943')
      comp1.set('commission_rate', 0.005)
      comp1.set('modality', '2')
      comp1.set('gateway_provider', 'Asaas')
      comp1.set('status', 'active')
      comp1.set('owner_id', companyUser.id)
      app.save(comp1)
    }

    const cardHolders = app.findCollectionByNameOrId('card_holders')
    let ch1
    try {
      ch1 = app.findFirstRecordByData('card_holders', 'user_id', holderUser.id)
    } catch (_) {
      ch1 = new Record(cardHolders)
      ch1.set('user_id', holderUser.id)
      ch1.set('company_id', comp1.id)
      ch1.set('card_number', '6369431012345678')
      ch1.set('cvv', '123')
      const d = new Date()
      d.setFullYear(d.getFullYear() + 5)
      ch1.set('expiry', d.toISOString().replace('T', ' ').replace('Z', ''))
      ch1.set('total_limit', 2500)
      ch1.set('used_limit', 850)
      ch1.set('max_consigned_margin', 40)
      ch1.set('status', 'active')
      app.save(ch1)
    }

    const txs = app.findCollectionByNameOrId('transactions')
    if (app.countRecords('transactions') === 0) {
      const tx1 = new Record(txs)
      tx1.set('holder_id', ch1.id)
      tx1.set('company_id', comp1.id)
      tx1.set('partner_id', partnerUser.id)
      tx1.set('amount', 45.9)
      tx1.set('type', 'debit')
      tx1.set('status', 'approved')
      app.save(tx1)
    }
  },
  (app) => {},
)
