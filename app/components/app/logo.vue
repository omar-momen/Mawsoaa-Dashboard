<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'

defineProps<{
  width?: string | number
  height?: string | number
}>()

defineOptions({
  name: 'AppLogo',
  inheritAttrs: false
})

const localePath = useLocalePath()
const colorMode = useColorMode()

const { width: windowWidth } = useWindowSize()

const isMobile = computed(() => windowWidth.value <= 767)
const isTablet = computed(() => windowWidth.value > 767 && windowWidth.value <= 1023)

// Dynamically build logo path based on theme and screen size
const logoSrc = computed(() => {
  const theme = colorMode.value === 'dark' ? 'light' : 'dark'
  if (isMobile.value) return `/logo/logo-mobile-${theme}.png`
  if (isTablet.value) return `/logo/logo-tablet-${theme}.png`
  return `/logo/logo-web-${theme}.png`
})

// Responsive logo dimensions - adjusted for sidebar context
const _width = computed(() => {
  if (isMobile.value) return 120
  if (isTablet.value) return 160
  return 180
})

const _height = computed(() => {
  if (isMobile.value) return 36
  if (isTablet.value) return 48
  return 54
})
</script>

<template>
  <NuxtLink
    class="shrink-0 block transition-opacity duration-200 hover:opacity-80"
    :to="localePath('/')"
    :aria-label="$t('accessibility.go_to_home')"
  >
    <NuxtImg
      :src="logoSrc"
      :width="width || _width"
      :height="height || _height"
      :alt="$t('app.title')"
      class="h-auto w-full object-contain"
      v-bind="$attrs"
    />
  </NuxtLink>
</template>
