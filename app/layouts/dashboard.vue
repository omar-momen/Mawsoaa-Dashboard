<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const toast = useToast()

const open = ref(false)

const { t } = useI18n()

const localePath = useLocalePath()

const links = [
  [{
    label: t('sidebar.links.home'),
    icon: 'i-lucide-house',
    to: localePath('dashboard'),
    onSelect: () => {
      open.value = false
    }
  }, {
    label: t('sidebar.links.inbox'),
    icon: 'i-lucide-inbox',
    to: localePath('/dashboard/inbox'),
    badge: '4',
    onSelect: () => {
      open.value = false
    }
  }, {
    label: t('sidebar.links.tenants'),
    icon: 'i-lucide-users',
    to: localePath('/dashboard/tenants'),
    onSelect: () => {
      open.value = false
    }
  }, {
    label: t('sidebar.links.settings.title'),
    to: localePath('/dashboard/settings'),
    icon: 'i-lucide-settings',
    defaultOpen: true,
    type: 'trigger',
    children: [{
      label: t('sidebar.links.settings.general'),
      to: localePath('/dashboard/settings'),
      exact: true,
      onSelect: () => {
        open.value = false
      }
    }, {
      label: t('sidebar.links.settings.members'),
      to: localePath('/dashboard/settings/members'),
      onSelect: () => {
        open.value = false
      }
    }, {
      label: t('sidebar.links.settings.notifications'),
      to: localePath('/dashboard/settings/notifications'),
      onSelect: () => {
        open.value = false
      }
    }, {
      label: t('sidebar.links.settings.security'),
      to: localePath('/dashboard/settings/security'),
      onSelect: () => {
        open.value = false
      }
    }]
  }],
  [{
    label: t('sidebar.links.feedback'),
    icon: 'i-lucide-message-circle',
    to: 'https://github.com/nuxt-ui-templates/dashboard',
    target: '_blank'
  }, {
    label: t('sidebar.links.help_support'),
    icon: 'i-lucide-info',
    to: 'https://github.com/nuxt-ui-templates/dashboard',
    target: '_blank'
  }]
] satisfies NavigationMenuItem[][]

const groups = computed(() => [
  {
    id: 'links',
    label: t('search.go_to'),
    items: links.flat()
  }
])

const { isNotificationsSlideoverOpen } = useDashboard()

const items = [[{
  label: 'New mail',
  icon: 'i-lucide-send',
  to: localePath('/dashboard/inbox')
}, {
  label: 'New customer',
  icon: 'i-lucide-user-plus',
  to: localePath('/dashboard/tenants')
}]]

onMounted(async () => {
  const cookie = useCookie('cookie-consent')
  if (cookie.value === 'accepted') {
    return
  }

  toast.add({
    title: t('toast.we_use_first_party_cookies'),
    duration: 0,
    close: false,
    actions: [{
      label: t('toast.accept'),
      color: 'neutral',
      variant: 'outline',
      onClick: () => {
        cookie.value = 'accepted'
      }
    }, {
      label: t('toast.opt_out'),
      color: 'neutral',
      variant: 'ghost'
    }]
  })
})
</script>

<template>
  <UDashboardGroup>
    <UDashboardSidebar
      v-model:open="open"
      :default-size="20"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default', header: 'my-2' }"
    >
      <!-- Logo -->
      <template #header="{ collapsed }">
        <ClientOnly>
          <AppLogo
            v-if="!collapsed"
            class="max-w-full"
          />
        </ClientOnly>
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton
          :collapsed="collapsed"
          class="bg-transparent ring-default"
        />
        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
          tooltip
          class="mt-auto"
        />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardPanel id="home">
      <template #header>
        <UDashboardNavbar
          :title="$t('pages.home.title')"
          :ui="{ right: 'gap-3' }"
        >
          <template #leading>
            <UDashboardSidebarCollapse class="ps-0" />
          </template>

          <template #right>
            <UTooltip
              :text="t('notifications.title')"
              :shortcuts="['N']"
            >
              <UButton
                color="neutral"
                variant="ghost"
                square
                @click="isNotificationsSlideoverOpen = true"
              >
                <UChip
                  color="error"
                  inset
                >
                  <UIcon
                    name="i-lucide-bell"
                    class="size-5 shrink-0"
                  />
                </UChip>
              </UButton>
            </UTooltip>

            <UDropdownMenu :items="items">
              <UButton
                icon="i-lucide-plus"
                size="md"
                class="rounded-full"
              />
            </UDropdownMenu>
          </template>
        </UDashboardNavbar>

        <UDashboardToolbar>
          <template #left>
            <h2>
              Not translated title
            </h2>
          </template>
        </UDashboardToolbar>
      </template>

      <template #body>
        <AppPageLoading />

        <slot />
      </template>
    </UDashboardPanel>

    <UDashboardSearch :groups="groups" />
    <NotificationsSlideover />
  </UDashboardGroup>
</template>
