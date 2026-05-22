migrate(
  (app) => {
    // Enable Master to list users to assign products to partners
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.listRule = "id = @request.auth.id || @request.auth.role = 'master'"
    users.viewRule = "id = @request.auth.id || @request.auth.role = 'master'"
    app.save(users)

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
        {
          name: 'image',
          type: 'file',
          maxSelect: 1,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
        },
        { name: 'original_price', type: 'number', required: true },
        { name: 'promo_price', type: 'number', required: true },
        {
          name: 'partner_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'active', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(products)

    const catalogs = new Collection({
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
        {
          name: 'cover_image',
          type: 'file',
          maxSelect: 1,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['active', 'inactive'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(catalogs)

    const catalogItems = new Collection({
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
          required: true,
          collectionId: catalogs.id,
          maxSelect: 1,
        },
        {
          name: 'product_id',
          type: 'relation',
          required: true,
          collectionId: products.id,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(catalogItems)

    // Seed Data (merged to ensure proper ordering relative to pending migrations)
    let partnerId
    try {
      const p = app.findAuthRecordByEmail('_pb_users_auth_', 'partner@seed.com')
      partnerId = p.id
    } catch (_) {
      const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
      const newPartner = new Record(usersCol)
      newPartner.setEmail('partner@seed.com')
      newPartner.setPassword('Skip@Pass')
      newPartner.setVerified(true)
      newPartner.set('name', 'Seed Partner')
      newPartner.set('role', 'partner')
      app.save(newPartner)
      partnerId = newPartner.id
    }

    const productsData = [
      {
        name: 'iPhone 13 Pro',
        description: 'Apple iPhone 13 Pro 128GB',
        original_price: 5000,
        promo_price: 4500,
        active: true,
      },
      {
        name: 'AirPods Pro',
        description: 'Noise cancelling earphones',
        original_price: 1500,
        promo_price: 1200,
        active: true,
      },
      {
        name: 'Supermarket Voucher',
        description: 'R$ 500 voucher for local supermarket',
        original_price: 500,
        promo_price: 450,
        active: true,
      },
      {
        name: 'Pharmacy Discount',
        description: 'R$ 200 discount at health stores',
        original_price: 200,
        promo_price: 150,
        active: true,
      },
      {
        name: 'Smart TV 55',
        description: '4K LED Smart TV',
        original_price: 3500,
        promo_price: 2900,
        active: true,
      },
    ]

    const productsCol = app.findCollectionByNameOrId('products')
    const createdIds = []
    for (const pd of productsData) {
      try {
        const existing = app.findFirstRecordByData('products', 'name', pd.name)
        createdIds.push(existing.id)
      } catch (_) {
        const rec = new Record(productsCol)
        rec.set('name', pd.name)
        rec.set('description', pd.description)
        rec.set('original_price', pd.original_price)
        rec.set('promo_price', pd.promo_price)
        rec.set('partner_id', partnerId)
        rec.set('active', pd.active)
        app.save(rec)
        createdIds.push(rec.id)
      }
    }

    const catalogsCol = app.findCollectionByNameOrId('catalogs')
    let catalogId
    try {
      const cat = app.findFirstRecordByData('catalogs', 'name', 'Welcome Catalog')
      catalogId = cat.id
    } catch (_) {
      const c = new Record(catalogsCol)
      c.set('name', 'Welcome Catalog')
      c.set('description', 'A special catalog for new employees with amazing discounts.')
      c.set('status', 'active')
      app.save(c)
      catalogId = c.id
    }

    const itemsCol = app.findCollectionByNameOrId('catalog_items')
    for (const pid of createdIds) {
      try {
        app.findFirstRecordByFilter(
          'catalog_items',
          `catalog_id = '${catalogId}' && product_id = '${pid}'`,
        )
      } catch (_) {
        const i = new Record(itemsCol)
        i.set('catalog_id', catalogId)
        i.set('product_id', pid)
        app.save(i)
      }
    }
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('catalog_items'))
    app.delete(app.findCollectionByNameOrId('catalogs'))
    app.delete(app.findCollectionByNameOrId('products'))

    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.listRule = 'id = @request.auth.id'
    users.viewRule = 'id = @request.auth.id'
    app.save(users)
  },
)
