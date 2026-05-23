onRecordAfterUpdateSuccess((e) => {
  const orig = e.record.original()
  if (!orig) return e.next()

  const oldBin = orig.getString('bin_prefix')
  const newBin = e.record.getString('bin_prefix')

  if (oldBin !== newBin) {
    try {
      const logsCol = $app.findCollectionByNameOrId('bin_logs')
      const log = new Record(logsCol)
      log.set('company_id', e.record.id)
      log.set('previous_bin', oldBin)
      log.set('new_bin', newBin)
      if (e.auth) log.set('changed_by', e.auth.id)
      $app.saveNoValidate(log)
    } catch (err) {
      $app.logger().error('Error saving bin log', 'error', err.message)
    }
  }
  return e.next()
}, 'companies')
