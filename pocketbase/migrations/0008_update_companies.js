migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('companies')

    // Remove empty/duplicate bin_prefix and cnpj to ensure unique indexes can be created
    app
      .db()
      .newQuery(
        `DELETE FROM companies WHERE id NOT IN (SELECT MIN(id) FROM companies GROUP BY bin_prefix) AND bin_prefix != ''`,
      )
      .execute()
    app
      .db()
      .newQuery(
        `DELETE FROM companies WHERE id NOT IN (SELECT MIN(id) FROM companies GROUP BY cnpj) AND cnpj != '' AND cnpj IS NOT NULL`,
      )
      .execute()

    // New text fields
    if (!col.fields.getByName('cnpj'))
      col.fields.add(new TextField({ name: 'cnpj', required: true }))
    if (!col.fields.getByName('zip_code')) col.fields.add(new TextField({ name: 'zip_code' }))
    if (!col.fields.getByName('address')) col.fields.add(new TextField({ name: 'address' }))
    if (!col.fields.getByName('phone')) col.fields.add(new TextField({ name: 'phone' }))
    if (!col.fields.getByName('whatsapp')) col.fields.add(new TextField({ name: 'whatsapp' }))
    if (!col.fields.getByName('market_segment'))
      col.fields.add(new TextField({ name: 'market_segment' }))

    // Hierarchy
    if (!col.fields.getByName('is_headquarters'))
      col.fields.add(new BoolField({ name: 'is_headquarters' }))
    if (!col.fields.getByName('parent_company_id'))
      col.fields.add(
        new RelationField({ name: 'parent_company_id', collectionId: col.id, maxSelect: 1 }),
      )

    // Ecosystem
    if (!col.fields.getByName('cobranded_id'))
      col.fields.add(
        new RelationField({ name: 'cobranded_id', collectionId: '_pb_users_auth_', maxSelect: 1 }),
      )
    if (!col.fields.getByName('affiliate_id'))
      col.fields.add(
        new RelationField({ name: 'affiliate_id', collectionId: '_pb_users_auth_', maxSelect: 1 }),
      )

    // Remove old legacy fields to avoid confusion (they will be dropped from schema)
    const legacyFields = ['is_matrix', 'matrix_id', 'co_manager_id', 'partner_id']
    for (const f of legacyFields) {
      if (col.fields.getByName(f)) col.fields.removeByName(f)
    }

    // Create unique indexes
    try {
      col.addIndex('idx_companies_cnpj', true, 'cnpj', "cnpj != ''")
      col.addIndex('idx_companies_bin', true, 'bin_prefix', "bin_prefix != ''")
    } catch (err) {
      console.log('Index creation bypassed:', err.message)
    }

    app.save(col)
  },
  (app) => {
    // Not implemented
  },
)
