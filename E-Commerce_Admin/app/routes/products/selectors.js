
export const selectProducts = store => {
  return store.getIn(['products_data', 'products']).toJS()
}

export const selectProductsCount = store => {
  return store.getIn(['products_data', 'productsCount'])
}