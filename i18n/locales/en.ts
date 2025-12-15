import common from './en/common.json'
import nav from './en/nav.json'
import home from './en/home.json'
import footer from './en/footer.json'
import pages from './en/pages.json'

export default defineI18nLocale(() => {
  return {
    ...common,
    nav,
    home,
    footer,
    pages
  }
})
