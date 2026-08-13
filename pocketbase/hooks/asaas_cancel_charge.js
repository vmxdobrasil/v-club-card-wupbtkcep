routerAdd('POST', '/backend/v1/asaas/cancel-charge', (e) => {
  const body = e.requestInfo().body || {}
  const { payment_id, transaction_id } = body

  if (!payment_id && !transaction_id) {
    return e.json(400, { success: false, error: 'ID do pagamento ou transação é obrigatório.' })
  }

  let paymentIdToCancel = payment_id
  let txRecord = null

  if (transaction_id) {
    try {
      txRecord = $app.findRecordById('transactions', transaction_id)
      paymentIdToCancel = txRecord.getString('gateway_ref')
    } catch (err) {}
  } else if (payment_id) {
    try {
      txRecord = $app.findFirstRecordByData('transactions', 'gateway_ref', payment_id)
    } catch (err) {}
  }

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

  const baseUrl =
    environment === 'production' ? 'https://api.asaas.com/v3' : 'https://sandbox.asaas.com/api/v3'

  if (paymentIdToCancel && apiKey) {
    try {
      $http.send({
        url: `${baseUrl}/payments/${paymentIdToCancel}`,
        method: 'DELETE',
        headers: { access_token: apiKey },
        timeout: 10,
      })
    } catch (err) {}
  }

  if (txRecord) {
    txRecord.set('status', 'rejected')
    $app.save(txRecord)
  }

  return e.json(200, { success: true, message: 'Cobrança cancelada com sucesso.' })
})
