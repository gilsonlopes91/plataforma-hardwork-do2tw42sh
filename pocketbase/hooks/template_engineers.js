routerAdd(
  'GET',
  '/backend/v1/import-engineers/template',
  (e) => {
    if (e.auth?.getString('role') !== 'ADMIN') {
      return e.forbiddenError('Only admins can download the template.')
    }

    const headers = [
      'numero_formatado',
      'nome_salvo',
      'nome_publico',
      'nome_completo',
      'e_mail',
      'titulo_',
      'cidade',
      'inspetoria',
      'status_2026',
    ]

    const csv = headers.join(',') + '\n'

    return e.json(200, { template: csv })
  },
  $apis.requireAuth(),
)
