migrate(
  (app) => {
    const updates = {
      companies: {
        list: "(@request.auth.id != '') && (deleted_at = '' || @request.auth.role = 'master')",
        view: "(@request.auth.id != '') && (deleted_at = '' || @request.auth.role = 'master')",
      },
      card_holders: {
        list: "(@request.auth.id != '') && (deleted_at = '' || @request.auth.role = 'master')",
        view: "(@request.auth.id != '') && (deleted_at = '' || @request.auth.role = 'master')",
      },
      products: {
        list: "deleted_at = '' || @request.auth.role = 'master'",
        view: "deleted_at = '' || @request.auth.role = 'master'",
      },
      catalogs: {
        list: "deleted_at = '' || @request.auth.role = 'master'",
        view: "deleted_at = '' || @request.auth.role = 'master'",
      },
    }

    for (const [name, rules] of Object.entries(updates)) {
      const col = app.findCollectionByNameOrId(name)
      col.listRule = rules.list
      col.viewRule = rules.view
      app.save(col)
    }
  },
  (app) => {
    const originals = {
      companies: { list: "@request.auth.id != ''", view: "@request.auth.id != ''" },
      card_holders: { list: "@request.auth.id != ''", view: "@request.auth.id != ''" },
      products: { list: '', view: '' },
      catalogs: { list: '', view: '' },
    }

    for (const [name, rules] of Object.entries(originals)) {
      try {
        const col = app.findCollectionByNameOrId(name)
        col.listRule = rules.list
        col.viewRule = rules.view
        app.save(col)
      } catch (_) {}
    }
  },
)
