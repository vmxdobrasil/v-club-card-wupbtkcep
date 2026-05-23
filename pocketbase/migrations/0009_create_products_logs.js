migrate(
  (app) => {
    // Products Collection
    try {
      app.findCollectionByNameOrId('products')
    } catch (_) {
      const products = new Collection({
        name: 'products',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.role = 'master' || @request.auth.role = 'partner'",
        updateRule: "@request.auth.role = 'master' || @request.auth.role = 'partner'",
        deleteRule: "@request.auth.role = 'master'",
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'description', type: 'text' },
          { name: 'base_price', type: 'number' },
          { name: 'status', type: 'select', values: ['active', 'inactive'], required: true },
          { name: 'partner_id', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(products)
    }

    // Company Products Collection (Catalog assignment)
    try {
      app.findCollectionByNameOrId('company_products')
    } catch (_) {
      const companyProducts = new Collection({
        name: 'company_products',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.role = 'master'",
        updateRule: "@request.auth.role = 'master'",
        deleteRule: "@request.auth.role = 'master'",
        fields: [
          {
            name: 'company_id',
            type: 'relation',
            collectionId: app.findCollectionByNameOrId('companies').id,
            required: true,
            maxSelect: 1,
          },
          {
            name: 'product_id',
            type: 'relation',
            collectionId: app.findCollectionByNameOrId('products').id,
            required: true,
            maxSelect: 1,
          },
          { name: 'custom_price', type: 'number' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(companyProducts)
    }

    // Audit Logs Collection
    try {
      app.findCollectionByNameOrId('audit_logs')
    } catch (_) {
      const logs = new Collection({
        name: 'audit_logs',
        type: 'base',
        listRule: "@request.auth.role = 'master'",
        viewRule: "@request.auth.role = 'master'",
        createRule: null, // Hook-only
        updateRule: null,
        deleteRule: null,
        fields: [
          { name: 'action', type: 'text', required: true },
          { name: 'collection_name', type: 'text', required: true },
          { name: 'record_id', type: 'text', required: true },
          { name: 'user_id', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
          { name: 'details', type: 'json' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(logs)
    }
  },
  (app) => {
    // Not implemented
  },
)
