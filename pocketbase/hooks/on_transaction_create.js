onRecordCreate((e) => {
  const record = e.record
  const holderId = record.get('holder_id')
  const amount = record.getFloat('amount')
  const type = record.getString('type')

  if (type !== 'debit') {
    $app.runInTransaction((txApp) => {
      const holder = txApp.findRecordById('card_holders', holderId)
      const used = holder.getFloat('used_limit')
      holder.set('used_limit', Math.max(0, used - amount))
      txApp.save(holder)
      record.set('status', 'approved')
    })
    e.next()
    return
  }

  const companyId = record.get('company_id')
  const company = $app.findRecordById('companies', companyId)

  const holderInitial = $app.findRecordById('card_holders', holderId)
  const holderCreditSource = holderInitial.getString('credit_source')

  const rate = company.getFloat('commission_rate') || 0.01
  let provider = company.getString('gateway_provider') || 'Asaas'

  if (holderCreditSource === 'asaas') {
    provider = 'Asaas'
  } else if (holderCreditSource === 'proprietary') {
    provider = 'None/Manual'
  }

  const asaasWalletId = company.getString('asaas_wallet_id') || ''

  const commission = amount * rate
  const net = amount - commission

  let splitData = { commission, net, provider, rate }
  let gatewayRef = ''
  let asaasCustomerId = ''

  if (provider === 'Asaas') {
    const asaasApiKey = $secrets.get('ASAAS_API_KEY') || ''
    const asaasEnv =
      $secrets.get('ASAAS_ENV') === 'production'
        ? 'https://api.asaas.com/v3'
        : 'https://sandbox.asaas.com/api/v3'

    if (!asaasApiKey) {
      throw new BadRequestError('API Key do Asaas não configurada.')
    }

    const holder = $app.findRecordById('card_holders', holderId)
    asaasCustomerId = holder.getString('asaas_customer_id')

    if (!asaasCustomerId) {
      const user = $app.findRecordById('users', holder.get('user_id'))
      const res = $http.send({
        url: `${asaasEnv}/customers`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          access_token: asaasApiKey,
        },
        body: JSON.stringify({
          name: user.getString('name') || `Portador ${holder.id}`,
          email: user.getString('email') || `portador-${holder.id}@vclub.local`,
          cpfCnpj: '00000000000',
        }),
        timeout: 15,
      })

      if (res.statusCode >= 200 && res.statusCode < 300) {
        asaasCustomerId = res.json.id
      } else {
        $app
          .logger()
          .error('Erro na criação do cliente Asaas', 'status', res.statusCode, 'response', res.json)
        throw new BadRequestError('Falha ao criar o cliente no gateway de pagamento.', {
          gateway: new ValidationError(
            'gateway_error',
            'Asaas rejeitou a criação do cliente. Verifique os dados.',
          ),
        })
      }
    }

    const chargePayload = {
      customer: asaasCustomerId,
      billingType: 'PIX',
      value: amount,
      dueDate: new Date().toISOString().split('T')[0],
      description: `Transação V Club Card - Ref: ${record.id}`,
      externalReference: record.id,
    }

    if (asaasWalletId) {
      chargePayload.split = [
        {
          walletId: asaasWalletId,
          fixedValue: net,
        },
      ]
    }

    const resCharge = $http.send({
      url: `${asaasEnv}/payments`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        access_token: asaasApiKey,
      },
      body: JSON.stringify(chargePayload),
      timeout: 15,
    })

    if (resCharge.statusCode >= 200 && resCharge.statusCode < 300) {
      gatewayRef = resCharge.json.id
      splitData.gateway_status = resCharge.json.status
      splitData.payment_url = resCharge.json.invoiceUrl || resCharge.json.bankSlipUrl
    } else {
      $app
        .logger()
        .error(
          'Erro na criação da cobrança Asaas',
          'status',
          resCharge.statusCode,
          'response',
          resCharge.json,
        )
      throw new BadRequestError('Falha ao processar pagamento no gateway.', {
        gateway: new ValidationError(
          'gateway_error',
          'O gateway rejeitou a transação. Verifique os dados e o split configurado.',
        ),
      })
    }
  }

  $app.runInTransaction((txApp) => {
    const holder = txApp.findRecordById('card_holders', holderId)
    const total = holder.getFloat('total_limit')
    const used = holder.getFloat('used_limit')

    if (total - used < amount) {
      throw new BadRequestError('Limite insuficiente no cartão.', {
        limit: new ValidationError(
          'limit_error',
          'O limite disponível é inferior ao valor da transação.',
        ),
      })
    }

    holder.set('used_limit', used + amount)

    if (asaasCustomerId && !holder.getString('asaas_customer_id')) {
      holder.set('asaas_customer_id', asaasCustomerId)
    }

    txApp.save(holder)

    record.set('split_data', splitData)
    if (gatewayRef) {
      record.set('gateway_ref', gatewayRef)
      record.set('status', 'pending')
    } else {
      record.set('status', 'approved')
    }
  })

  e.next()
}, 'transactions')
