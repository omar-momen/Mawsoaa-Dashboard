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
  <UHeader toggle-side="right">
    <template #left>
      <ClientOnly>
        <AppLogo />
      </ClientOnly>
    </template>

    <UNavigationMenu :items="items" />

    <template #right>
      <UColorModeSwitch />
      <ULocaleSelect
        :model-value="locale"
        :locales="[locales.ar, locales.en]"
        class="w-48"
        @update:model-value="handleLocaleChange($event as 'ar' | 'en')"
      />
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
