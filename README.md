# Segment Nuxt Quickstart Guide

Analytics helps you measure your users, product, and business. It unlocks insights into your app's funnel, core business metrics, and whether you have product-market fit.

## Features

- Works in both, SPA and SSR
- Available anywhere ($root & context)
- Automatically fetch the `anonymousd_id` and `user_id` cookies
- Automatically record page views, if `useRouter` is set to `true` 

## Setup
To install Segment in your own app first [sign up](https://app.segment.com/signup) with Segment and locate your Segment project's **Write Key**.
You will need to create 2 Segment sources, one for the **client (js)** and one for the **server (node.js)**

Then, follow this three steps:
1. Add `analytics-nuxt` dependency using `yarn` or `npm` to your project
2. Add `analytics-nuxt` to `modules` section of `nuxt.config.js`
3. Configure it:

Replace `YOUR_CLIENT_WRITE_KEY` and `YOUR_SERVER_WRITE_KEY` in the code below with your Segment project's write key.

> **Tip!** You can find your write key in your Segment project setup guide or settings.

```js
{
  modules: [
    ['analytics-nuxt', {
      client: {
          id: 'YOUR_CLIENT_WRITE_KEY'
        },
        server: {
          id: 'YOUR_SERVER_WRITE_KEY'
        },
        useRouter: true
    }]
  ]
}
```

### Using top level options

```js
{
  modules: [
    'analytics-nuxt'
  ],

  analytics: {
    client: {
      id: 'YOUR_CLIENT_WRITE_KEY'
    },
    server: {
      id: 'YOUR_SERVER_WRITE_KEY'
    },
    useRouter: true
  }
}
```

Now `this.$analytics` and `app.$analytics` is loaded and available to use throughout your app!

## Usage

```html
<template>
  <h1>
    Home page.
  </h1>
</template>

<script>
export default {
  name: 'HomePage',
  mounted () {
    this.$analytics.page('Home')
    this.$analytics.track('Some event')
  }
}
</script>
```

## 📝 Docs & Feedback
Check out the full [Analytics.js](https://segment.com/docs/sources/website/analytics.js) and [Node.js](https://segment.com/docs/sources/server/node/) references to see what else is possible, or read about the [Tracking API methods](https://segment.com/docs/sources/server/http) to get a sense for the bigger picture.

## Development

- Clone this repository
- Install dependencies using `yarn install` or `npm install`
- Start development server using `npm run dev`

## License

[MIT License](./LICENSE)

Copyright (c) João Pedro Antunes Silva <joao-pedroas@hotmail.com>

