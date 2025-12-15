<script setup lang="ts">
const { appLoading } = useLoading()
const { t } = useI18n()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="appLoading"
        class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      >
        <div class="flex flex-col items-center gap-4">
          <UProgress
            :model-value="null"
            size="lg"
            color="primary"
            animation="swing"
            class="w-64"
          />
          <p class="text-sm text-muted">
            {{ t('loading.loading') }}
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
