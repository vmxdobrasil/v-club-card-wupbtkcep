migrate(
  (app) => {
    // Update Companies to add Category
    const companies = app.findCollectionByNameOrId('companies')
    if (!companies.fields.getByName('category')) {
      companies.fields.add(
        new SelectField({
          name: 'category',
          maxSelect: 1,
          values: ['Supermarket', 'Pharmacy', 'Other'],
        }),
      )
      app.save(companies)
    }

    // Create Products
    const products = new Collection({
      name: 'products',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule:
        "@request.auth.id != '' && (@request.auth.role = 'master' || company_id.owner_id = @request.auth.id)",
      updateRule:
        "@request.auth.id != '' && (@request.auth.role = 'master' || company_id.owner_id = @request.auth.id)",
      deleteRule:
        "@request.auth.id != '' && (@request.auth.role = 'master' || company_id.owner_id = @request.auth.id)",
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
        { name: 'category', type: 'text' },
        {
          name: 'company_id',
          type: 'relation',
          required: true,
          collectionId: companies.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'embedding', type: 'vector', dimensions: 1536, distance: 'cosine' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_products_company ON products (company_id)'],
    })
    app.save(products)

    // Create Catalogs
    const catalogs = new Collection({
      name: 'catalogs',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule:
        "@request.auth.id != '' && (@request.auth.role = 'master' || company_id.owner_id = @request.auth.id)",
      updateRule:
        "@request.auth.id != '' && (@request.auth.role = 'master' || company_id.owner_id = @request.auth.id)",
      deleteRule:
        "@request.auth.id != '' && (@request.auth.role = 'master' || company_id.owner_id = @request.auth.id)",
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text' },
        {
          name: 'banner',
          type: 'file',
          maxSelect: 1,
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
        { name: 'product_ids', type: 'relation', collectionId: products.id, maxSelect: 100 },
        { name: 'status', type: 'select', required: true, values: ['active', 'inactive'] },
        { name: 'slug', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ["CREATE UNIQUE INDEX idx_catalogs_slug ON catalogs (slug) WHERE slug != ''"],
    })
    app.save(catalogs)

    // Create Leads
    const leads = new Collection({
      name: 'leads',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (@request.auth.role = 'master' || company_id.owner_id = @request.auth.id)",
      viewRule:
        "@request.auth.id != '' && (@request.auth.role = 'master' || company_id.owner_id = @request.auth.id)",
      createRule: '',
      updateRule:
        "@request.auth.id != '' && (@request.auth.role = 'master' || company_id.owner_id = @request.auth.id)",
      deleteRule:
        "@request.auth.id != '' && (@request.auth.role = 'master' || company_id.owner_id = @request.auth.id)",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'contact', type: 'text', required: true },
        { name: 'notes', type: 'json' },
        {
          name: 'company_id',
          type: 'relation',
          required: true,
          collectionId: companies.id,
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
    app.save(leads)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('leads'))
    app.delete(app.findCollectionByNameOrId('catalogs'))
    app.delete(app.findCollectionByNameOrId('products'))
    const companies = app.findCollectionByNameOrId('companies')
    companies.fields.removeByName('category')
    app.save(companies)
  },
)
