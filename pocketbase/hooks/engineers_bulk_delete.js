routerAdd(
  'POST',
  '/backend/v1/engineers/bulk-delete',
  (e) => {
    if (!e.auth || e.auth.getString('role') !== 'ADMIN') {
      throw new ForbiddenError('Apenas administradores podem realizar esta ação')
    }
    const body = e.requestInfo().body || {}
    const ids = body.ids || []
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestError('Nenhum ID fornecido para exclusão')
    }

    $app.runInTransaction((txApp) => {
      for (const id of ids) {
        try {
          // Remove orphaned relations
          txApp
            .db()
            .newQuery('DELETE FROM user_selections WHERE engineer_id = {:id}')
            .bind({ id: id })
            .execute()
          // Remove engineer record
          txApp.db().newQuery('DELETE FROM engineers WHERE id = {:id}').bind({ id: id }).execute()
        } catch (err) {
          // ignore errors for individual records
        }
      }
    })

    return e.json(200, { success: true })
  },
  $apis.requireAuth(),
)
