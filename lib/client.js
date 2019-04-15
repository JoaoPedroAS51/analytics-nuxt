import Vue from 'vue'
import loadScript from 'load-script'

const consola = require('consola')
const colors = require('colors')

export default function ({ app }, inject) {
  const config = <%= JSON.stringify(options) %>

  if (process.client) {
    if (!config.id || !config.id.length) {
      console.warn('Please enter a Segment.io client tracking ID')
      return
    }

    // Create a queue, but don't obliterate an existing one!
    const analytics = window.analytics = window.analytics || []

    // Set the callback
    const callback = config.callback;

    // Create debug function
    const debugAnalytics = (method, args) => {
      if (!config.debug) {
        return
      }

      if (consola && colors) {
        consola.log('\n')
        consola.info(colors.cyan('[Segment Analytics Debug]\n'))
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

    // If the real analytics.js is already on the page return.
    if (analytics.initialize) return

    // If the snippet was invoked already show an error.
    if (analytics.invoked) {
      if (window.console && console.error) {
        console.error('Segment snippet included twice.')
      }
      return
    }

    // Invoked flag, to make sure the snippet
    // is never invoked twice.
    analytics.invoked = true

    // A list of the methods in Analytics.js to stub.
    analytics.methods = [
      'trackSubmit',
      'trackClick',
      'trackLink',
      'trackForm',
      'pageview',
      'identify',
      'reset',
      'group',
      'track',
      'ready',
      'alias',
      'debug',
      'page',
      'once',
      'off',
      'on'
    ]

    // Define a factory to create stubs. These are placeholders
    // for methods in Analytics.js so that you never have to wait
    // for it to load to actually record data. The `method` is
    // stored as the first argument, so we can replay the data.
    analytics.factory = function (method) {
      return function () {
        var args = Array.prototype.slice.call(arguments)

        debugAnalytics(method.charAt(0).toUpperCase() + method.slice(1), args)

        if (config.debug !== true) {
          args.unshift(method)
          analytics.push(args)
          return analytics
        }
      }
    }

    // Add a version to keep track of what's in the wild.
    analytics.SNIPPET_VERSION = '4.1.0'

    // For each of our methods, generate a queueing stub.
    for (let key of analytics.methods) {
      analytics[key] = analytics.factory(key)
    }

    if (config.debug === false) {
      const source = `https://cdn.segment.com/analytics.js/v1/${config.id}/analytics.min.js`
      loadScript(source, function (error, script) {
        if (error) {
          console.warn('Ops! Is not possible to load Segment Analytics script')
          return
        }

        const poll = setInterval(function () {
          if (!analytics) {
            return
          }

          clearInterval(poll)

          // the callback is fired when window.analytics is available and before any other hit is sent
          if (callback && typeof callback === 'function') {
            callback()
          }
        }, 10)
      })
    } else {
      // Still run the callback in debug mode.
      if (callback && typeof callback === 'function') {
        callback()
      }
    }

    Object.defineProperty(app, '$analytics', {
      get () { return window.analytics }
    })
    Object.defineProperty(Vue, '$analytics', {
      get () { return window.analytics }
    })
    Object.defineProperty(Vue.prototype, '$analytics', {
      get () { return window.analytics }
    })

    if (app.hasOwnProperty('$analytics') && config.useRouter) {
      app.router.afterEach((to, from) => {
        // Make a page call for each navigation event
        app.$analytics.page(to.name || '', {
          path: to.fullPath,
          referrer: window.location.origin + from.fullPath,
          title: document.title,
          url: window.location.origin + to.fullPath
        })
      })
    }
  }
}
