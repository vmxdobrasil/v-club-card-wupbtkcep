routerAdd('POST', '/backend/v1/asaas/webhook', (e) => {
  const asaasApiKey = $secrets.get('ASAAS_API_KEY') || ''

  const reqToken = e.request.header.get('asaas-access-token')
  if (asaasApiKey && reqToken && reqToken !== asaasApiKey) {
    return e.json(401, { error: 'Unauthorized webhook' })
  }

  const body = e.requestInfo().body

  if (!body || !body.payment || !body.event) {
    return e.json(400, { error: 'Payload inválido ou ausente' })
  }

  const asaasId = body.payment.id
  const event = body.event

  let newStatus = 'pending'

  if (['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED'].includes(event)) {
    newStatus = 'approved'
  } else if (
    [
      'PAYMENT_DELETED',
      'PAYMENT_REFUNDED',
      'PAYMENT_REPROVED_BY_RISK_ANALYSIS',
      'PAYMENT_CHARGEBACK_REQUESTED',
    ].includes(event)
  ) {
    newStatus = 'rejected'
  }

  if (newStatus !== 'pending') {
    try {
      const record = $app.findFirstRecordByData('transactions', 'gateway_ref', asaasId)

      if (record.getString('status') !== newStatus) {
        $app.runInTransaction((txApp) => {
          const txRecord = txApp.findRecordById('transactions', record.id)

          if (newStatus === 'rejected' && txRecord.getString('status') !== 'rejected') {
            const holderId = txRecord.get('holder_id')
            if (holderId) {
              const holder = txApp.findRecordById('card_holders', holderId)
              const amount = txRecord.getFloat('amount')
              const used = holder.getFloat('used_limit')

              holder.set('used_limit', Math.max(0, used - amount))
              txApp.save(holder)
            }
          }

          txRecord.set('status', newStatus)
          txApp.save(txRecord)
        })
        $app
          .logger()
          .info('Webhook Asaas processado com sucesso', 'asaasId', asaasId, 'newStatus', newStatus)
      }
    } catch (err) {
      $app.logger().warn('Webhook Asaas recebido para transação desconhecida', 'asaasId', asaasId)
    }
  }

  return e.json(200, { received: true })
})
