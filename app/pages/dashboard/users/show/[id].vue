<script setup lang="ts">
definePageMeta({
  layout: 'dashboard'
})

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const localePath = useLocalePath()

const userId = computed(() => route.params.id as string)

// Fetch user data
const { data: userData, pending, error } = await useApi<{ data: Record<string, unknown> }>(
  `/api/admin/users/${userId.value}`
)

const user = computed(() => userData.value?.data || {})

// Handle back navigation
const handleBack = () => {
  router.push(localePath('/dashboard/users'))
}

// Format date helper
const formatDate = (date: string | null | undefined) => {
  if (!date) return t('labels.not_available')
  return new Date(date).toLocaleDateString()
}

// Get status badge class
const getStatusClass = (isActive: boolean) => {
  return isActive
    ? 'bg-success/10 text-success'
    : 'bg-error/10 text-error'
}
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <UButton
          :icon="locale === 'ar' ? 'i-lucide-arrow-right' : 'i-lucide-arrow-left'"
          color="neutral"
          variant="ghost"
          :aria-label="t('common.back')"
          @click="handleBack"
        />
        <h1 class="text-2xl font-bold text-foreground">
          {{ t('labels.user') }} {{ t('labels.id_prefix') }}{{ userId }}
        </h1>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="pending"
      class="flex flex-col items-center justify-center gap-4 py-12"
    >
      <UProgress
        :model-value="null"
        size="lg"
        color="primary"
        animation="swing"
        class="w-64"
      />
      <p class="text-sm text-muted-foreground">
        {{ t('loading.loading') }}
      </p>
    </div>

    <!-- Error State -->
    <UCard
      v-else-if="error"
      class="max-w-2xl mx-auto"
    >
      <template #header>
        <h3 class="text-lg font-semibold text-foreground">
          {{ t('error') }}
        </h3>
      </template>
      <div class="text-center py-8">
        <p class="text-muted-foreground mb-4">
          {{ t('error_loading_data') }}
        </p>
        <UButton
          color="primary"
          @click="handleBack"
        >
          {{ t('back') }}
        </UButton>
      </div>
    </UCard>

    <!-- User Details -->
    <UCard
      v-else
      class="max-w-4xl mx-auto"
    >
      <template #header>
        <h3 class="text-lg font-semibold text-foreground">
          {{ t('labels.user_details') }}
        </h3>
      </template>

      <div class="space-y-6">
        <!-- Avatar Section -->
        <div class="flex items-center justify-center py-6 border-b border-border/30">
          <UAvatar
            v-if="user.avatar && typeof user.avatar === 'string'"
            :src="user.avatar"
            :alt="t('labels.avatar')"
            size="3xl"
            class="object-cover"
          />
          <UAvatar
            v-else
            icon="i-lucide-user"
            size="3xl"
            class="bg-muted text-muted-foreground"
          />
        </div>

        <!-- User Information Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- ID -->
          <div>
            <label class="block text-sm font-medium text-muted-foreground mb-2">
              {{ t('labels.id') }}
            </label>
            <p class="text-base text-foreground">
              {{ t('labels.id_prefix') }}{{ user.id }}
            </p>
          </div>

          <!-- Name -->
          <div>
            <label class="block text-sm font-medium text-muted-foreground mb-2">
              {{ t('labels.name') }}
            </label>
            <p class="text-base text-foreground">
              {{ user.name || t('labels.not_available') }}
            </p>
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-muted-foreground mb-2">
              {{ t('labels.email') }}
            </label>
            <p class="text-base text-foreground">
              {{ user.email || t('labels.not_available') }}
            </p>
          </div>

          <!-- Phone -->
          <div>
            <label class="block text-sm font-medium text-muted-foreground mb-2">
              {{ t('labels.phone') }}
            </label>
            <p class="text-base text-foreground">
              {{ user.phone || t('labels.not_available') }}
            </p>
          </div>

          <!-- Status -->
          <div>
            <label class="block text-sm font-medium text-muted-foreground mb-2">
              {{ t('labels.status') }}
            </label>
            <span
              class="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium"
              :class="getStatusClass(user.is_active === true || user.is_active === 1)"
            >
              {{ user.is_active ? t('table.cells.active') : t('table.cells.inactive') }}
            </span>
          </div>

          <!-- Created At -->
          <div>
            <label class="block text-sm font-medium text-muted-foreground mb-2">
              {{ t('labels.created_at') }}
            </label>
            <p class="text-base text-foreground">
              {{ formatDate(user.created_at as string) }}
            </p>
          </div>

          <!-- Updated At -->
          <div
            v-if="user.updated_at"
            class="md:col-span-2"
          >
            <label class="block text-sm font-medium text-muted-foreground mb-2">
              {{ t('labels.updated_at') }}
            </label>
            <p class="text-base text-foreground">
              {{ formatDate(user.updated_at as string) }}
            </p>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-3">
          <UButton
            color="neutral"
            variant="ghost"
            @click="handleBack"
          >
            {{ t('back') }}
          </UButton>
        </div>
      </template>
    </UCard>
  </div>
</template>
