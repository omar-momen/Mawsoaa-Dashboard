<script setup lang="ts">
import * as locales from '@nuxt/ui/locale'

const { locale } = useI18n()

// Get the Nuxt UI locale object based on current i18n locale
const nuxtUILocale = computed(() => {
  const localeKey = locale.value as keyof typeof locales
  return locales[localeKey] || locales.en
})

// Dynamic language and direction based on locale
const lang = computed(() => nuxtUILocale.value?.code || 'en')
const dir = computed(() => nuxtUILocale.value?.dir || 'ltr')

const { t } = useI18n()
const appConfig = useAppConfig()

const appTitle = computed(() => t('app.title'))
const appDescription = computed(() => t('app.desc'))

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    // Standard favicon
    { rel: 'icon', href: '/favicon.ico' },

    // PNG icons
    { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
    { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
    // { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon-96x96.png' },
    { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/android-chrome-192x192.png' },
    { rel: 'icon', type: 'image/png', sizes: '512x512', href: '/android-chrome-512x512.png' },

    // Apple Touch Icon
    { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }

    // Safari pinned tab
    // { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#f0f' },
  ],
  htmlAttrs: {
    lang,
    dir
  }
})

useSeoMeta({
  title: appTitle,
  description: appDescription,
  ogTitle: appTitle,
  ogDescription: appDescription,
  ogImage: appConfig.app.seo.ogImage,
  twitterImage: appConfig.app.seo.ogImage,
  twitterCard: appConfig.app.seo.twitterCard
})
</script>

<template>
  <UApp :locale="nuxtUILocale">
    <NuxtLoadingIndicator />

    <AppLoading />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
