migrate(
  (app) => {
    const companies = app.findCollectionByNameOrId('companies')

    const products = new Collection({
      name: 'products',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule:
        "@request.auth.role = 'master' || (@request.auth.role = 'company' && company_id.owner_id = @request.auth.id)",
      updateRule:
        "@request.auth.role = 'master' || (@request.auth.role = 'company' && company_id.owner_id = @request.auth.id)",
      deleteRule:
        "@request.auth.role = 'master' || (@request.auth.role = 'company' && company_id.owner_id = @request.auth.id)",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'price', type: 'number' },
        {
          name: 'image',
          type: 'file',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
        {
          name: 'company_id',
          type: 'relation',
          required: true,
          collectionId: companies.id,
          cascadeDelete: true,
          maxSelect: 1,
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
    app.save(products)

    const catalogs = new Collection({
      name: 'catalogs',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule:
        "@request.auth.role = 'master' || (@request.auth.role = 'company' && company_id.owner_id = @request.auth.id)",
      updateRule:
        "@request.auth.role = 'master' || (@request.auth.role = 'company' && company_id.owner_id = @request.auth.id)",
      deleteRule:
        "@request.auth.role = 'master' || (@request.auth.role = 'company' && company_id.owner_id = @request.auth.id)",
      fields: [
        { name: 'name', type: 'text', required: true },
        {
          name: 'company_id',
          type: 'relation',
          required: true,
          collectionId: companies.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'slug', type: 'text', required: true },
        { name: 'is_promotional', type: 'bool' },
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
      indexes: ['CREATE UNIQUE INDEX idx_catalogs_slug ON catalogs (slug)'],
    })
    app.save(catalogs)

    const catalogItems = new Collection({
      name: 'catalog_items',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule:
        "@request.auth.role = 'master' || (@request.auth.role = 'company' && catalog_id.company_id.owner_id = @request.auth.id)",
      updateRule:
        "@request.auth.role = 'master' || (@request.auth.role = 'company' && catalog_id.company_id.owner_id = @request.auth.id)",
      deleteRule:
        "@request.auth.role = 'master' || (@request.auth.role = 'company' && catalog_id.company_id.owner_id = @request.auth.id)",
      fields: [
        {
          name: 'product_id',
          type: 'relation',
          required: true,
          collectionId: products.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'catalog_id',
          type: 'relation',
          required: true,
          collectionId: catalogs.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(catalogItems)

    const leads = new Collection({
      name: 'leads',
      type: 'base',
      listRule:
        "@request.auth.role = 'master' || (@request.auth.role = 'company' && catalog_id.company_id.owner_id = @request.auth.id)",
      viewRule:
        "@request.auth.role = 'master' || (@request.auth.role = 'company' && catalog_id.company_id.owner_id = @request.auth.id)",
      createRule: '',
      updateRule:
        "@request.auth.role = 'master' || (@request.auth.role = 'company' && catalog_id.company_id.owner_id = @request.auth.id)",
      deleteRule:
        "@request.auth.role = 'master' || (@request.auth.role = 'company' && catalog_id.company_id.owner_id = @request.auth.id)",
      fields: [
        { name: 'name', type: 'text' },
        { name: 'contact_info', type: 'text' },
        {
          name: 'catalog_id',
          type: 'relation',
          required: true,
          collectionId: catalogs.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'source', type: 'text' },
        { name: 'interaction_history', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(leads)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('leads'))
    } catch (e) {}
    try {
      app.delete(app.findCollectionByNameOrId('catalog_items'))
    } catch (e) {}
    try {
      app.delete(app.findCollectionByNameOrId('catalogs'))
    } catch (e) {}
    try {
      app.delete(app.findCollectionByNameOrId('products'))
    } catch (e) {}
  },
)
