migrate(
  (app) => {
    const collection = new Collection({
      name: 'products',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.role = 'master' || @request.auth.role = 'company'",
      updateRule:
        "@request.auth.role = 'master' || catalog_id.company_id.owner_id = @request.auth.id",
      deleteRule:
        "@request.auth.role = 'master' || catalog_id.company_id.owner_id = @request.auth.id",
      fields: [
        {
          name: 'catalog_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('catalogs').id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'original_price', type: 'number' },
        { name: 'promo_price', type: 'number' },
        {
          name: 'image',
          type: 'file',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
        {
          name: 'stock_status',
          type: 'select',
          required: true,
          values: ['in_stock', 'out_of_stock'],
        },
        { name: 'order', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('products')
    app.delete(collection)
  },
)
