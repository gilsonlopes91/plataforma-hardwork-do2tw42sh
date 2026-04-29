// @deps xlsx@0.18.5
routerAdd(
  'GET',
  '/backend/v1/import-engineers/template',
  (e) => {
    if (e.auth?.getString('role') !== 'ADMIN') {
      return e.forbiddenError('Only admins can download the template.')
    }

    const xlsx = require('xlsx')
    const headers = [
      'numero',
      'numero_corrigido',
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

    const wb = xlsx.utils.book_new()
    const ws = xlsx.utils.aoa_to_sheet([headers])
    xlsx.utils.book_append_sheet(wb, ws, 'Template')

    const base64 = xlsx.write(wb, { type: 'base64', bookType: 'xlsx' })

    return e.json(200, { template: base64 })
  },
  $apis.requireAuth(),
)
