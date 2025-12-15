<template>
  <div class="default-layout">
    <AppHeader />

    <UMain class="relative">
      <AppPageLoading />
      <slot />
    </UMain>

    <USeparator icon="i-simple-icons-nuxtdotjs" />

    <AppFooter />
  </div>
</template>
