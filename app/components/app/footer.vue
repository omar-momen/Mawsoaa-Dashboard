<script setup lang="ts">
const { t } = useI18n()
const appTitle = computed(() => t('app.title'))

const appConfig = useAppConfig()
</script>

<template>
  <UFooter>
    <template #left>
      <p class="text-sm text-muted">
        {{ t('footer.copyright.made_by') }} {{ appTitle }} • © {{ new Date().getFullYear() }}
      </p>
    </template>

    <template #right>
      <UButton
        :to="appConfig.app.social.github"
        target="_blank"
        icon="i-simple-icons-github"
        :aria-label="$t('accessibility.github')"
        color="neutral"
        variant="ghost"
      />
    </template>
  </UFooter>
</template>
