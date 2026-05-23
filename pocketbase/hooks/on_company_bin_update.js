onRecordAfterUpdateSuccess((e) => {
  const oldPrefix = e.record.original().getString('bin_prefix')
  const newPrefix = e.record.getString('bin_prefix')

  if (oldPrefix !== newPrefix) {
    const logs = $app.findCollectionByNameOrId('bin_logs')
    const log = new Record(logs)
    log.set('company_id', e.record.id)
    log.set('old_prefix', oldPrefix)
    log.set('new_prefix', newPrefix)
    if (e.auth) {
      log.set('changed_by', e.auth.id)
    } else {
      try {
        const admin = $app.findFirstRecordByData('_pb_users_auth_', 'role', 'master')
        log.set('changed_by', admin.id)
      } catch (_) {}
    }
    $app.save(log)
  }

  e.next()
}, 'companies')
