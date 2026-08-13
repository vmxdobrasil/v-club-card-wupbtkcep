routerAdd('POST', '/backend/v1/asaas/test-connection', (e) => {
  const body = e.requestInfo().body || {}
  const apiKey = body.api_key
  const environment = body.environment || 'sandbox'

  if (!apiKey) {
    return e.json(400, { success: false, error: 'Chave de API não informada.' })
  }

  const baseUrl =
    environment === 'production' ? 'https://api.asaas.com/v3' : 'https://sandbox.asaas.com/api/v3'

  try {
    const res = $http.send({
      url: `${baseUrl}/finance/balance`,
      method: 'GET',
      headers: {
        access_token: apiKey,
      },
      timeout: 10,
    })

    if (res.statusCode >= 200 && res.statusCode < 300) {
      return e.json(200, {
        success: true,
        message: 'Conexão com Asaas realizada com sucesso!',
        data: res.json,
      })
    } else {
      const errMsg =
        res.json?.errors?.[0]?.description || res.body || 'Falha de autenticação no Asaas.'
      return e.json(400, { success: false, error: errMsg })
    }
  } catch (err) {
    return e.json(500, { success: false, error: 'Erro de rede ou timeout ao conectar no Asaas.' })
  }
})
