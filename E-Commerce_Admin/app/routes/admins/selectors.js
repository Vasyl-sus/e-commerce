export const selectUser = store => {
    return store.getIn(["main_data", "user"]).toJS()
}

export const selectMenuState = store => {
    return store.getIn(["notifications_data", "menuState"])
}