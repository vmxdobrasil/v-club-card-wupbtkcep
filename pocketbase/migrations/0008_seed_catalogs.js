migrate(
  (app) => {
    let partnerId
    try {
      const p = app.findAuthRecordByEmail('_pb_users_auth_', 'partner@seed.com')
      partnerId = p.id
    } catch (_) {
      const users = app.findCollectionByNameOrId('_pb_users_auth_')
      const newPartner = new Record(users)
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
    // Delete seed data logic if down migration is needed
  },
)
