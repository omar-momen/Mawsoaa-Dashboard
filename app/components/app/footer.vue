<script setup lang="ts">
const { t } = useI18n()
const appConfig = useAppConfig()
const appAuthor = computed(() => appConfig.app.author)
</script>

<template>
  <UFooter>
    <template #left>
      <p class="text-sm text-muted">
        {{ t('footer.copyright.made_by') }} <span
          class="font-bold"
          dir="ltr"
        >
          <a
            :href="appConfig.app.social.facebook"
            target="_blank"
          >{{ appAuthor }}</a>
        </span> • © {{ new Date().getFullYear() }}
      </p>
    </template>

    <template #right>
      <UButton
        :to="appConfig.app.social.facebook"
        target="_blank"
        icon="i-simple-icons-facebook"
        :aria-label="$t('accessibility.facebook')"
        color="neutral"
        variant="ghost"
      />
    </template>
  </UFooter>
</template>
