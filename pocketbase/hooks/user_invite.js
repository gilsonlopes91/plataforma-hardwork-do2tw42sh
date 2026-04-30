onRecordAfterCreateSuccess((e) => {
  const email = e.record.getString('email')
  if (email) {
    const url = $secrets.get('PB_INSTANCE_URL') || 'http://127.0.0.1:8090'
    try {
      $http.send({
        url: url + '/api/collections/users/request-password-reset',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email }),
      })
    } catch (err) {
      $app.logger().error('Failed to send password reset', 'error', String(err))
    }
  }
  e.next()
}, 'users')
