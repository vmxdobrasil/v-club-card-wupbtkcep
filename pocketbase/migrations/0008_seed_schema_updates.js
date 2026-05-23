migrate(
  (app) => {
    const colCompanies = app.findCollectionByNameOrId('companies')
    if (!colCompanies.fields.getByName('zip_code')) {
      colCompanies.fields.add(new TextField({ name: 'zip_code' }))
      colCompanies.fields.add(new TextField({ name: 'address' }))
      colCompanies.fields.add(new TextField({ name: 'neighborhood' }))
      colCompanies.fields.add(new TextField({ name: 'city' }))
      colCompanies.fields.add(new TextField({ name: 'state' }))
      colCompanies.fields.add(
        new RelationField({
          name: 'parent_company_id',
          collectionId: colCompanies.id,
          maxSelect: 1,
        }),
      )

      colCompanies.fields.add(new TextField({ name: 'number' }))
      colCompanies.fields.add(new TextField({ name: 'complement' }))
      colCompanies.fields.add(new TextField({ name: 'phone' }))
      colCompanies.fields.add(new TextField({ name: 'whatsapp' }))
      colCompanies.fields.add(new BoolField({ name: 'is_headquarters' }))
      colCompanies.fields.add(new TextField({ name: 'market_segment' }))
      colCompanies.fields.add(
        new RelationField({ name: 'cobranded_id', collectionId: '_pb_users_auth_', maxSelect: 1 }),
      )
      colCompanies.fields.add(
        new RelationField({ name: 'affiliate_id', collectionId: '_pb_users_auth_', maxSelect: 1 }),
      )
      colCompanies.fields.add(new BoolField({ name: 'is_partner' }))
      app.save(colCompanies)
    }

    try {
      app.findCollectionByNameOrId('products')
    } catch (_) {
      const productsCollection = new Collection({
        name: 'products',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.role = 'master'",
        updateRule: "@request.auth.role = 'master'",
        deleteRule: "@request.auth.role = 'master'",
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'description', type: 'text' },
          { name: 'price', type: 'number', required: true },
          {
            name: 'image',
            type: 'file',
            maxSelect: 1,
            mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
          },
          { name: 'status', type: 'select', values: ['active', 'inactive'], required: true },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(productsCollection)
    }

    try {
      app.findCollectionByNameOrId('company_products')
    } catch (_) {
      const productsCollection = app.findCollectionByNameOrId('products')
      const companyProductsCollection = new Collection({
        name: 'company_products',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.role = 'master' || @request.auth.role = 'company'",
        updateRule: "@request.auth.role = 'master' || @request.auth.role = 'company'",
        deleteRule: "@request.auth.role = 'master' || @request.auth.role = 'company'",
        fields: [
          {
            name: 'company_id',
            type: 'relation',
            collectionId: colCompanies.id,
            required: true,
            maxSelect: 1,
            cascadeDelete: true,
          },
          {
            name: 'product_id',
            type: 'relation',
            collectionId: productsCollection.id,
            required: true,
            maxSelect: 1,
            cascadeDelete: true,
          },
          { name: 'custom_price', type: 'number' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(companyProductsCollection)
    }

    try {
      app.findCollectionByNameOrId('bin_logs')
    } catch (_) {
      const binLogsCollection = new Collection({
        name: 'bin_logs',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: null,
        updateRule: null,
        deleteRule: null,
        fields: [
          {
            name: 'company_id',
            type: 'relation',
            collectionId: colCompanies.id,
            required: true,
            maxSelect: 1,
            cascadeDelete: true,
          },
          { name: 'user_id', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
          { name: 'old_prefix', type: 'text' },
          { name: 'new_prefix', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(binLogsCollection)
    }

    try {
      app.findCollectionByNameOrId('catalogs')
    } catch (_) {
      const catalogsCollection = new Collection({
        name: 'catalogs',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.role = 'master'",
        updateRule: "@request.auth.role = 'master'",
        deleteRule: "@request.auth.role = 'master'",
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'description', type: 'text' },
          { name: 'status', type: 'select', values: ['active', 'inactive'], required: true },
          {
            name: 'cover_image',
            type: 'file',
            maxSelect: 1,
            mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
          },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(catalogsCollection)
    }

    try {
      app.findCollectionByNameOrId('catalog_items')
    } catch (_) {
      const catalogsCollection = app.findCollectionByNameOrId('catalogs')
      const productsCollection = app.findCollectionByNameOrId('products')
      const catalogItemsCollection = new Collection({
        name: 'catalog_items',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.role = 'master'",
        updateRule: "@request.auth.role = 'master'",
        deleteRule: "@request.auth.role = 'master'",
        fields: [
          {
            name: 'catalog_id',
            type: 'relation',
            collectionId: catalogsCollection.id,
            required: true,
            maxSelect: 1,
            cascadeDelete: true,
          },
          {
            name: 'product_id',
            type: 'relation',
            collectionId: productsCollection.id,
            required: true,
            maxSelect: 1,
            cascadeDelete: true,
          },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(catalogItemsCollection)
    }
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('catalog_items'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('catalogs'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('bin_logs'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('company_products'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('products'))
    } catch (_) {}

    try {
      const colCompanies = app.findCollectionByNameOrId('companies')
      colCompanies.fields.removeByName('zip_code')
      colCompanies.fields.removeByName('address')
      colCompanies.fields.removeByName('neighborhood')
      colCompanies.fields.removeByName('city')
      colCompanies.fields.removeByName('state')
      colCompanies.fields.removeByName('parent_company_id')
      colCompanies.fields.removeByName('number')
      colCompanies.fields.removeByName('complement')
      colCompanies.fields.removeByName('phone')
      colCompanies.fields.removeByName('whatsapp')
      colCompanies.fields.removeByName('is_headquarters')
      colCompanies.fields.removeByName('market_segment')
      colCompanies.fields.removeByName('cobranded_id')
      colCompanies.fields.removeByName('affiliate_id')
      colCompanies.fields.removeByName('is_partner')
      app.save(colCompanies)
    } catch (_) {}
  },
)
