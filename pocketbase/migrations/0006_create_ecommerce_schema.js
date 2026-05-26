migrate(
  (app) => {
    const companiesCol = app.findCollectionByNameOrId('companies')

    const catalogs = new Collection({
      name: 'catalogs',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.role = 'master' || @request.auth.role = 'company'",
      updateRule: "@request.auth.role = 'master' || company_id.owner_id = @request.auth.id",
      deleteRule: "@request.auth.role = 'master' || company_id.owner_id = @request.auth.id",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text' },
        {
          name: 'company_id',
          type: 'relation',
          required: true,
          collectionId: companiesCol.id,
          maxSelect: 1,
        },
        { name: 'status', type: 'select', required: true, values: ['active', 'inactive'] },
        { name: 'start_date', type: 'date' },
        { name: 'end_date', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(catalogs)

    const products = new Collection({
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
          collectionId: catalogs.id,
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
    app.save(products)

    const aiAgents = new Collection({
      name: 'ai_agents',
      type: 'base',
      listRule: "@request.auth.role = 'master' || company_id.owner_id = @request.auth.id",
      viewRule: "@request.auth.role = 'master' || company_id.owner_id = @request.auth.id",
      createRule: "@request.auth.role = 'master' || @request.auth.role = 'company'",
      updateRule: "@request.auth.role = 'master' || company_id.owner_id = @request.auth.id",
      deleteRule: "@request.auth.role = 'master' || company_id.owner_id = @request.auth.id",
      fields: [
        {
          name: 'company_id',
          type: 'relation',
          required: true,
          collectionId: companiesCol.id,
          maxSelect: 1,
        },
        { name: 'agent_name', type: 'text' },
        { name: 'instructions', type: 'text' },
        { name: 'is_enabled', type: 'bool' },
        { name: 'welcome_message', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_ai_agents_company ON ai_agents (company_id)'],
    })
    app.save(aiAgents)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('ai_agents'))
    } catch (e) {}
    try {
      app.delete(app.findCollectionByNameOrId('products'))
    } catch (e) {}
    try {
      app.delete(app.findCollectionByNameOrId('catalogs'))
    } catch (e) {}
  },
)
