<script setup lang="ts">
import { formatTimeAgo } from '@vueuse/core'
import type { Notification } from '~/types'

const { isNotificationsSlideoverOpen } = useDashboard()

const notifications = ref<Notification[]>([
  {
    id: '1',
    unread: true,
    sender: {
      name: 'John Doe',
      avatar: {
        src: 'https://github.com/benjamincanac.png',
        alt: 'John Doe'
      }
    },
    date: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    body: 'You have a new message waiting for you in your inbox.'
  },
  {
    id: '2',
    unread: true,
    sender: {
      name: 'Jane Smith',
      avatar: {
        src: 'https://github.com/benjamincanac.png',
        alt: 'Jane Smith'
      }
    },
    date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    body: 'Your request has been approved. Please review the details.'
  },
  {
    id: '3',
    unread: false,
    sender: {
      name: 'Mike Johnson',
      avatar: {
        src: 'https://github.com/benjamincanac.png',
        alt: 'Mike Johnson'
      }
    },
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    body: 'Reminder: Your subscription will expire soon. Renew now to continue.'
  },
  {
    id: '4',
    unread: false,
    sender: {
      name: 'Sarah Williams',
      avatar: {
        src: 'https://github.com/benjamincanac.png',
        alt: 'Sarah Williams'
      }
    },
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    body: 'Welcome to our platform! We\'re excited to have you on board.'
  },
  {
    id: '5',
    unread: true,
    sender: {
      name: 'David Brown',
      avatar: {
        src: 'https://github.com/benjamincanac.png',
        alt: 'David Brown'
      }
    },
    date: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    body: 'Action required: Please verify your email address to continue.'
  }
])

const localePath = useLocalePath()
</script>

<template>
  <USlideover
    v-model:open="isNotificationsSlideoverOpen"
    :title="$t('sidebar.links.settings.notifications')"
  >
    <template #body>
      <NuxtLink
        v-for="notification in notifications"
        :key="notification.id"
        :to="localePath(`/dashboard/inbox?id=${notification.id}`)"
        class="px-3 py-2.5 rounded-md hover:bg-elevated/50 flex items-center gap-3 relative -mx-3 first:-mt-3 last:-mb-3"
      >
        <UChip
          color="error"
          :show="!!notification.unread"
          inset
        >
          <UAvatar
            v-bind="notification.sender.avatar"
            :alt="notification.sender.name"
            size="md"
          />
        </UChip>

        <div class="text-sm flex-1">
          <p class="flex items-center justify-between">
            <span class="text-highlighted font-medium">{{ notification.sender.name }}</span>

            <time
              :datetime="notification.date"
              class="text-muted text-xs"
              v-text="formatTimeAgo(new Date(notification.date))"
            />
          </p>

          <p class="text-dimmed">
            {{ notification.body }}
          </p>
        </div>
      </NuxtLink>
    </template>
  </USlideover>
</template>
