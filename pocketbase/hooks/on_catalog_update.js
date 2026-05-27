onRecordAfterUpdateSuccess((e) => {
  const r = e.record
  const o = r.original()

  if (
    r.getString('name') === o.getString('name') &&
    r.getString('description') === o.getString('description')
  ) {
    return e.next()
  }

  const text = `Catalog: ${r.getString('name')} - ${r.getString('description')}`

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
      const record = $app.findRecordById('catalogs', e.record.id)
      record.set('vector', embedding)
      $app.saveNoValidate(record)
    }
  } catch (err) {
    $app.logger().error('Failed to update catalog embedding', 'error', err.message)
  }
  return e.next()
}, 'catalogs')

onRecordAfterCreateSuccess((e) => {
  const text = `Catalog: ${e.record.getString('name')} - ${e.record.getString('description')}`

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
      const record = $app.findRecordById('catalogs', e.record.id)
      record.set('vector', embedding)
      $app.saveNoValidate(record)
    }
  } catch (err) {
    $app.logger().error('Failed to generate catalog embedding', 'error', err.message)
  }
  return e.next()
}, 'catalogs')
