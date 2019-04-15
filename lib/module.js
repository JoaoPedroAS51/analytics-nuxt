const { resolve } = require('path')

export default function (moduleOptions) {
  const options = Object.assign({
    debug: false,
    client: {
      id: undefined,
      callback: undefined
    },
    server: {
      id: undefined,
      flushAt: 20,
      flushInterval: 10000
    },
    useRouter: false
  }, this.options.analytics, moduleOptions)
  this.addPlugin({
    src: resolve(__dirname, 'server.js'),
    mode: 'server',
    options: { ...options.server, ...{ debug: options.debug, useRouter: options.useRouter } }
  })
  this.addPlugin({
    src: resolve(__dirname, 'client.js'),
    mode: 'client',
    options: { ...options.client, ...{ debug: options.debug, useRouter: options.useRouter } }
  })
}

module.exports.meta = require('../package.json')
