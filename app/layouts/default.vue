<template>
  <div class="default-layout">
    <AppHeader />

    <UMain class="relative">
      <AppPageLoading />
      <div class="py-10">
        <slot />
      </div>
    </UMain>

    <USeparator icon="i-simple-icons-nuxtdotjs" />

    <AppFooter />
  </div>
</template>
