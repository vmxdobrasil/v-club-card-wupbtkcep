migrate(
  (app) => {
    const companies = app.findRecordsByFilter('companies', '1=1', '', 1, 0)
    if (companies.length === 0) return
    const company = companies[0]

    const catalogsCol = app.findCollectionByNameOrId('catalogs')
    const productsCol = app.findCollectionByNameOrId('products')

    let catalog
    try {
      catalog = app.findFirstRecordByData('catalogs', 'name', 'Summer Essentials')
    } catch (_) {
      catalog = new Record(catalogsCol)
      catalog.set('name', 'Summer Essentials')
      catalog.set('description', 'Best products for summer season')
      catalog.set('company_id', company.id)
      catalog.set('status', 'active')
      app.save(catalog)
    }

    const productsData = [
      { name: 'Sunscreen SPF 50', price: 19.99, sort: 1 },
      { name: 'Aloe Vera Gel', price: 9.99, sort: 2 },
      { name: 'Sunglasses', price: 29.99, sort: 3 },
    ]

    for (const p of productsData) {
      try {
        app.findFirstRecordByData('products', 'name', p.name)
      } catch (_) {
        const prod = new Record(productsCol)
        prod.set('name', p.name)
        prod.set('description', 'A great summer product')
        prod.set('price', p.price)
        prod.set('catalog_id', catalog.id)
        prod.set('status', 'active')
        prod.set('sort_order', p.sort)
        app.save(prod)
      }
    }
  },
  (app) => {
    // no-op
  },
)
