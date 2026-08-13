routerAdd('POST', '/backend/v1/asaas/create-charge', (e) => {
  const body = e.requestInfo().body || {}
  const {
    customer_name,
    customer_cpf_cnpj,
    customer_email,
    amount,
    due_date,
    billing_type,
    description,
    company_id,
    holder_id,
  } = body

  if (!amount || !customer_name || !billing_type) {
    return e.json(400, {
      success: false,
      error: 'Campos obrigatórios ausentes (nome, valor, forma de pagamento).',
    })
  }

  // Find API key & Env from asaas_config or platform_settings
  let apiKey = ''
  let environment = 'sandbox'

  try {
    const configRecords = $app.findRecordsByFilter(
      'asaas_config',
      'status="active"',
      '-created',
      1,
      0,
    )
    if (configRecords && configRecords.length > 0) {
      apiKey = configRecords[0].getString('api_key')
      environment = configRecords[0].getString('environment')
    }
  } catch (err) {}

  if (!apiKey) {
    try {
      const apiKeyRec = $app.findFirstRecordByData('platform_settings', 'key', 'ASAAS_API_KEY')
      apiKey = apiKeyRec.getString('value')
    } catch (err) {}
    try {
      const envRec = $app.findFirstRecordByData('platform_settings', 'key', 'ASAAS_ENV')
      environment = envRec.getString('value') || 'sandbox'
    } catch (err) {}
  }

  if (!apiKey) {
    return e.json(400, { success: false, error: 'Chave de API Asaas não configurada.' })
  }

  const baseUrl =
    environment === 'production' ? 'https://api.asaas.com/v3' : 'https://sandbox.asaas.com/api/v3'

  let asaasCustomerId = ''

  // 1. Create or Find Asaas Customer
  const cleanCpfCnpj = (customer_cpf_cnpj || '').replace(/\D/g, '')
  if (cleanCpfCnpj) {
    try {
      const searchRes = $http.send({
        url: `${baseUrl}/customers?cpfCnpj=${cleanCpfCnpj}`,
        method: 'GET',
        headers: { access_token: apiKey },
        timeout: 10,
      })
      if (searchRes.statusCode === 200 && searchRes.json?.data?.length > 0) {
        asaasCustomerId = searchRes.json.data[0].id
      }
    } catch (err) {}
  }

  if (!asaasCustomerId) {
    try {
      const custRes = $http.send({
        url: `${baseUrl}/customers`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          access_token: apiKey,
        },
        body: JSON.stringify({
          name: customer_name,
          email: customer_email || 'cliente@vclub.local',
          cpfCnpj: cleanCpfCnpj || '00000000000',
        }),
        timeout: 10,
      })

      if (custRes.statusCode >= 200 && custRes.statusCode < 300) {
        asaasCustomerId = custRes.json?.id
      } else {
        const desc = custRes.json?.errors?.[0]?.description || 'Erro ao cadastrar cliente no Asaas.'
        return e.json(400, { success: false, error: desc })
      }
    } catch (err) {
      return e.json(500, {
        success: false,
        error: 'Erro ao conectar ao Asaas para cadastrar cliente.',
      })
    }
  }

  // 2. Create Payment/Charge
  const payload = {
    customer: asaasCustomerId,
    billingType: billing_type || 'UNDEFINED',
    value: Number(Number(amount).toFixed(2)),
    dueDate: due_date || new Date().toISOString().split('T')[0],
    description: description || 'Cobrança V Club Card',
  }

  let paymentRes
  try {
    paymentRes = $http.send({
      url: `${baseUrl}/payments`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        access_token: apiKey,
      },
      body: JSON.stringify(payload),
      timeout: 15,
    })
  } catch (err) {
    return e.json(500, {
      success: false,
      error: 'Timeout ou erro na requisição de pagamento Asaas.',
    })
  }

  if (paymentRes.statusCode < 200 || paymentRes.statusCode >= 300) {
    const desc = paymentRes.json?.errors?.[0]?.description || 'Erro ao gerar cobrança no Asaas.'
    return e.json(400, { success: false, error: desc })
  }

  const paymentData = paymentRes.json
  const paymentUrl =
    paymentData.invoiceUrl || paymentData.bankSlipUrl || paymentData.invoiceCustomAvgUrl || ''

  // 3. Save to PocketBase transactions table
  let txRecord
  try {
    const txCol = $app.findCollectionByNameOrId('transactions')
    txRecord = new Record(txCol)
    txRecord.set('amount', Number(amount))
    txRecord.set('type', 'credit')
    txRecord.set('status', 'pending')
    txRecord.set('gateway_ref', paymentData.id)
    txRecord.set('billing_type', billing_type)
    txRecord.set('description', description || '')
    if (due_date) txRecord.set('due_date', due_date)
    txRecord.set('customer_name', customer_name)
    txRecord.set('customer_cpf_cnpj', cleanCpfCnpj)
    txRecord.set('customer_email', customer_email || '')
    txRecord.set('payment_link', paymentUrl)
    if (company_id) txRecord.set('company_id', company_id)
    if (holder_id) txRecord.set('holder_id', holder_id)

    txRecord.set('split_data', {
      gateway_status: paymentData.status || 'PENDING',
      payment_url: paymentUrl,
      asaas_customer_id: asaasCustomerId,
      raw: paymentData,
    })

    $app.save(txRecord)
  } catch (err) {
    $app.logger().error('Erro ao salvar cobrança na tabela transactions', 'err', err)
  }

  return e.json(200, {
    success: true,
    payment_id: paymentData.id,
    payment_url: paymentUrl,
    status: paymentData.status,
    transaction_id: txRecord ? txRecord.id : null,
  })
})
