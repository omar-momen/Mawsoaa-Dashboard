<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import * as locales from '@nuxt/ui/locale'

const { t, locale, setLocale } = useI18n()

defineProps<{
  isLoading?: boolean
}>()

const emit = defineEmits<{
  submit: [event: FormSubmitEvent<z.output<typeof schema>>]
}>()

const schema = z.object({
  email: z.string().email(t('login.form.email_invalid')),
  password: z.string().min(1, t('login.form.password_required'))
})

type Schema = z.output<typeof schema>

const state = reactive({
  email: '',
  password: '',
  remember: false
})

function onSubmit(event: FormSubmitEvent<Schema>) {
  emit('submit', event)
}

const handleLocaleChange = async (newLocale: 'ar' | 'en') => {
  await setLocale(newLocale)
}
</script>

<template>
  <div class="w-full max-w-md space-y-6 relative z-10">
    <!-- Mobile Logo -->
    <div class="lg:hidden flex justify-center mb-6 animate-fade-in">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/50">
          <UIcon
            name="i-lucide-graduation-cap"
            class="w-6 h-6 text-white"
          />
        </div>
        <h1 class="text-2xl font-bold text-text-default">
          {{ t('login.branding.title') }}
        </h1>
      </div>
    </div>

    <!-- Login Card -->
    <div class="relative z-10 animate-slide-up">
      <UCard class="bg-bg-main border border-black/5 dark:border-white/10 shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_10px_25px_-5px_rgba(0,0,0,0.08),0_20px_40px_-10px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.3),0_10px_25px_-5px_rgba(0,0,0,0.4),0_20px_40px_-10px_rgba(0,0,0,0.3)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_15px_30px_-5px_rgba(0,0,0,0.1),0_25px_50px_-10px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_1px_3px_0_rgba(0,0,0,0.3),0_15px_30px_-5px_rgba(0,0,0,0.5),0_25px_50px_-10px_rgba(0,0,0,0.4)]">
        <template #header>
          <div class="text-center space-y-4 pb-2">
            <div class="flex justify-center mb-2">
              <div class="relative inline-flex">
                <div class="w-18 h-18 rounded-2xl bg-linear-to-br from-primary-50 to-secondary-50 dark:from-primary-900/30 dark:to-secondary-900/30 flex items-center justify-center border-2 border-primary-200/50 dark:border-primary-700/50 relative overflow-hidden transition-all duration-300 hover:scale-105 hover:rotate-2 hover:shadow-lg hover:shadow-primary-500/30 before:absolute before:-inset-1/2 before:w-full before:h-full before:bg-linear-to-r before:from-transparent before:via-white/10 before:to-transparent before:rotate-45 before:animate-shine">
                  <UIcon
                    name="i-lucide-lock"
                    class="w-7 h-7 text-primary-600 dark:text-primary-400 relative z-10"
                  />
                </div>
              </div>
            </div>
            <div class="space-y-1">
              <h2 class="text-3xl font-bold text-text-default tracking-tight">
                {{ t('login.form.title') }}
              </h2>
              <p class="text-sm text-text-para font-medium">
                {{ t('login.form.description') }}
              </p>
            </div>
          </div>
        </template>

        <UForm
          class="flex flex-col gap-1 pt-2"
          :schema="schema"
          :state="state"
          @submit="onSubmit"
        >
          <UFormField
            name="email"
            :label="t('login.form.email_label')"
            required
            class="mb-5"
          >
            <UInput
              v-model="state.email"
              type="email"
              :placeholder="t('login.form.email_placeholder')"
              size="lg"
              icon="i-lucide-mail"
              :disabled="isLoading"
              autocomplete="email"
              class="rounded-xl transition-all duration-200 focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:-translate-y-0.5 w-full"
            />
          </UFormField>

          <UFormField
            name="password"
            :label="t('login.form.password_label')"
            required
            class="mb-5"
          >
            <UInput
              v-model="state.password"
              type="password"
              :placeholder="t('login.form.password_placeholder')"
              size="lg"
              icon="i-lucide-lock"
              :disabled="isLoading"
              autocomplete="current-password"
              class="rounded-xl transition-all duration-200 focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:-translate-y-0.5 w-full"
            />
          </UFormField>

          <div class="flex items-center justify-between pt-1">
            <UCheckbox
              v-model="state.remember"
              :label="t('login.form.remember_me')"
              :disabled="isLoading"
              class="text-sm font-medium"
            />
            <ULink
              to=""
              class="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-all duration-200 hover:translate-x-0.5"
            >
              {{ t('login.form.forgot_password') }}
            </ULink>
          </div>

          <UButton
            type="submit"
            color="primary"
            size="lg"
            block
            :loading="isLoading"
            class="mt-8 rounded-xl font-semibold tracking-wide transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-500/40 active:translate-y-0"
          >
            {{ t('login.form.submit') }}
          </UButton>
        </UForm>
      </UCard>
    </div>

    <!-- Language & Theme Switcher -->
    <div class="flex items-center justify-center gap-4 pt-2">
      <ULocaleSelect
        :model-value="locale"
        :locales="[locales.ar, locales.en]"
        class="w-48"
        @update:model-value="handleLocaleChange($event as 'ar' | 'en')"
      />
      <UColorModeButton />
    </div>
  </div>
</template>
