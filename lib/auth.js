module.exports = function (app, user, password) {
  app.use(function* (next) {
    const challenge = `Basic realm="Node File Manager"`
    let authorization = this.header['authorization']
    if (authorization != null && authorization.slice(0, 6) === 'Basic ') {
      authorization = new Buffer(authorization.slice(6), 'base64').toString('utf8')
      const splitIndex = authorization.indexOf(':')
      if (splitIndex > -1) {
        const user = authorization.slice(0, splitIndex)
        const password = authorization.slice(splitIndex + 1)
        this.request.auth = {
          user: user,
          password: password
        }
      }
    }

    yield next

    if (this.request.auth == null) {
      this.status = 401
      this.response.set('WWW-Authenticate', challenge)
    }
  })

  app.use(function* (next) {
    if (!this.request.auth) {
      this.body = 'Please log in.'
      return // 401 response
    }

    if (this.request.auth.user !== user || this.request.auth.password !== password) {
      this.body = 'Invalid user.'
      delete this.request.auth
      return // 401 response
    }

    yield next
  })
}