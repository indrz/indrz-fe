export default {
  getPageParams: ({ page = 1, itemsPerPage = 10 }) => {
    return {
      page,
      limit: itemsPerPage,
      offset: (page - 1) * itemsPerPage
    }
  }
}
