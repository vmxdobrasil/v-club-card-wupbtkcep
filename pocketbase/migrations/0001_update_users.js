migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.fields.add(
      new SelectField({
        name: 'role',
        values: ['master', 'company', 'partner', 'holder'],
        maxSelect: 1,
        required: false,
      }),
    )
    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.fields.removeByName('role')
    app.save(users)
  },
)
