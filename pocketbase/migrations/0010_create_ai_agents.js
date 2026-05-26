migrate(
  (app) => {
    const collection = new Collection({
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
          collectionId: app.findCollectionByNameOrId('companies').id,
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
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('ai_agents')
    app.delete(collection)
  },
)
