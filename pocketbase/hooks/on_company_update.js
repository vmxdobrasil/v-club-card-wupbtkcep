onRecordAfterUpdateSuccess((e) => {
  const orig = e.record.original()
  if (!orig) return e.next()

  const oldBin = orig.getString('bin_prefix')
  const newBin = e.record.getString('bin_prefix')
  const oldStatus = orig.getString('status')
  const newStatus = e.record.getString('status')

  const changes = {}
  if (oldBin !== newBin) changes.bin_prefix = { old: oldBin, new: newBin }
  if (oldStatus !== newStatus) changes.status = { old: oldStatus, new: newStatus }

  if (Object.keys(changes).length > 0) {
    const logsCol = $app.findCollectionByNameOrId('audit_logs')
    const log = new Record(logsCol)
    log.set('action', 'update')
    log.set('collection_name', 'companies')
    log.set('record_id', e.record.id)
    if (e.auth) log.set('user_id', e.auth.id)
    log.set('details', changes)
    $app.saveNoValidate(log)
  }
  return e.next()
}, 'companies')
