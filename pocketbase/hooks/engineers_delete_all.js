routerAdd(
  'DELETE',
  '/backend/v1/engineers/all',
  (e) => {
    if (!e.auth || e.auth.getString('role') !== 'ADMIN') {
      throw new ForbiddenError('Apenas administradores podem realizar esta ação')
    }

    $app.runInTransaction((txApp) => {
      // Clear relations first to maintain integrity
      txApp.db().newQuery('DELETE FROM user_selections').execute()
      // Clear all engineers
      txApp.db().newQuery('DELETE FROM engineers').execute()
    })

    return e.json(200, { success: true })
  },
  $apis.requireAuth(),
)
