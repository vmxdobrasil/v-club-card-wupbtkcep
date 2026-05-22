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
