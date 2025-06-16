
export const selectAllLanguages = store => {
  return store.getIn(['language_data']).allLanguages
}