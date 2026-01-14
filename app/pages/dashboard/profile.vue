<script setup lang="ts">
definePageMeta({
  layout: 'dashboard'
})

const { t, locale } = useI18n()

// Fetch current user data
const { data: userData, pending, error, refresh } = await useApi<{ data: import('~/types/user').User }>(
  '/api/super-admin/auth/me'
)

const user = computed(() => userData.value?.data || null)

// Format date helper
const formatDate = (date: string | null | undefined) => {
  if (!date) return t('labels.not_available')
  return new Date(date).toLocaleDateString(locale.value === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-foreground">
        {{ t('pages.profile.title') }}
      </h1>
      <p class="text-sm text-muted-foreground mt-1">
        {{ t('pages.profile.description') }}
      </p>
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
          @click="refresh"
        >
          {{ t('retry') }}
        </UButton>
      </div>
    </UCard>

    <!-- Profile Details -->
    <UCard
      v-else-if="user"
      class="max-w-4xl mx-auto"
    >
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-foreground">
            {{ t('pages.profile.profile_information') }}
          </h3>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-refresh-cw"
            :loading="pending"
            @click="refresh"
          >
            {{ t('refresh') }}
          </UButton>
        </div>
      </template>

      <div class="space-y-6">
        <!-- Avatar Section -->
        <div class="flex items-center justify-center py-6 border-b border-border/30">
          <UAvatar
            v-if="user.avatar"
            :src="user.avatar"
            :alt="t('labels.avatar')"
            size="3xl"
            class="object-cover"
          />
          <UAvatar
            v-else
            :alt="user.name"
            size="3xl"
            class="bg-muted text-muted-foreground"
          >
            <template #fallback>
              <span class="text-2xl font-semibold">
                {{ user.name?.charAt(0).toUpperCase() }}
              </span>
            </template>
          </UAvatar>
        </div>

        <!-- User Information Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- ID -->
          <div>
            <p class="block text-sm font-medium text-muted-foreground mb-2">
              {{ t('labels.id') }}
            </p>
            <p class="text-base text-foreground">
              {{ t('labels.id_prefix') }}{{ user.id }}
            </p>
          </div>

          <!-- Name -->
          <div>
            <p class="block text-sm font-medium text-muted-foreground mb-2">
              {{ t('labels.name') }}
            </p>
            <p class="text-base text-foreground">
              {{ user.name || t('labels.not_available') }}
            </p>
          </div>

          <!-- Email -->
          <div>
            <p class="block text-sm font-medium text-muted-foreground mb-2">
              {{ t('labels.email') }}
            </p>
            <div class="flex items-center gap-2">
              <p class="text-base text-foreground">
                {{ user.email || t('labels.not_available') }}
              </p>
              <UBadge
                v-if="user.email_verified_at"
                color="success"
                variant="subtle"
                size="xs"
              >
                {{ t('pages.profile.verified') }}
              </UBadge>
              <UBadge
                v-else
                color="warning"
                variant="subtle"
                size="xs"
              >
                {{ t('pages.profile.unverified') }}
              </UBadge>
            </div>
          </div>

          <!-- Phone -->
          <div>
            <p class="block text-sm font-medium text-muted-foreground mb-2">
              {{ t('labels.phone') }}
            </p>
            <p class="text-base text-foreground">
              {{ user.phone || t('labels.not_available') }}
            </p>
          </div>

          <!-- Roles -->
          <div>
            <p class="block text-sm font-medium text-muted-foreground mb-2">
              {{ t('labels.roles') }}
            </p>
            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="role in user.roles"
                :key="role.id"
                color="primary"
                variant="subtle"
              >
                {{ role.label }}
              </UBadge>
              <span
                v-if="!user.roles || user.roles.length === 0"
                class="text-base text-foreground"
              >
                {{ t('labels.not_available') }}
              </span>
            </div>
          </div>

          <!-- Super Admin Status -->
          <div>
            <p class="block text-sm font-medium text-muted-foreground mb-2">
              {{ t('pages.profile.account_type') }}
            </p>
            <UBadge
              :color="user.is_super_admin ? 'primary' : 'neutral'"
              variant="subtle"
            >
              {{ user.is_super_admin ? t('pages.profile.super_admin') : t('pages.profile.regular_user') }}
            </UBadge>
          </div>

          <!-- Email Verified At -->
          <div
            v-if="user.email_verified_at"
          >
            <p class="block text-sm font-medium text-muted-foreground mb-2">
              {{ t('pages.profile.email_verified_at') }}
            </p>
            <p class="text-base text-foreground">
              {{ formatDate(user.email_verified_at) }}
            </p>
          </div>

          <!-- Created At -->
          <div>
            <p class="block text-sm font-medium text-muted-foreground mb-2">
              {{ t('labels.created_at') }}
            </p>
            <p class="text-base text-foreground">
              {{ formatDate(user.created_at) }}
            </p>
          </div>

          <!-- Updated At -->
          <div>
            <p class="block text-sm font-medium text-muted-foreground mb-2">
              {{ t('labels.updated_at') }}
            </p>
            <p class="text-base text-foreground">
              {{ formatDate(user.updated_at) }}
            </p>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>
