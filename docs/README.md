# Documentation Index
-

This directory contains all project-specific documentation, guides, and conventions.

## 📚 Available Guides

### Composables

- **[API Composables Guide](./API_COMPOSABLES_GUIDE.md)** - Guide for `useApi` and `useClientApi` composables
  - When to use each composable
  - SSR vs client-only considerations
  - Usage patterns and examples
  - Best practices

### State Management

- **[Auth Store Guide](./AUTH_STORE_GUIDE.md)** - Authentication using Pinia store
  - Using `useAuthStore` for authentication
  - Login, logout, and state management
  - Composition API patterns
  - Reactivity and best practices
  - Integration examples

### Styling & Theming

- **[CSS, Tailwind & Nuxt UI Guide](./CSS_TAILWIND_NUXT_UI_GUIDE.md)** - Theming and styling guide
  - Tailwind CSS configuration
  - Nuxt UI semantic colors
  - Custom color definitions
  - CSS variables and overrides
  - Dark mode support

### Development Patterns

- **[Development Patterns & Conventions](./DEVELOPMENT_PATTERNS.md)** - Critical development patterns
  - Error handling (global error handling, don't handle in individual calls)
  - Component organization (directory structure, not kebab-case)
  - Styling patterns (Tailwind classes, assets folder structure)
  - Quick reference checklists

## 🔍 Quick Reference

### When to Check Which Guide

- **Making API calls?** → [API Composables Guide](./API_COMPOSABLES_GUIDE.md)
- **Working with authentication?** → [Auth Store Guide](./AUTH_STORE_GUIDE.md)
- **Styling or theming?** → [CSS, Tailwind & Nuxt UI Guide](./CSS_TAILWIND_NUXT_UI_GUIDE.md)
- **Creating components?** → [Development Patterns](./DEVELOPMENT_PATTERNS.md) - Component organization
- **Handling errors?** → [Development Patterns](./DEVELOPMENT_PATTERNS.md) - Error handling
- **Adding custom CSS?** → [Development Patterns](./DEVELOPMENT_PATTERNS.md) - Styling patterns
- **Creating new composables?** → Check existing composable patterns in guides
- **Creating new stores?** → Follow [Auth Store Guide](./AUTH_STORE_GUIDE.md) Composition API pattern

## 📝 Documentation Standards

All documentation files should:

- Use clear, descriptive titles and sections
- Include practical examples
- Show both correct ✅ and incorrect ❌ patterns when relevant
- Be kept in sync with code changes
- Follow the same structure and formatting as existing guides

## 🔄 Keeping Docs Updated

When making code changes:

1. **Check existing docs first** - See if patterns are already documented
2. **Update relevant guides** - Modify existing docs or create new ones
3. **Update this README** - Add new guides to the index
4. **Keep examples current** - Ensure code examples match current implementation

