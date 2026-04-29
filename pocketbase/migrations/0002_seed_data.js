migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    const seedUser = (email, name, role) => {
      try {
        app.findAuthRecordByEmail('_pb_users_auth_', email)
      } catch (_) {
        const record = new Record(users)
        record.setEmail(email)
        record.setPassword('Skip@2026')
        record.setVerified(true)
        record.set('name', name)
        record.set('role', role)
        app.save(record)
      }
    }

    seedUser('eu@hardwork.com', 'Mestre', 'ADMIN')
    seedUser('admin@hardwork.com', 'Admin', 'ADMIN')
    seedUser('teste@hardwork.com', 'User', 'USER')

    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'gilsonlopes2991@gmail.com')
    } catch (_) {
      const record = new Record(users)
      record.setEmail('gilsonlopes2991@gmail.com')
      record.setPassword('Skip@Pass')
      record.setVerified(true)
      record.set('name', 'Gilson')
      record.set('role', 'ADMIN')
      app.save(record)
    }

    try {
      app.findFirstRecordByData('engineers', 'nome_completo', 'Roberto Almeida')
    } catch (_) {
      const engineers = app.findCollectionByNameOrId('engineers')

      const engs = [
        { num: '1', name: 'Roberto Almeida', cid: 'São Paulo', tit: 'Engenheiro Civil' },
        { num: '2', name: 'Fernanda Costa', cid: 'Rio de Janeiro', tit: 'Engenheiro Eletricista' },
        { num: '3', name: 'Carlos Eduardo', cid: 'Curitiba', tit: 'Engenheiro Mecânico' },
        { num: '4', name: 'Ana Paula', cid: 'Joinville', tit: 'Engenheiro Civil' },
      ]

      for (const e of engs) {
        const record = new Record(engineers)
        record.set('numero', e.num)
        record.set('nome_completo', e.name)
        record.set('cidade', e.cid)
        record.set('titulo_', e.tit)
        app.save(record)
      }
    }
  },
  (app) => {},
)
