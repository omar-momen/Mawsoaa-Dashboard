import common from './ar/common.json'
import nav from './ar/nav.json'
import home from './ar/home.json'
import footer from './ar/footer.json'
import pages from './ar/pages.json'

export default defineI18nLocale(() => {
  return {
    ...common,
    nav,
    home,
    footer,
    pages
  }
})
