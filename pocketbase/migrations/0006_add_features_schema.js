migrate(
  (app) => {
    const companies = app.findCollectionByNameOrId('companies')

    if (!companies.fields.getByName('cnpj')) companies.fields.add(new TextField({ name: 'cnpj' }))
    if (!companies.fields.getByName('address'))
      companies.fields.add(new TextField({ name: 'address' }))
    if (!companies.fields.getByName('number'))
      companies.fields.add(new TextField({ name: 'number' }))
    if (!companies.fields.getByName('complement'))
      companies.fields.add(new TextField({ name: 'complement' }))
    if (!companies.fields.getByName('neighborhood'))
      companies.fields.add(new TextField({ name: 'neighborhood' }))
    if (!companies.fields.getByName('city')) companies.fields.add(new TextField({ name: 'city' }))
    if (!companies.fields.getByName('state')) companies.fields.add(new TextField({ name: 'state' }))
    if (!companies.fields.getByName('cep')) companies.fields.add(new TextField({ name: 'cep' }))
    if (!companies.fields.getByName('social_links'))
      companies.fields.add(new JSONField({ name: 'social_links' }))
    if (!companies.fields.getByName('phone')) companies.fields.add(new TextField({ name: 'phone' }))
    if (!companies.fields.getByName('whatsapp'))
      companies.fields.add(new TextField({ name: 'whatsapp' }))
    if (!companies.fields.getByName('is_headquarters'))
      companies.fields.add(new BoolField({ name: 'is_headquarters' }))
    if (!companies.fields.getByName('is_partner'))
      companies.fields.add(new BoolField({ name: 'is_partner' }))
    if (!companies.fields.getByName('parent_company_id'))
      companies.fields.add(
        new RelationField({ name: 'parent_company_id', collectionId: companies.id, maxSelect: 1 }),
      )
    if (!companies.fields.getByName('market_segment'))
      companies.fields.add(new TextField({ name: 'market_segment' }))
    if (!companies.fields.getByName('cobranded_id'))
      companies.fields.add(
        new RelationField({ name: 'cobranded_id', collectionId: '_pb_users_auth_', maxSelect: 1 }),
      )
    if (!companies.fields.getByName('affiliate_id'))
      companies.fields.add(
        new RelationField({ name: 'affiliate_id', collectionId: '_pb_users_auth_', maxSelect: 1 }),
      )

    app.save(companies)

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
        deleteRule: "@request.auth.role = 'master' || @request.auth.role = 'partner'",
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'description', type: 'text' },
          { name: 'price', type: 'number' },
          {
            name: 'status',
            type: 'select',
            values: ['active', 'inactive'],
            required: true,
            maxSelect: 1,
          },
          { name: 'partner_id', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(products)
    }

    try {
      app.findCollectionByNameOrId('company_products')
    } catch (_) {
      const products = app.findCollectionByNameOrId('products')
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
            collectionId: companies.id,
            required: true,
            maxSelect: 1,
          },
          {
            name: 'product_id',
            type: 'relation',
            collectionId: products.id,
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

    try {
      app.findCollectionByNameOrId('catalogs')
    } catch (_) {
      const catalogs = new Collection({
        name: 'catalogs',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.role = 'master' || @request.auth.role = 'company'",
        updateRule: "@request.auth.role = 'master' || @request.auth.role = 'company'",
        deleteRule: "@request.auth.role = 'master' || @request.auth.role = 'company'",
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'description', type: 'text' },
          {
            name: 'status',
            type: 'select',
            values: ['active', 'inactive'],
            required: true,
            maxSelect: 1,
          },
          {
            name: 'cover_image',
            type: 'file',
            maxSelect: 1,
            maxSize: 5242880,
            mimeTypes: ['image/jpeg', 'image/png'],
          },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(catalogs)
    }

    try {
      app.findCollectionByNameOrId('catalog_items')
    } catch (_) {
      const products = app.findCollectionByNameOrId('products')
      const catalogs = app.findCollectionByNameOrId('catalogs')
      const catalogItems = new Collection({
        name: 'catalog_items',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          {
            name: 'catalog_id',
            type: 'relation',
            collectionId: catalogs.id,
            required: true,
            maxSelect: 1,
          },
          {
            name: 'product_id',
            type: 'relation',
            collectionId: products.id,
            required: true,
            maxSelect: 1,
          },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(catalogItems)
    }

    try {
      app.findCollectionByNameOrId('bin_history')
    } catch (_) {
      const binHistory = new Collection({
        name: 'bin_history',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: null,
        deleteRule: null,
        fields: [
          {
            name: 'company_id',
            type: 'relation',
            collectionId: companies.id,
            required: true,
            maxSelect: 1,
          },
          { name: 'old_prefix', type: 'text' },
          { name: 'new_prefix', type: 'text', required: true },
          { name: 'changed_by', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(binHistory)
    }

    try {
      app.findCollectionByNameOrId('audit_logs')
    } catch (_) {
      const auditLogs = new Collection({
        name: 'audit_logs',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
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
      app.save(auditLogs)
    }
  },
  (app) => {
    // rollback
  },
)
