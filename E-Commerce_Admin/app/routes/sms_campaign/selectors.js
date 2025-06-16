import { getFormValues, isValid, isSubmitting } from 'redux-form/immutable';

export const selectCustomers = store => {
  return store.getIn(['sms_campaign_data', 'customers']).toJS()
}

export const selectCustomersCount = store => {
  return store.getIn(['sms_campaign_data', 'customersCount'])
}

export const selectLocalLanguagesForSelect = store => {
  let countries = store.getIn(['main_data', 'localCountries']).toJS();
  return countries.map(c => { return {label: c, value: c} })
}

export const selectScenarios = store => {
  let scenarios = store.getIn(['sms_campaign_data', 'scenarios']).toJS()
  return scenarios.map(s => { return {value: s.scenarioKey, label: s.name} })
}

export const selectReports = store => {
  return store.getIn(['sms_campaign_data', 'reports']).toJS();
}

export const selectFormValues = store => {
  return getFormValues("NewCampaignForm")(store)
}

export const selectFormEnabled = store => {
  let flag = isValid('NewCampaignForm')(store)
  return flag
}

export const selectMessages = store => {
  return store.getIn(['sms_campaign_data', 'messages']).toJS()
}

export const selectMessagesCount = store => {
  return store.getIn(['sms_campaign_data', 'messagesCount'])
}
