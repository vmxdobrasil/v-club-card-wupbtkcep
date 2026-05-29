migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    let ownerId = null
    try {
      const user = app.findAuthRecordByEmail('_pb_users_auth_', 'valterpmendonca@gmail.com')
      ownerId = user.id
    } catch (_) {}

    const companiesCol = app.findCollectionByNameOrId('companies')
    let companyRecord
    try {
      companyRecord = app.findFirstRecordByData('companies', 'bin_prefix', '636943')
    } catch (_) {
      companyRecord = new Record(companiesCol)
    }

    companyRecord.set('name', 'Vmx do Brasil Administradora de Cartões e Benefícios Ltda')
    companyRecord.set('bin_prefix', '636943')
    companyRecord.set('gateway_provider', 'Asaas')
    companyRecord.set('status', 'active')

    // Set required default values if newly created
    if (!companyRecord.get('commission_rate')) {
      companyRecord.set('commission_rate', 0)
    }
    if (!companyRecord.get('modality')) {
      companyRecord.set('modality', 'both')
    }

    if (ownerId && !companyRecord.get('owner_id')) {
      companyRecord.set('owner_id', ownerId)
    }

    app.save(companyRecord)
  },
  (app) => {
    try {
      const companyRecord = app.findFirstRecordByData('companies', 'bin_prefix', '636943')
      app.delete(companyRecord)
    } catch (_) {}
  },
)
