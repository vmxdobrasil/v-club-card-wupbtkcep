onRecordCreate((e) => {
  if (e.record.getString('card_number')) return

  const companyId = e.record.get('company_id')
  let bin = '636943'
  if (companyId) {
    try {
      const company = $app.findRecordById('companies', companyId)
      bin = company.getString('bin_prefix') || bin
    } catch (_) {}
  }

  const seq = $security.randomStringWithAlphabet(10, '0123456789')
  e.record.set('card_number', bin + seq)
  e.record.set('cvv', $security.randomStringWithAlphabet(3, '0123456789'))

  const d = new Date()
  d.setFullYear(d.getFullYear() + 5)
  e.record.set('expiry', d.toISOString().replace('T', ' ').replace('Z', ''))

  e.next()
}, 'card_holders')
