// @deps xlsx@0.18.5
routerAdd(
  'POST',
  '/backend/v1/import-engineers',
  (e) => {
    if (e.auth?.getString('role') !== 'ADMIN') {
      return e.forbiddenError('Only admins can import data.')
    }

    const body = e.requestInfo().body || {}
    if (!body.payload) {
      return e.badRequestError('No file payload provided.')
    }

    const xlsx = require('xlsx')
    let workbook
    try {
      workbook = xlsx.read(body.payload, { type: 'base64' })
    } catch (err) {
      return e.badRequestError('Invalid Excel file format.')
    }

    const sheetName = workbook.SheetNames[0]
    const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' })

    if (rows.length === 0) {
      return e.badRequestError('The uploaded spreadsheet is empty.')
    }

    const firstRow = rows[0]
    const expectedCols = [
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

    const headers = Object.keys(firstRow)
    if (!headers.includes('nome_completo')) {
      return e.badRequestError(
        'Missing mandatory column: nome_completo. Please check the template.',
      )
    }

    let successCount = 0
    let failCount = 0
    let errors = []

    const col = $app.findCollectionByNameOrId('engineers')

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNum = i + 2 // Excel row number (header is 1)
      const numero = (row.numero || '').toString().trim()
      const nome_completo = (row.nome_completo || '').toString().trim()

      if (!nome_completo) {
        failCount++
        errors.push(`Row ${rowNum}: Missing 'nome_completo'`)
        continue
      }

      let record = null

      // Attempt to match by "numero"
      if (numero) {
        try {
          record = $app.findFirstRecordByData('engineers', 'numero', numero)
        } catch (_) {}
      }

      // Attempt to match by "nome_completo" if not found
      if (!record) {
        try {
          record = $app.findFirstRecordByData('engineers', 'nome_completo', nome_completo)
        } catch (_) {}
      }

      if (!record) {
        record = new Record(col)
      }

      // Upsert fields
      expectedCols.forEach((colName) => {
        if (row[colName] !== undefined && row[colName] !== null) {
          record.set(colName, row[colName].toString().trim())
        }
      })

      try {
        $app.save(record)
        successCount++
      } catch (err) {
        failCount++
        errors.push(`Row ${rowNum} (${nome_completo}): Save failed - ${err.message}`)
      }
    }

    return e.json(200, {
      success: successCount,
      failed: failCount,
      errors: errors.slice(0, 50),
    })
  },
  $apis.requireAuth(),
)
