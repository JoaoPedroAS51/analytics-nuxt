require('dotenv').config()
const { resolve } = require('path')

module.exports = {
  rootDir: resolve(__dirname, '..'),
  buildDIr: resolve(__dirname, '.nuxt'),
  srcDir: __dirname,
  modules: [
    '@@'
  ],
  analytics: {
    debug: false,
    client: {
      id: process.env.SEGMENT_CLIENT_KEY
    },
    server: {
      id: process.env.SEGMENT_SERVER_KEY
    },
    useRouter: true
  }
}
