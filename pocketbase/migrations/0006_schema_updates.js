migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('companies')
    if (!col.fields.getByName('zip_code')) col.fields.add(new TextField({ name: 'zip_code' }))
    if (!col.fields.getByName('street')) col.fields.add(new TextField({ name: 'street' }))
    if (!col.fields.getByName('number')) col.fields.add(new TextField({ name: 'number' }))
    if (!col.fields.getByName('complement')) col.fields.add(new TextField({ name: 'complement' }))
    if (!col.fields.getByName('neighborhood'))
      col.fields.add(new TextField({ name: 'neighborhood' }))
    if (!col.fields.getByName('city')) col.fields.add(new TextField({ name: 'city' }))
    if (!col.fields.getByName('state')) col.fields.add(new TextField({ name: 'state' }))
    if (!col.fields.getByName('phone')) col.fields.add(new TextField({ name: 'phone' }))
    if (!col.fields.getByName('whatsapp')) col.fields.add(new TextField({ name: 'whatsapp' }))
    if (!col.fields.getByName('is_headquarters'))
      col.fields.add(new BoolField({ name: 'is_headquarters' }))
    if (!col.fields.getByName('is_partner')) col.fields.add(new BoolField({ name: 'is_partner' }))
    if (!col.fields.getByName('market_segment'))
      col.fields.add(new TextField({ name: 'market_segment' }))
    if (!col.fields.getByName('parent_company_id'))
      col.fields.add(
        new RelationField({ name: 'parent_company_id', collectionId: col.id, maxSelect: 1 }),
      )
    if (!col.fields.getByName('cobranded_id'))
      col.fields.add(
        new RelationField({ name: 'cobranded_id', collectionId: '_pb_users_auth_', maxSelect: 1 }),
      )
    if (!col.fields.getByName('affiliate_id'))
      col.fields.add(
        new RelationField({ name: 'affiliate_id', collectionId: '_pb_users_auth_', maxSelect: 1 }),
      )
    app.save(col)

    const products = new Collection({
      name: 'products',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
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
        { name: 'partner_id', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
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
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
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
        { name: 'company_id', type: 'relation', collectionId: col.id, maxSelect: 1 },
        { name: 'partner_id', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        { name: 'product_links', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(catalogs)

    const binHistory = new Collection({
      name: 'bin_history',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'company_id',
          type: 'relation',
          required: true,
          collectionId: col.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'old_prefix', type: 'text' },
        { name: 'new_prefix', type: 'text' },
        { name: 'changed_by', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(binHistory)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('bin_history'))
    } catch (_) {}

    try {
      app.delete(app.findCollectionByNameOrId('catalogs'))
    } catch (_) {}

    try {
      app.delete(app.findCollectionByNameOrId('products'))
    } catch (_) {}

    const col = app.findCollectionByNameOrId('companies')
    const fields = [
      'zip_code',
      'street',
      'number',
      'complement',
      'neighborhood',
      'city',
      'state',
      'phone',
      'whatsapp',
      'is_headquarters',
      'is_partner',
      'market_segment',
      'parent_company_id',
      'cobranded_id',
      'affiliate_id',
    ]
    fields.forEach((f) => {
      if (col.fields.getByName(f)) col.fields.removeByName(f)
    })
    app.save(col)
  },
)
