export const selectCustomer = store => {
    return store.getIn(["customer_profile_data", "customer"])
}

export const selectBadges = store => {
    return store.getIn(["main_data", "badges"]).toJS()
}

export const selectDeliveryMethods = store => {
    return store.getIn(["main_data", "deliverymethods"]).toJS()
}

export const selectPaymentMethods = store => {
    return store.getIn(["main_data", "paymentmethods"]).toJS()
}

export const selectCustomers = store => {
    return store.getIn(["customer_profile_data", "customers"]).toJS()
}

export const selectCustomerFormValues = store => {
    return store.getIn(["form", "NewCustomerProfileForm", "values"])
}

export const selecteditCustomerFormValues = store => {
    return store.getIn(["form", "EditCustomerProfileForm", "values"])
}

export const selectCustomersCount = store => {
    return store.getIn(["customer_profile_data", "customersCount"])
}

export const selectCountries = store => {
    return store.getIn(["main_data", "countries"]).toJS()
}