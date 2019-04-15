<template>
  <div>
    Test
    <nuxt-link :to="{ name: 'about' }">
      about
    </nuxt-link>
  </div>
</template>

<script>
export default {
  async fetch ({ app }) {
    if (process.server) {
      await app.$analytics.track('Test event 1 in Home page')
      await app.$analytics.track('Test event 2 in Home page')
    }
  },

  head () {
    return {
      title: 'Home'
    }
  },

  mounted () {
    /* this.$analytics.identify('f4ca124298', {
      name: 'Joe Doe',
      email: 'joedoe@example.com'
    }) */
    // await this.$analytics.page('Test')
    // this.$analytics.track('Signed Up', { plan: 'Enterprise' })
  }
}
</script>
