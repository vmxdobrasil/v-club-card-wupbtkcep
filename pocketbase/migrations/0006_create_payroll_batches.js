migrate(
  (app) => {
    const collection = new Collection({
      name: 'payroll_batches',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (@request.auth.role = 'master' || @request.auth.id = company_id.owner_id)",
      viewRule:
        "@request.auth.id != '' && (@request.auth.role = 'master' || @request.auth.id = company_id.owner_id)",
      createRule:
        "@request.auth.id != '' && (@request.auth.role = 'master' || @request.auth.id = company_id.owner_id)",
      updateRule:
        "@request.auth.id != '' && (@request.auth.role = 'master' || @request.auth.id = company_id.owner_id)",
      deleteRule:
        "@request.auth.id != '' && (@request.auth.role = 'master' || @request.auth.id = company_id.owner_id)",
      fields: [
        {
          name: 'company_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('companies').id,
          maxSelect: 1,
        },
        { name: 'type', type: 'select', required: true, selectValues: ['export', 'import'] },
        {
          name: 'status',
          type: 'select',
          required: true,
          selectValues: ['pending', 'processed', 'error'],
        },
        { name: 'batch_date', type: 'date', required: true },
        {
          name: 'file_record',
          type: 'file',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: [
            'text/csv',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/plain',
          ],
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_payroll_batches_company_date ON payroll_batches (company_id, batch_date)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('payroll_batches')
    app.delete(collection)
  },
)
