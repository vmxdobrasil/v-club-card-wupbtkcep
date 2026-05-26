onRecordAfterCreateSuccess((e) => {
  const text = `${e.record.getString('name')} - ${e.record.getString('description')} - Category: ${e.record.getString('category')} - Price: ${e.record.getFloat('price')}`

  const aiUrl = $secrets.get('SKIP_AI_GATEWAY_URL')
  const aiKey = $secrets.get('SKIP_AI_GATEWAY_API_KEY')

  if (!aiUrl || !aiKey) return e.next()

  try {
    const res = $http.send({
      url: aiUrl.replace(/\/+$/, '') + '/embeddings',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${aiKey}`,
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-ada-002',
      }),
      timeout: 15,
    })

    if (res.statusCode === 200 && res.json && res.json.data && res.json.data.length > 0) {
      const embedding = res.json.data[0].embedding
      const record = $app.findRecordById('products', e.record.id)
      record.set('embedding', embedding)
      $app.saveNoValidate(record)
    }
  } catch (err) {
    $app.logger().error('Failed to generate embedding', 'error', err.message)
  }
  return e.next()
}, 'products')

onRecordAfterUpdateSuccess((e) => {
  const r = e.record
  const o = r.original()

  // Skip generation if semantic fields haven't changed
  if (
    r.getString('name') === o.getString('name') &&
    r.getString('description') === o.getString('description') &&
    r.getString('category') === o.getString('category') &&
    r.getFloat('price') === o.getFloat('price')
  ) {
    return e.next()
  }

  const text = `${r.getString('name')} - ${r.getString('description')} - Category: ${r.getString('category')} - Price: ${r.getFloat('price')}`

  const aiUrl = $secrets.get('SKIP_AI_GATEWAY_URL')
  const aiKey = $secrets.get('SKIP_AI_GATEWAY_API_KEY')

  if (!aiUrl || !aiKey) return e.next()

  try {
    const res = $http.send({
      url: aiUrl.replace(/\/+$/, '') + '/embeddings',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${aiKey}`,
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-ada-002',
      }),
      timeout: 15,
    })

    if (res.statusCode === 200 && res.json && res.json.data && res.json.data.length > 0) {
      const embedding = res.json.data[0].embedding
      const record = $app.findRecordById('products', e.record.id)
      record.set('embedding', embedding)
      $app.saveNoValidate(record)
    }
  } catch (err) {
    $app.logger().error('Failed to update embedding', 'error', err.message)
  }
  return e.next()
}, 'products')
