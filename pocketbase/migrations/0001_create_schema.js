migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.fields.add(
      new SelectField({
        name: 'role',
        values: ['ADMIN', 'USER'],
        maxSelect: 1,
      }),
    )
    app.save(users)

    const engineers = new Collection({
      name: 'engineers',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'ADMIN'",
      updateRule: "@request.auth.role = 'ADMIN'",
      deleteRule: "@request.auth.role = 'ADMIN'",
      fields: [
        { name: 'numero', type: 'text' },
        { name: 'numero_corrigido', type: 'text' },
        { name: 'numero_formatado', type: 'text' },
        { name: 'nome_salvo', type: 'text' },
        { name: 'nome_publico', type: 'text' },
        { name: 'nome_completo', type: 'text', required: true },
        { name: 'e_mail', type: 'text' },
        { name: 'titulo_', type: 'text' },
        { name: 'cidade', type: 'text' },
        { name: 'inspetoria', type: 'text' },
        { name: 'status_2026', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(engineers)

    const user_selections = new Collection({
      name: 'user_selections',
      type: 'base',
      listRule: "@request.auth.role = 'ADMIN' || user_id = @request.auth.id",
      viewRule: "@request.auth.role = 'ADMIN' || user_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.role = 'ADMIN' || user_id = @request.auth.id",
      deleteRule: "@request.auth.role = 'ADMIN' || user_id = @request.auth.id",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'engineer_id',
          type: 'relation',
          required: true,
          collectionId: engineers.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'entrou_em_contato',
          type: 'select',
          values: ['Sim', 'Não', 'Pendente'],
          maxSelect: 1,
        },
        {
          name: 'esta_conosco',
          type: 'select',
          values: ['Sim', 'Não', 'Talvez', 'Pendente'],
          maxSelect: 1,
        },
        { name: 'observacoes', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_user_engineer ON user_selections (user_id, engineer_id)'],
    })
    app.save(user_selections)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('user_selections'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('engineers'))
    } catch (_) {}
    try {
      const users = app.findCollectionByNameOrId('_pb_users_auth_')
      users.fields.removeByName('role')
      app.save(users)
    } catch (_) {}
  },
)
