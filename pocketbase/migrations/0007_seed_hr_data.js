migrate(
  (app) => {
    const companies = app.findCollectionByNameOrId('companies')

    try {
      app.findFirstRecordByData('companies', 'cnpj', '00000000000002')
    } catch (_) {
      const record = new Record(companies)
      record.set('name', 'HR Tech Corp')
      record.set('cnpj', '00000000000002')
      record.set('bin_prefix', '636944')
      record.set('commission_rate', 2.0)
      record.set('modality', '2')
      record.set('gateway_provider', 'None/Manual')
      record.set('status', 'active')
      record.set('is_headquarters', true)
      app.save(record)
    }
  },
  (app) => {
    try {
      const record = app.findFirstRecordByData('companies', 'cnpj', '00000000000002')
      app.delete(record)
    } catch (_) {}
  },
)
