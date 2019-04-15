import cookie from 'cookie'
import Cookies from 'js-cookie'

const consola = require('consola')
const colors = require('colors')
const Analytics = require('analytics-node')
const uuidv4 = require('uuid/v4');

export default function ({ app, route, req, res }) {
  const config = <%= JSON.stringify(options) %>

  const wait = (ms) => {
    return new Promise(r => setTimeout(r, ms));
  }

  const getCookie = (cookieKey) => {
    if (process.server && req && typeof req.headers.cookie !== 'undefined') {
      const cookies = req.headers && req.headers.cookie ? cookie.parse(req.headers.cookie) : {}
      return cookies[cookieKey]
    }

    return Cookies.get(cookieKey) || null
  }

  const setCookie = (cookieKey, cookieValue) => {
    if (process.client) {
      Cookies.set(cookieKey, cookieValue)
    } else if (process.server && res) {
      const serializedCookie = cookie.serialize(cookieKey, cookieValue)
      res.setHeader('Set-Cookie', serializedCookie)
    }
  }

  if (process.server) {
    if (!config.id || !config.id.length) {
      console.warn('Please enter a Segment.io server tracking ID')
      return
    }

    const analytics = new Analytics(config.id, {
      flushAt: config.debug ? 1 : config.flushAt,
      flushInterval: config.flushInterval
    })

    const debugAnalytics = (method, args) => {
      if (!config.debug) {
        return
      }

      if (consola && colors) {
        consola.log('\n')
        consola.info(colors.cyan('[Segment Analytics Debug]\n' +
          '---------------------------\n'))
        consola.success(`${colors.magenta(method)} method called\n`)
        Object.keys(args).forEach((key) => {
          let value = args[key]

          if (!value) {
            value = colors.red(String(value))
          }

          if (typeof value === 'string' && value !== 'default') {
            value = `"${value}"`
          }

          if (value === 'default') {
            value = colors.cyan(String(value))
          }

          consola.log(colors.green(`${key}:`), value);
        });
      } else {
        consola.error(`${colors.cyan('[Segment Analytics Error]:')} Couldn't debug`)
      }
    }

    app.$analytics = app.$analytics = app.$analytics || [];

    // If the snippet was invoked already show an error.
    if (app.$analytics.invoked) {
      if (console && console.error) {
        console.error('Segment snippet included twice.')
      }
      return
    }

    app.$analytics.invoked = true

    if(!app.$analytics.hasOwnProperty('anonymousId')) {
      let anonymousIdCookie = getCookie('ajs_anonymous_id')

      if (!anonymousIdCookie) {
        anonymousIdCookie = uuidv4()

        setCookie('ajs_anonymous_id', `"${anonymousIdCookie}"`)
      }

      app.$analytics.anonymousId = anonymousIdCookie && anonymousIdCookie != null ? anonymousIdCookie.replace(/["]+/g, '') : null
    }

    if(!app.$analytics.hasOwnProperty('userId')) {
      const userId = getCookie('ajs_user_id')
      app.$analytics.userId = userId && userId != null ? userId.replace(/['"]+/g, '') : null
    }

    app.$analytics.identify = (userId = null, traits = {}, options = {}, callback) => {
      return new Promise(async (resolve, reject) => {
        const anonymousId = options.anonymousId || app.$analytics.anonymousId

        if (!userId && !anonymousId) {
          if(consola) {
            consola.error(`${colors.cyan('[Segment Analytics Error]:')} ${colors.magenta('Identify')} method must have either ${colors.green('userId')} or ${colors.green('anonymousId')}`)
            reject('[Segment Analytics Error]: Identify method must have either userId or anonymousId')
            return
          } else {
            reject('[Segment Analytics Error]: Identify method must have either userId or anonymousId')
            return
          }
        }

        debugAnalytics('Identify', {
          userId: userId,
          traits,
          timestamp: options.timestamp || 'default',
          context: options.context || 'default',
          integrations: options.integrations || 'default',
          anonymousId: anonymousId
        })

        if (config.debug === false) {
          analytics.identify({
            userId: userId,
            traits: traits,
            timestamp: options.timestamp,
            context: options.context,
            integrations: options.integrations,
            anonymousId: anonymousId
          });
        }

        // Still set the cookie in debug mode.
        if (userId !== null) {
          setCookie('ajs_user_id', `"${userId}"`)
        }

        // Still run the callback in debug mode.
        if (typeof callback === 'function') {
          callback()
        }

        setTimeout(resolve, 300)
      })
    }

    app.$analytics.track = (event = null, properties = {}, options = {}, callback = null) => {
      return new Promise(async (resolve, reject) => {
        const userId = options.userId || app.$analytics.userId
        const anonymousId = options.anonymousId || app.$analytics.anonymousId

        if (!userId && !anonymousId) {
          if(consola) {
            consola.error(`${colors.cyan('[Segment Analytics Error]:')} ${colors.magenta('Page')} method must have either ${colors.green('userId')} or ${colors.green('anonymousId')}`)
            reject('[Segment Analytics Error]: Track method must have either userId or anonymousId')
            return
          } else {
            reject('[Segment Analytics Error]: Track method must have either userId or anonymousId')
            return
          }
        }

        debugAnalytics('Track', {
          event,
          properties,
          timestamp: options.timestamp || 'default',
          context: options.context || 'default',
          integrations: options.integrations || 'default',
          userId,
          anonymousId
        })

        if (config.debug === false) {
          analytics.track({
            event: event,
            properties: properties,
            timestamp: options.timestamp,
            context: options.context,
            integrations: options.integrations,
            userId: userId,
            anonymousId: anonymousId
          })
        }

        // Still run the callback in debug mode.
        if (typeof callback === 'function') {
          callback()
        }

        setTimeout(resolve, 300)
      })
    }

    app.$analytics.page = (param1 = null, param2 = null, param3 = {}, param4 = {}, param5 = null) => {
      return new Promise(async (resolve, reject) => {
        let category = param1
        let name = param2
        let properties = param3
        let options = param4
        let callback = param5
        const userId = options.userId || app.$analytics.userId
        const anonymousId = options.anonymousId || app.$analytics.anonymousId

        if (!userId && !anonymousId) {
          if(consola) {
            consola.error(`${colors.cyan('[Segment Analytics Error]:')} ${colors.magenta('Page')} method must have either ${colors.green('userId')} or ${colors.green('anonymousId')}`)
            reject('[Segment Analytics Error]: Page method must have either userId or anonymousId')
            return
          } else {
            reject('[Segment Analytics Error]: Page method must have either userId or anonymousId')
            return
          }
        }

        if (typeof param1 === 'string' && param2 === null || typeof param2 !== 'string') {
          category = null
          name = param1
        }

        if (typeof param2 === 'object') {
          properties = param2
          options = param3
        }

        if (typeof param4 === 'function' && param5 === null) {
          callback = param4
        }

        debugAnalytics('Page', {
          category,
          name,
          properties: {
            ...{
              url: req.headers.host + route.fullPath,
              path: route.fullPath,
              title: app.head.title,
            }, ...properties
          },
          timestamp: options.timestamp || 'default',
          context: options.context || 'default',
          integrations: options.integrations || 'default',
          userId,
          anonymousId
        })

        // Still run the callback in debug mode.
        if (config.debug === false) {
          analytics.page({
            category: category,
            name: name,
            properties: {
              ...{
                url: req.headers.host + route.fullPath,
                path: route.fullPath,
                title: app.head.title,
              }, ...properties
            },
            timestamp: options.timestamp,
            context: options.context,
            integrations: options.integrations,
            userId: userId,
            anonymousId: anonymousId
          });
        }

        if (typeof callback === 'function') {
          callback()
        }

        setTimeout(resolve, 300)
      })
    }

    app.$analytics.group = (groupId = null, traits = {}, options = {}, callback) => {
      return new Promise(async (resolve, reject) => {
        const userId = options.userId || app.$analytics.userId
        const anonymousId = options.anonymousId || app.$analytics.anonymousId

        if (!userId && !anonymousId) {
          if(consola) {
            consola.error(`${colors.cyan('[Segment Analytics Error]:')} ${colors.magenta('Group')} method must have either ${colors.green('userId')} or ${colors.green('anonymousId')}`)
            reject('[Segment Analytics Error]: Group method must have either userId or anonymousId')
            return
          } else {
            reject('[Segment Analytics Error]: Group method must have either userId or anonymousId')
            return
          }
        }

        debugAnalytics('Group', {
          groupId,
          traits,
          timestamp: options.timestamp,
          context: options.context,
          integrations: options.integrations,
          userId,
          anonymousId
        })

        if (config.debug === false) {
          analytics.group({
            groupId: groupId,
            traits: traits,
            timestamp: options.timestamp || 'default',
            context: options.context || 'default',
            integrations: options.integrations || 'default',
            userId: userId,
            anonymousId: anonymousId
          });
        }

        // Still run the callback in debug mode.
        if (typeof callback === 'function') {
          callback()
        }

        setTimeout(resolve, 300)
      })
    }

    app.$analytics.alias = (userId = null, previousId = null, options = {}, callback) => {
      return new Promise(async (resolve, reject) => {
        previousId = previousId || app.$analytics.anonymousId

        if (!userId && !previousId) {
          if(consola) {
            consola.error(`${colors.cyan('[Segment Analytics Error]:')} ${colors.magenta('Alias')} method must have either ${colors.green('userId')} and ${colors.green('previousId')}`)
            reject('[Segment Analytics Error]: Alias method must have either userId and previousId')
            return
          } else {
            reject('[Segment Analytics Error]: Alias method must have either userId and previousId')
            return
          }
        }

        debugAnalytics('Alias', {
          userId,
          previousId: previousId.replace('"', ''),
          timestamp: options.timestamp || 'default',
          context: options.context || 'default',
          integrations: options.integrations || 'default',
        })

        if (config.debug === false) {
          analytics.alias({
            userId: userId,
            previousId: previousId,
            timestamp: options.timestamp,
            context: options.context,
            integrations: options.integrations,
          });
        }

        // Still run the callback in debug mode.
        if (typeof callback === 'function') {
          callback()
        }

        setTimeout(resolve, 300)
      })
    }
  }
}
