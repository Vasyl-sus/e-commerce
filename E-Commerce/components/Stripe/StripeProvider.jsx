import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js'
import Axios from 'axios'
import React from 'react'
import { useDispatch } from 'react-redux'
import { LOADING, ROOT_URL } from '../../constants/constants'

export const StripeContext = React.createContext()

const StripeProvider = ({ children, lang }) => {
  const dispatch = useDispatch()
  const stripe = useStripe()

  const elements = useElements()
  const [error, setError] = React.useState(null)

  const createCard = async () => {
    const res = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement('card'),
    })

    const { paymentMethod, error: stripeError } = res

    if (stripeError) {
      setError(stripeError.message)

      throw new Error(stripeError.message)
    }

    return { paymentMethod }
  }

  

  const getCard = () => {
    return elements.getElement('card');
  }

  const createIntent = async ({ dataToSend }) => {
    dispatch({ type: LOADING, payload: true })
    let res

    try {
      const { paymentMethod } = await createCard()

      res = await Axios.post(`${ROOT_URL}/stripe/intent`, {
        order: dataToSend,
        paymentMethodId: paymentMethod.id,
      })
      return res;
    } catch (error) {
      const { error: stripeError } = error.response.data
      const { code } = stripeError

      setError(lang[code] || lang['fallback'])
      throw new Error(error)
    } finally {
      dispatch({ type: LOADING, payload: false })
    }
  }

  const updateOrder = async ({ paymentId, data }) => {
    dispatch({ type: LOADING, payload: true })
    let res

    try {
      res = await Axios.post(`${ROOT_URL}/stripe/update`, {
        data,
        paymentId
      })
      return res;
    } catch (error) {
      const {
        error: { code },
      } = error.response.data

      setError(lang[code] || lang['fallback'])
      throw new Error(error)
    } finally {
      dispatch({ type: LOADING, payload: false })
    }
  }

  const postCardError = (code) => {
    setError(lang[code] || lang['fallback'])
  }

  const savePayment = async (dataToSend) => {
    try {
      const res = await Axios.post(`${ROOT_URL}/stripe/create-payment`, {
        order: dataToSend,
      })
      return res;
    } catch (error) {
      throw new Error(error)
    }
  }

  const setupIntent = async (customer) => {
    try {
      const res = await Axios.post(`${ROOT_URL}/stripe/setup-intent`, {
        customer,
      })
      return res;
    } catch (error) {
      throw new Error(error)
    }
  }

  const savePaymentMethod = async (customer, card) => {
    try {
      const res = await Axios.post(`${ROOT_URL}/stripe/save-payment-method`, {
        customer,
        card,
      })
      return res;
    } catch (error) {
      throw new Error(error)
    }
  }

  const attachPaymentMethod = async (customer, paymentMethod) => {
    try {
      const res = await Axios.post(`${ROOT_URL}/stripe/attach-payment-method`, {
        customer,
        paymentMethod,
      })
      return res;
    } catch (error) {
      throw new Error(error)
    }
  }

  return (
    <StripeContext.Provider value={{ stripe, elements, createIntent, error }}>
      {children({ stripe, createIntent, updateOrder, getCard, savePayment, postCardError, setupIntent, savePaymentMethod, createCard, attachPaymentMethod })}
    </StripeContext.Provider>
  )
}

export default StripeProvider
