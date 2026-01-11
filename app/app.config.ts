import { inputUiConfig } from './configs/ui/Input'

export default defineAppConfig({
  ui: {
    colors: {
      primary: 'primary',
      secondary: 'secondary',
      tertiary: 'tertiary',
      success: 'green',
      info: 'blue',
      warning: 'yellow',
      error: 'red',
      neutral: 'slate'
    },
    input: inputUiConfig

  },

  app: {
    seo: {
      ogImage: 'https://ui.nuxt.com/assets/templates/nuxt/starter-light.png',
      twitterCard: 'summary_large_image' as const
    },
    social: {
      facebook: 'https://www.facebook.com/omarmomen2369'
    },
    author: 'Omar Momen'
  }
})
