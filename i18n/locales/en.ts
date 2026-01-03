import common from './en/common.json'
import nav from './en/nav.json'
import footer from './en/footer.json'
import pages from './en/pages.json'
import sidebar from './en/sidebar.json'
import login from './en/login.json'
import table from './en/table.json'
import labels from './en/labels.json'

export default defineI18nLocale(() => {
  return {
    ...common,
    nav,
    footer,
    pages,
    sidebar,
    login,
    table,
    labels
  }
})
