export const selectLocalCountries = store => {
    return store.getIn(["main_data", "localCountries"]).toJS()
}

export const selectOrderStatuses = store => {
    return store.getIn(["main_data", "orderstatuses"]).toJS()
}

export const selectSelectedOrders = store => {
    return store.getIn(["orders_dashboard_data", "selected_orders"]).toJS()
}

export const selectCollors = store => {
    return store.getIn(["colors_data", "colors"]).toJS()
}

export const selectOrders = store => {
    return store.getIn(["orders_dashboard_data", "orders"]).toJS()
}

export const selectOrdersCount = store => {
    return store.getIn(["orders_dashboard_data", "ordersCount"])
}