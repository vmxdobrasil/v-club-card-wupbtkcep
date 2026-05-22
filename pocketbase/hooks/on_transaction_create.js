onRecordCreate((e) => {
  const record = e.record
  const holderId = record.get('holder_id')
  const amount = record.getFloat('amount')
  const type = record.getString('type')

  $app.runInTransaction((txApp) => {
    const holder = txApp.findRecordById('card_holders', holderId)
    const total = holder.getFloat('total_limit')
    const used = holder.getFloat('used_limit')

    if (type === 'debit') {
      if (total - used < amount) {
        throw new BadRequestError('Insufficient limit')
      }
      holder.set('used_limit', used + amount)
    } else if (type === 'credit') {
      holder.set('used_limit', Math.max(0, used - amount))
    }
    txApp.save(holder)

    if (type === 'debit') {
      const companyId = record.get('company_id')
      let rate = 0.01
      let provider = 'Asaas'
      try {
        const company = txApp.findRecordById('companies', companyId)
        rate = company.getFloat('commission_rate') || 0.01
        provider = company.getString('gateway_provider') || 'Asaas'
      } catch (_) {}

      const commission = amount * rate
      const net = amount - commission

      record.set('split_data', { commission, net, provider })
    }
    record.set('status', 'approved')
  })

  e.next()
}, 'transactions')
