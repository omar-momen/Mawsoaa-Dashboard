export default defineNuxtRouteMiddleware((to, _from) => {
  // Only apply to dashboard routes (works with locale prefixes like /ar/dashboard)
  if (!to.path.includes('/dashboard')) {
    return
  }

  const router = useRouter()

  const authStore = useAuthStore()
  const localePath = useLocalePath()

  // If accessing auth routes (login, register, forgot-password, etc.)
  if (to.path.includes('/dashboard/auth/')) {
    // If already authenticated, redirect to dashboard
    if (authStore.isAuthenticated) {
      return router.replace(localePath('/dashboard'))
    }
    // If not authenticated, allow access to auth routes
    return
  }

  // Check authentication for all other dashboard routes
  if (!authStore.isAuthenticated) {
    return router.replace(localePath('/dashboard/auth/login'))
  }
})
