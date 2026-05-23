migrate(
  (app) => {
    const companies = app.findCollectionByNameOrId('companies')
    const products = app.findCollectionByNameOrId('products')
    const binHistory = app.findCollectionByNameOrId('bin_prefix_history')

    // Seed Matrix 1
    let matrix1
    try {
      matrix1 = app.findFirstRecordByData('companies', 'cnpj', '00.000.000/0001-01')
    } catch (_) {
      matrix1 = new Record(companies)
      matrix1.set('name', 'Matrix Alpha Corp')
      matrix1.set('cnpj', '00.000.000/0001-01')
      matrix1.set('bin_prefix', '123456')
      matrix1.set('commission_rate', 5)
      matrix1.set('modality', 'both')
      matrix1.set('gateway_provider', 'Asaas')
      matrix1.set('status', 'active')
      matrix1.set('is_headquarters', true)
      app.save(matrix1)
    }

    // Seed Matrix 2
    let matrix2
    try {
      matrix2 = app.findFirstRecordByData('companies', 'cnpj', '11.111.111/0001-11')
    } catch (_) {
      matrix2 = new Record(companies)
      matrix2.set('name', 'Matrix Beta Inc')
      matrix2.set('cnpj', '11.111.111/0001-11')
      matrix2.set('bin_prefix', '654321')
      matrix2.set('commission_rate', 3)
      matrix2.set('modality', '1')
      matrix2.set('gateway_provider', 'Alternative')
      matrix2.set('status', 'active')
      matrix2.set('is_headquarters', true)
      app.save(matrix2)
    }

    // Seed Branch 1
    try {
      app.findFirstRecordByData('companies', 'cnpj', '00.000.000/0002-02')
    } catch (_) {
      const branch1 = new Record(companies)
      branch1.set('name', 'Alpha Branch SP')
      branch1.set('cnpj', '00.000.000/0002-02')
      branch1.set('bin_prefix', '123456')
      branch1.set('commission_rate', 5)
      branch1.set('modality', 'both')
      branch1.set('gateway_provider', 'Asaas')
      branch1.set('status', 'active')
      branch1.set('is_headquarters', false)
      branch1.set('parent_company_id', matrix1.id)
      app.save(branch1)
    }

    // Seed Branch 2
    try {
      app.findFirstRecordByData('companies', 'cnpj', '00.000.000/0003-03')
    } catch (_) {
      const branch2 = new Record(companies)
      branch2.set('name', 'Alpha Branch RJ')
      branch2.set('cnpj', '00.000.000/0003-03')
      branch2.set('bin_prefix', '123456')
      branch2.set('commission_rate', 5)
      branch2.set('modality', 'both')
      branch2.set('gateway_provider', 'Asaas')
      branch2.set('status', 'active')
      branch2.set('is_headquarters', false)
      branch2.set('parent_company_id', matrix1.id)
      app.save(branch2)
    }

    // Seed Branch 3
    try {
      app.findFirstRecordByData('companies', 'cnpj', '11.111.111/0002-22')
    } catch (_) {
      const branch3 = new Record(companies)
      branch3.set('name', 'Beta Branch Sul')
      branch3.set('cnpj', '11.111.111/0002-22')
      branch3.set('bin_prefix', '654321')
      branch3.set('commission_rate', 3)
      branch3.set('modality', '1')
      branch3.set('gateway_provider', 'Alternative')
      branch3.set('status', 'active')
      branch3.set('is_headquarters', false)
      branch3.set('parent_company_id', matrix2.id)
      app.save(branch3)
    }

    // Seed Products
    const sampleProducts = [
      { name: 'Corporate Credit Card', description: 'Standard card', price: 10.0 },
      { name: 'Premium Credit Card', description: 'Premium card with perks', price: 25.0 },
      { name: 'Payroll Advance', description: 'Consigned loan', price: 5.0 },
      { name: 'Meal Voucher', description: 'Meal allowance', price: 0.0 },
      { name: 'Fuel Voucher', description: 'Fuel allowance', price: 0.0 },
    ]

    sampleProducts.forEach((p) => {
      try {
        app.findFirstRecordByData('products', 'name', p.name)
      } catch (_) {
        const prod = new Record(products)
        prod.set('name', p.name)
        prod.set('description', p.description)
        prod.set('price', p.price)
        app.save(prod)
      }
    })

    // Seed BIN History
    try {
      app.findFirstRecordByData('bin_prefix_history', 'company_id', matrix1.id)
    } catch (_) {
      const history1 = new Record(binHistory)
      history1.set('company_id', matrix1.id)
      history1.set('old_prefix', '111111')
      history1.set('new_prefix', '123456')
      app.saveNoValidate(history1)
    }
  },
  (app) => {
    // Empty down for safety on seeds
  },
)
