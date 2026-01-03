# Development Patterns & Conventions

This guide documents critical development patterns and conventions that must be followed when working on this project.

## Table of Contents

- [Error Handling](#error-handling)
- [Component Organization](#component-organization)
- [Styling & CSS](#styling--css)
- [Auto-Imports](#auto-imports)
- [Quick Reference](#quick-reference)

## Error Handling

### ❌ DO NOT: Handle Errors in Individual API Calls

**The project has global error handling** - errors are automatically handled by the API plugin (`app/plugins/api.ts`) and error handling plugin (`app/plugins/error-loading-handling.ts`).

**Incorrect Pattern:**
```typescript
// ❌ WRONG - Don't add try-catch in individual calls
async function fetchData() {
  try {
    const { data, error } = await useClientApi('/api/data')
    if (error.value) {
      // Don't handle errors here - they're handled globally
      console.error(error.value)
    }
    return data.value
  } catch (err) {
    // Don't catch errors here
    console.error(err)
  }
}
```

**Correct Pattern:**
```typescript
// ✅ CORRECT - Let global error handling work
async function fetchData() {
  const { data } = await useClientApi('/api/data')
  // Errors are automatically handled by:
  // - app/plugins/api.ts (onResponseError hook)
  // - app/plugins/error-loading-handling.ts
  // Errors will show toasts automatically
  return data.value
}
```

### How Global Error Handling Works

1. **API Plugin** (`app/plugins/api.ts`):
   - `onResponseError` hook automatically catches all API errors
   - Extracts error messages using `extractError()` utility
   - Shows error toasts via `useErrors().setError()`
   - Handles 401 authentication errors globally

2. **Error Handling Plugin** (`app/plugins/error-loading-handling.ts`):
   - Handles app lifecycle errors
   - Manages page and app loading states
   - Handles fatal errors

3. **Error Composable** (`app/composables/useErrors.ts`):
   - Centralized error state management
   - Provides `setError()` for programmatic error handling
   - Supports error page and toast destinations

### When to Use Manual Error Handling

Only use manual error handling for:
- **Business logic errors** (validation, conditional flows)
- **Non-API errors** (form validation, local state errors)
- **Silent errors** (using `silent: true` option in API calls)

```typescript
// ✅ OK - Business logic error handling
async function submitForm() {
  if (!isValid.value) {
    // This is business logic, not API error
    toast.add({ title: 'Validation Error', description: 'Please fix errors' })
    return
  }
  
  // API errors handled globally
  const { data } = await useClientApi('/api/submit', { method: 'POST', body: formData })
  return data.value
}
```

## Component Organization

### ❌ DO NOT: Use Kebab-Case Component Names

**Incorrect Pattern:**
```
app/components/
  auth-login-form.vue    ❌ WRONG
  user-profile-menu.vue   ❌ WRONG
  table-base.vue         ❌ WRONG
```

### ✅ DO: Use Directory Structure with Nested Folders

**Correct Pattern:**
```
app/components/
  auth/
    login/
      form.vue           ✅ CORRECT
      info.vue           ✅ CORRECT
  user/
    menu.vue             ✅ CORRECT
  table/
    base.vue             ✅ CORRECT
  app/
    header.vue            ✅ CORRECT
    footer.vue            ✅ CORRECT
```

### Component Naming Rules

1. **Use directories to organize components** - Group related components in folders
2. **File names can be lowercase or PascalCase** - Both `form.vue` and `Form.vue` are acceptable
3. **Nested directories represent component hierarchy** - `auth/login/form.vue` represents an auth login form component
4. **Auto-import works with directory structure** - Nuxt auto-imports based on path: `auth/login/form.vue` → `<AuthLoginForm />`

### Examples

```vue
<!-- ✅ CORRECT: Component at app/components/auth/login/form.vue -->
<script setup lang="ts">
// Component code
</script>

<template>
  <form>...</form>
</template>
```

```vue
<!-- ✅ CORRECT: Usage in parent component -->
<template>
  <AuthLoginForm />
  <!-- Auto-imported from app/components/auth/login/form.vue -->
</template>
```

## Styling & CSS

### ❌ DO NOT: Write CSS in Components or Pages

**Incorrect Patterns:**
```vue
<!-- ❌ WRONG: Inline styles -->
<template>
  <div style="color: red; padding: 20px;">Content</div>
</template>

<!-- ❌ WRONG: <style> blocks in components -->
<template>
  <div class="custom-component">Content</div>
</template>

<style scoped>
.custom-component {
  color: red;
  padding: 20px;
}
</style>
```

### ✅ DO: Use Tailwind Classes and Assets Folder Pattern

**Correct Patterns:**
```vue
<!-- ✅ CORRECT: Use Tailwind utility classes -->
<template>
  <div class="text-error p-5">Content</div>
</template>
```

### CSS Organization Structure

All custom CSS should be organized in `app/assets/css/`:

```
app/assets/css/
├── main.css                    # Main entry, Tailwind theme config
├── variables/
│   ├── colors.css              # Custom application colors
│   ├── layout.css              # Layout variables
│   └── shadows.css             # Shadow variables
├── base.css                    # Base styles using Tailwind
├── components.css              # Component-specific styles
├── utilities.css               # Custom utility classes
├── typography.css              # Typography styles
└── animations.css              # Animation styles
```

### When to Add Custom CSS

1. **Custom Tailwind theme values** → `app/assets/css/main.css` (using `@theme`)
2. **Application color variables** → `app/assets/css/variables/colors.css`
3. **Reusable utility classes** → `app/assets/css/utilities.css`
4. **Component-specific styles** → `app/assets/css/components.css`
5. **Animations** → `app/assets/css/animations.css`

### Examples

```css
/* ✅ CORRECT: Add to app/assets/css/variables/colors.css */
:root {
  --color-bg-main: #FFFFFF;
  --color-text-default: #1a1a1a;
}

/* ✅ CORRECT: Add to app/assets/css/utilities.css */
@layer utilities {
  .custom-gradient {
    @apply bg-gradient-to-br from-primary-500 to-secondary-500;
  }
}
```

```vue
<!-- ✅ CORRECT: Use Tailwind classes in components -->
<template>
  <div class="bg-bg-main text-text-default custom-gradient">
    Content
  </div>
</template>
```

### Tailwind Best Practices

1. **Use semantic color classes** - `text-error`, `bg-primary-500`, `border-success`
2. **Use utility classes** - Prefer `p-4`, `flex`, `gap-2` over custom CSS
3. **Use Nuxt UI components** - They come with proper styling
4. **Extend Tailwind theme** - Add custom values via `@theme` in `main.css`
5. **Follow existing patterns** - Check `CSS_TAILWIND_NUXT_UI_GUIDE.md` for theming

## Auto-Imports

### ❌ DO NOT: Import Vue Reactivity Functions

**Nuxt automatically imports Vue reactivity functions** - `ref`, `computed`, and `reactive` are available globally, just like composables and stores.

**Incorrect Pattern:**
```typescript
// ❌ WRONG - Don't import Vue reactivity functions
import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = computed(() => !!user.value)
  return { user, isAuthenticated }
})
```

**Correct Pattern:**
```typescript
// ✅ CORRECT - Use auto-imported functions
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null) // Auto-imported
  const isAuthenticated = computed(() => !!user.value) // Auto-imported
  return { user, isAuthenticated }
})
```

### What is Auto-Imported

Nuxt automatically imports the following, so **do not import them manually**:

- **Vue Reactivity**: `ref`, `computed`, `reactive`, `watch`, `watchEffect`, etc.
- **Vue Lifecycle**: `onMounted`, `onUnmounted`, `onBeforeMount`, etc.
- **Composables**: All files in `app/composables/` (e.g., `useAuthStore`, `useI18n`, `useRouter`)
- **Stores**: All files in `app/stores/` (e.g., `useAuthStore`)
- **Components**: All files in `app/components/` (e.g., `<AuthLoginForm />`)

### When to Import from Vue

**Only import types from Vue:**
```typescript
// ✅ CORRECT - Import types only
import type { Ref, ComputedRef } from 'vue'

// ❌ WRONG - Don't import functions
import { ref, computed } from 'vue'
```

### Examples

```typescript
// ✅ CORRECT: Store using auto-imported functions
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null) // Auto-imported
  const token = ref(null) // Auto-imported
  const isAuthenticated = computed(() => !!token.value) // Auto-imported
  
  return { user, token, isAuthenticated }
})
```

```typescript
// ✅ CORRECT: Component using auto-imported functions
<script setup lang="ts">
// No imports needed for ref, computed, reactive, etc.
const count = ref(0)
const doubled = computed(() => count.value * 2)

// Composables are also auto-imported
const authStore = useAuthStore()
const router = useRouter()
const { t } = useI18n()
</script>
```

## Quick Reference

### Error Handling Checklist

- ✅ Don't add try-catch blocks around API calls
- ✅ Don't manually handle API errors
- ✅ Let `app/plugins/api.ts` handle errors automatically
- ✅ Only handle business logic errors manually
- ✅ Use `silent: true` option for silent API errors

### Component Organization Checklist

- ✅ Use directory structure: `feature/component-name.vue`
- ✅ Group related components in folders
- ✅ Don't use kebab-case flat file names
- ✅ Let Nuxt auto-import handle component registration
- ✅ Use PascalCase in templates: `<AuthLoginForm />`

### Styling Checklist

- ✅ Use Tailwind utility classes in components
- ✅ Don't write `<style>` blocks in components
- ✅ Don't use inline `style` attributes
- ✅ Add custom CSS to `app/assets/css/` folder
- ✅ Follow the CSS folder structure pattern
- ✅ Use semantic color classes from theme
- ✅ Check `CSS_TAILWIND_NUXT_UI_GUIDE.md` for theming

### Auto-Imports Checklist

- ✅ Don't import `ref`, `computed`, `reactive` from Vue
- ✅ Don't import Vue lifecycle hooks (`onMounted`, etc.)
- ✅ Don't import composables from `app/composables/`
- ✅ Don't import stores from `app/stores/`
- ✅ Only import types from Vue: `import type { ... } from 'vue'`
- ✅ Use auto-imported functions directly in code

## Related Documentation

- [API Composables Guide](./API_COMPOSABLES_GUIDE.md) - API call patterns
- [CSS, Tailwind & Nuxt UI Guide](./CSS_TAILWIND_NUXT_UI_GUIDE.md) - Theming and styling
- [Auth Store Guide](./AUTH_STORE_GUIDE.md) - State management patterns

