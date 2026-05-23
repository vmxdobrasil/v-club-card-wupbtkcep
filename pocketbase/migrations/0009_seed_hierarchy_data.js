migrate(
  (app) => {
    const companies = app.findCollectionByNameOrId('companies')

    try {
      app.findFirstRecordByData('companies', 'name', 'Matrix Corp')
      return // already seeded
    } catch (_) {}

    const matrix = new Record(companies)
    matrix.set('name', 'Matrix Corp')
    matrix.set('bin_prefix', '111111')
    matrix.set('commission_rate', 2)
    matrix.set('modality', '1')
    matrix.set('gateway_provider', 'Asaas')
    matrix.set('status', 'active')
    matrix.set('is_headquarters', true)
    matrix.set('cep', '01001000')
    matrix.set('address', 'Praça da Sé')
    matrix.set('neighborhood', 'Sé')
    matrix.set('city', 'São Paulo')
    matrix.set('state', 'SP')
    app.save(matrix)

    const branch = new Record(companies)
    branch.set('name', 'Branch Inc')
    branch.set('bin_prefix', '222222')
    branch.set('commission_rate', 2)
    branch.set('modality', '1')
    branch.set('gateway_provider', 'Asaas')
    branch.set('status', 'active')
    branch.set('is_headquarters', false)
    branch.set('parent_company_id', matrix.id)
    branch.set('cep', '01001001')
    branch.set('address', 'Praça da Sé, Lado Impar')
    branch.set('neighborhood', 'Sé')
    branch.set('city', 'São Paulo')
    branch.set('state', 'SP')
    app.save(branch)
  },
  (app) => {
    try {
      const branch = app.findFirstRecordByData('companies', 'name', 'Branch Inc')
      app.delete(branch)
    } catch (_) {}
    try {
      const matrix = app.findFirstRecordByData('companies', 'name', 'Matrix Corp')
      app.delete(matrix)
    } catch (_) {}
  },
)
