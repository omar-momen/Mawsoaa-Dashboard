# Auth Store Guide

## Table of Contents

- [Overview](#overview)
- [Why Pinia Store?](#why-pinia-store)
- [Usage](#usage)
- [Store Structure](#store-structure)
- [Store API](#store-api)
- [Important Notes](#important-notes)
- [Integration with API Plugin](#integration-with-api-plugin)
- [Examples](#examples)
- [Composition API Pattern](#composition-api-pattern)
- [Best Practices](#best-practices)
- [DevTools](#devtools)

## Overview

The authentication state is managed using a Pinia store (`useAuthStore`) located at `app/stores/auth.ts`. This provides centralized authentication state management with full Vue DevTools support.

**This store uses the Composition API (setup stores)** - following Vue 3 Composition API patterns with `ref()`, `computed()`, and functions, providing a more flexible and type-safe approach compared to Options API.

## Why Pinia Store?

- ✅ **Vue DevTools Support** - Full debugging capabilities with time-travel debugging
- ✅ **Centralized State** - Single source of truth for authentication
- ✅ **Reactive by Default** - All state properties are automatically reactive
- ✅ **Type Safety** - Full TypeScript support with proper typing
- ✅ **SSR Compatible** - Works seamlessly with Nuxt's SSR
- ✅ **Composition API** - Uses modern Vue 3 Composition API patterns

## Usage

### Basic Usage

```typescript
import { useAuthStore } from '~/stores/auth'

// Get the store instance
const authStore = useAuthStore()

// Access state (already reactive, no .value needed)
console.log(authStore.user) // User object or null
console.log(authStore.token) // Token string or null
console.log(authStore.isAuthenticated) // Boolean getter
```

### In Components

```vue
<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

// State is reactive - template will update automatically
// No need to use .value or computed() for state properties
</script>

<template>
  <div v-if="authStore.isAuthenticated">
    <p>Welcome, {{ authStore.user?.name }}</p>
  </div>
  <div v-else>
    <p>Please log in</p>
  </div>
</template>
```

### Login

```typescript
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

try {
  await authStore.login({
    email: 'user@example.com',
    password: 'password123'
  })
  // User is now logged in
  // authStore.user and authStore.token are automatically updated
} catch (error) {
  // Handle login error
}
```

### Logout

```typescript
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

authStore.logout()
// User and token are cleared
// authStore.isAuthenticated will be false
```

### Checking Authentication Status

```typescript
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

if (authStore.isAuthenticated) {
  // User is logged in
  console.log('User:', authStore.user)
} else {
  // User is not logged in
  navigateTo('/login')
}
```

## Store Structure

The store is implemented using Pinia's **setup stores** (Composition API):

```typescript
export const useAuthStore = defineStore('auth', () => {
  // State - using ref()
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)

  // Getters - using computed()
  const isAuthenticated = computed(() => !!token.value)

  // Actions - regular functions
  async function login(payload: LoginPayload) { ... }
  function logout() { ... }

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout
  }
})
```

### State

- **`user`**: `Ref<User | null>` - The authenticated user object (reactive ref)
- **`token`**: `Ref<string | null>` - The authentication token (reactive ref)

**Note**: When accessing from the store instance, Pinia automatically unwraps refs, so you use `authStore.user` (not `authStore.user.value`).

### Getters

- **`isAuthenticated`**: `ComputedRef<boolean>` - Returns `true` if user has a valid token

**Note**: Pinia automatically unwraps computed refs, so you use `authStore.isAuthenticated` (not `authStore.isAuthenticated.value`).

### Actions

- **`login(payload: LoginPayload)`**: `Promise<void>` - Authenticates user with email and password
  - Updates `user` and `token` on success
  - Throws error on failure

- **`logout()`**: `void` - Clears user and token
  - Sets `user` and `token` to `null`

## Important Notes

### Reactivity

The store uses Composition API with `ref()` and `computed()`, but **Pinia automatically unwraps refs** when accessed from the store instance. You don't need to use `.value`:

```typescript
// ✅ CORRECT - Pinia unwraps refs automatically
const authStore = useAuthStore()
console.log(authStore.user) // Automatically unwrapped, already reactive
console.log(authStore.token) // Automatically unwrapped, already reactive
console.log(authStore.isAuthenticated) // Computed ref, automatically unwrapped

// ❌ WRONG - Don't use .value when accessing from store instance
console.log(authStore.user.value) // This will cause errors - user is already unwrapped
```

**Note**: Inside the store definition, you must use `.value` because you're working with raw refs:

```typescript
// Inside the store definition (app/stores/auth.ts)
const user = ref<User | null>(null)
user.value = newUser // ✅ Use .value here

// Outside the store (in components/composables)
const authStore = useAuthStore()
authStore.user = newUser // ✅ No .value needed - Pinia unwraps it
```

### In Templates

Store properties work directly in templates without additional wrapping:

```vue
<template>
  <!-- ✅ CORRECT -->
  <div v-if="authStore.isAuthenticated">
    {{ authStore.user?.name }}
  </div>

  <!-- ❌ WRONG - Don't use computed() for simple state access -->
  <div v-if="computed(() => authStore.isAuthenticated)">
    {{ computed(() => authStore.user?.name) }}
  </div>
</template>
```

### Destructuring

If you need to destructure store properties, use `storeToRefs`:

```typescript
import { useAuthStore } from '~/stores/auth'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { user, token } = storeToRefs(authStore)

// Now user and token are reactive refs
console.log(user.value) // Use .value when destructured
```

However, **direct access is recommended** for better DevTools support:

```typescript
// ✅ RECOMMENDED - Better DevTools support
const authStore = useAuthStore()
authStore.user
authStore.token

// ⚠️ Works but less ideal for DevTools
const { user, token } = storeToRefs(authStore)
```

## Integration with API Plugin

The auth store is automatically integrated with the API plugin (`app/plugins/api.ts`):

- **Automatic Token Injection**: The token is automatically added to API request headers
- **Auto Logout on 401**: Unauthenticated responses (401) automatically trigger logout
- **No Manual Setup Required**: Works out of the box

## Examples

### Protected Route Example

```vue
<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

// Redirect if not authenticated
if (!authStore.isAuthenticated) {
  navigateTo('/login')
}
</script>
```

### Login Form Example

```vue
<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useErrors } from '~/composables/useErrors'

const authStore = useAuthStore()
const { setError } = useErrors()

const email = ref('')
const password = ref('')
const loading = ref(false)

async function handleLogin() {
  loading.value = true
  try {
    await authStore.login({
      email: email.value,
      password: password.value
    })
    // Success - redirect or show success message
    navigateTo('/dashboard')
  } catch (error) {
    setError(error, 'toast')
  } finally {
    loading.value = false
  }
}
</script>
```

### User Menu Example

```vue
<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

function handleLogout() {
  authStore.logout()
  navigateTo('/login')
}
</script>

<template>
  <div v-if="authStore.isAuthenticated">
    <p>Logged in as: {{ authStore.user?.name }}</p>
    <button @click="handleLogout">Logout</button>
  </div>
</template>
```

## Migration from useAuth Composable

If you were previously using the `useAuth()` composable:

```typescript
// ❌ Old (composable - removed)
const { user, token, isAuthenticated, login, logout } = useAuth()

// ✅ New (direct store usage)
const authStore = useAuthStore()
authStore.user
authStore.token
authStore.isAuthenticated
authStore.login()
authStore.logout()
```

## Best Practices

1. **Use the store directly** - Don't create wrapper composables
2. **Access state directly** - No need for `.value` on store properties (Pinia unwraps refs automatically)
3. **Use Composition API patterns** - The store uses `ref()`, `computed()`, and functions (not Options API)
4. **Handle errors properly** - Login action can throw errors
5. **Check authentication before protected routes** - Use `isAuthenticated` getter
6. **Follow Composition API conventions** - When creating new stores, use setup stores pattern like this one

## Composition API Pattern

This store follows the **Composition API (setup stores)** pattern, which is the recommended approach for Pinia stores:

### Benefits of Composition API Stores

- ✅ **TypeScript Support** - Better type inference and autocomplete
- ✅ **Flexibility** - Can use any Composition API features (composables, watchers, etc.)
- ✅ **Consistency** - Matches Vue 3 Composition API patterns used in components
- ✅ **Reusability** - Can easily extract and reuse logic
- ✅ **Testing** - Easier to test individual functions

### Store Implementation Pattern

```typescript
export const useAuthStore = defineStore('auth', () => {
  // 1. Define state using ref()
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)

  // 2. Define getters using computed()
  const isAuthenticated = computed(() => !!token.value)

  // 3. Define actions as regular functions
  async function login(payload: LoginPayload) {
    // Access state with .value inside the store
    const { data } = await loginService(payload.email, payload.password)
    user.value = data?.value?.data.user || null
    token.value = data?.value?.data.token || null
  }

  function logout() {
    user.value = null
    token.value = null
  }

  // 4. Return everything that should be accessible
  return {
    user,
    token,
    isAuthenticated,
    login,
    logout
  }
})
```

### Key Differences from Options API

| Aspect | Options API | Composition API (This Store) |
|--------|-------------|------------------------------|
| State | `state: () => ({ ... })` | `const user = ref(...)` |
| Getters | `getters: { ... }` | `const isAuthenticated = computed(...)` |
| Actions | `actions: { ... }` | `function login() { ... }` |
| Access State | `this.user` | `user.value` (inside store) |
| Access from Store | `store.user` | `store.user` (Pinia unwraps) |

**Always use Composition API for new stores** - it's the modern, recommended approach.

## DevTools

The auth store is fully integrated with Vue DevTools:

- View current state (user, token)
- Track state changes over time
- Time-travel debugging
- Action history
- State inspection

Open Vue DevTools in your browser to see the `auth` store and all its state changes.

