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

    const text = body.payload

    function parseCSVRow(line) {
      let inQuotes = false
      let current = ''
      const result = []
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ';' && !inQuotes) {
          result.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      result.push(current.trim())
      return result.map((v) => v.replace(/^"|"$/g, ''))
    }

    const lines = text.split(/\r?\n/).filter((line) => line.trim())
    if (lines.length < 2) {
      return e.badRequestError('The uploaded CSV is empty or has no data rows.')
    }

    const expectedCols = [
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

    const headers = parseCSVRow(lines[0])
    if (!headers.includes('nome_completo')) {
      return e.badRequestError(
        'Missing mandatory column: nome_completo. Please check the template.',
      )
    }

    let successCount = 0
    let failCount = 0
    let errors = []

    const col = $app.findCollectionByNameOrId('engineers')

    for (let i = 1; i < lines.length; i++) {
      const rowValues = parseCSVRow(lines[i])
      const rowNum = i + 1
      const row = {}
      headers.forEach((h, index) => {
        row[h] = rowValues[index] || ''
      })

      const nome_completo = (row.nome_completo || '').toString().trim()

      if (!nome_completo) {
        failCount++
        errors.push(`Row ${rowNum}: Missing 'nome_completo'`)
        continue
      }

      let record = null

      try {
        record = $app.findFirstRecordByData('engineers', 'nome_completo', nome_completo)
      } catch (_) {}

      if (!record) {
        record = new Record(col)
      }

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
