<script setup lang="ts">
import type { NuxtError } from '#app'

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

defineProps<{
  error: NuxtError
}>()

useSeoMeta({
  title: t('errors.page_not_found'),
  description: t('errors.page_not_found_desc')
})

useHead({
  htmlAttrs: {
    lang,
    dir
  }
})
</script>

<template>
  <UApp :locale="nuxtUILocale">
    <AppHeader />
    <UMain>
      <UContainer>
        <UError :error="error" />
      </UContainer>
    </UMain>
    <AppFooter />
  </UApp>
</template>
