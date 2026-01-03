<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: false
})

const { t } = useI18n()
const router = useRouter()
const localePath = useLocalePath()
const authStore = useAuthStore()
const toast = useToast()

const isLoading = ref(false)

async function onSubmit(event: FormSubmitEvent<{ email: string, password: string }>) {
  isLoading.value = true

  await authStore.login({
    email: event.data.email,
    password: event.data.password
  })

  // Only show success and redirect if user is authenticated (login was successful)
  if (authStore.isAuthenticated) {
    toast.add({
      title: t('login.success.title'),
      description: t('login.success.description'),
      color: 'success'
    })

    await router.push(localePath('/dashboard'))
  }

  isLoading.value = false
}
</script>

<template>
  <div class="min-h-screen flex">
    <!-- Left Side - Branding & Illustration -->
    <AuthLoginInfo />

    <!-- Right Side - Login Form -->
    <div class="flex-1 flex items-center justify-center p-6 lg:p-12 relative bg-linear-to-br from-bg-body to-bg-main before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_20%_50%,rgba(99,102,241,0.03)_0%,transparent_50%),radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.03)_0%,transparent_50%)] before:pointer-events-none">
      <AuthLoginForm
        :is-loading="isLoading"
        @submit="onSubmit"
      />
    </div>
  </div>
</template>
