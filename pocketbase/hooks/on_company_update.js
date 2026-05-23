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
    try {
      const logsCol = $app.findCollectionByNameOrId('audit_logs')
      const log = new Record(logsCol)
      log.set('action', 'update')
      log.set('collection_name', 'companies')
      log.set('record_id', e.record.id)
      if (e.auth) log.set('user_id', e.auth.id)
      log.set('details', changes)
      $app.saveNoValidate(log)
    } catch (err) {
      $app.logger().error('Error saving audit log', 'error', err.message)
    }
  }

  // Acceptance Criteria: BIN Change History (Audit Log) -> bin_history collection
  if (oldBin !== newBin) {
    try {
      const binHistoryCol = $app.findCollectionByNameOrId('bin_history')
      const binLog = new Record(binHistoryCol)
      binLog.set('company_id', e.record.id)
      binLog.set('old_prefix', oldBin)
      binLog.set('new_prefix', newBin)
      if (e.auth) binLog.set('changed_by', e.auth.id)
      $app.saveNoValidate(binLog)
    } catch (err) {
      $app.logger().error('Error saving bin history', 'error', err.message)
    }
  }

  return e.next()
}, 'companies')
