<script setup lang="ts">
import * as locales from '@nuxt/ui/locale'

import type { NavigationMenuItem } from '@nuxt/ui'

const { locale, setLocale } = useI18n()

// Handle locale change with proper persistence
const handleLocaleChange = async (newLocale: 'ar' | 'en') => {
  await setLocale(newLocale)
}

const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: t('nav.links.about'),
    to: localePath('/about'),
    icon: 'i-lucide-info',
    active: route.path.startsWith('/about')
  },
  {
    label: t('nav.links.dashboard'),
    to: localePath('/dashboard'),
    icon: 'i-lucide-layout-dashboard',
    active: route.path.startsWith('/dashboard')
  }
])
</script>

<template>
  <UHeader
    toggle-side="right"
    :ui="{ right: 'flex gap-4' }"
  >
    <template #left>
      <ClientOnly>
        <AppLogo />
      </ClientOnly>
    </template>

    <UNavigationMenu :items="items" />

    <template #right>
      <ULocaleSelect
        :model-value="locale"
        :locales="[locales.ar, locales.en]"
        @update:model-value="handleLocaleChange($event as 'ar' | 'en')"
      />
      <UColorModeSwitch />
    </template>

    <template #body>
      <UNavigationMenu
        :items="items"
        orientation="vertical"
        class="-mx-2.5"
      />
    </template>
  </UHeader>
</template>
