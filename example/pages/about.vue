<template>
  <div>
    About
    <nuxt-link :to="{ name: 'index' }">
      index
    </nuxt-link>
  </div>
</template>

<script>
export default {
  async fetch ({ app }) {
    app.head.title = 'About'
    if (process.server) {
      await app.$analytics.track('Test event 1 in About page')
      await app.$analytics.track('Test event 2 in About page')
    }
  },

  head () {
    return {
      title: 'About'
    }
  },

  mounted () {
    /* this.$analytics.identify('f4ca124298', {
      name: 'Joe Doe',
      email: 'joedoe@example.com'
    }) */
    // this.$analytics.page('About')
    // this.$analytics.track('Signed Up', { plan: 'Enterprise' })
  }
}
</script>
