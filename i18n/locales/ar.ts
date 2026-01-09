import common from './ar/common.json'
import nav from './ar/nav.json'
import footer from './ar/footer.json'
import pages from './ar/pages.json'
import sidebar from './ar/sidebar.json'
import login from './ar/login.json'
import table from './ar/table.json'
import labels from './ar/labels.json'
import cruds from './ar/cruds.json'
import form from './ar/form.json'

export default defineI18nLocale(() => {
  return {
    ...common,
    nav,
    footer,
    pages,
    sidebar,
    login,
    table,
    labels,
    cruds,
    form
  }
})
