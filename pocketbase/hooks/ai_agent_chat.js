routerAdd('POST', '/backend/v1/ai-chat', (e) => {
  const body = e.requestInfo().body || {}

  if (!body.message || typeof body.message !== 'string') {
    return e.badRequestError('message is required')
  }
  if (!body.company_id || typeof body.company_id !== 'string') {
    return e.badRequestError('company_id is required')
  }

  const message = body.message
  const company_id = body.company_id
  const history = Array.isArray(body.history) ? body.history : []

  const aiUrl = $secrets.get('SKIP_AI_GATEWAY_URL')
  const aiKey = $secrets.get('SKIP_AI_GATEWAY_API_KEY')

  if (!aiUrl || !aiKey) {
    return e.internalServerError('AI gateway not configured')
  }

  // 1. Embed the incoming message
  let queryEmbedding = []
  try {
    const embedRes = $http.send({
      url: aiUrl.replace(/\/+$/, '') + '/embeddings',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${aiKey}`,
      },
      body: JSON.stringify({
        input: message,
        model: 'text-embedding-ada-002',
      }),
      timeout: 15,
    })
    if (embedRes.statusCode === 200 && embedRes.json && embedRes.json.data) {
      queryEmbedding = embedRes.json.data[0].embedding
    }
  } catch (err) {
    $app.logger().error('AI Embedding error', 'err', err.message)
  }

  // 2. Vector Search to build context
  let contextText = 'No products found.'
  if (queryEmbedding && queryEmbedding.length === 1536) {
    try {
      const results = $vectors.search(e, 'products', {
        field: 'embedding',
        query: queryEmbedding,
        k: 5,
        filter: "company_id = '" + company_id + "'",
      })
      if (results && results.items && results.items.length > 0) {
        contextText = results.items
          .map(
            (r) =>
              `${r.getString('name')} - ${r.getString('description')} - Price: $${r.getFloat('price')}`,
          )
          .join('\n')
      }
    } catch (err) {
      $app.logger().error('Vector search error', 'err', err.message)
    }
  }

  // 3. LLM Completion via Server-Sent Events
  const systemPrompt = `You are a helpful and polite sales assistant representing our company.
Use the following product information to answer the user's questions accurately.
If the user wants to purchase, encourage them to fill out the contact form located in the chat panel.

Available Products context:
${contextText}`

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: message },
  ]

  try {
    const iter = $http.stream({
      url: aiUrl.replace(/\/+$/, '') + '/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${aiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        stream: true,
      }),
      idleTimeout: 30,
    })

    e.response.header().set('Content-Type', 'text/event-stream')
    e.response.header().set('Cache-Control', 'no-cache')
    e.response.header().set('Connection', 'keep-alive')

    for (const chunk of iter) {
      $response.write(e, chunk)
      $response.flush(e)
    }

    return
  } catch (err) {
    $app.logger().error('AI Streaming error', 'err', err.message)
    return e.internalServerError(err.message)
  }
})
