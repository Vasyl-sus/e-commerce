import React from 'react'
import { CardElement } from '@stripe/react-stripe-js'
import { StripeContext } from './StripeProvider'

const cardElementStyles = {
  base: {
    fontWeight: 'bold',
    iconColor: '#142135',
    fontFamily: 'Roboto, Arial',
    fontSize: '1rem',
    color: '#142135',
    fontSmoothing: 'antialiased',
    ':-webkit-autofill': { color: '#142135' },
    '::placeholder': { color: '#14213585' },
  },
  invalid: {
    iconColor: '#af1818e6',
    color: '#af1818e6',
  },
}

const StripeForm = ({ isActive }) => {
  const { error } = React.useContext(StripeContext)

  return (
    <div className='stripe-form'>
      <div className='stripe-form__container'>
        <CardElement
          className='stripe-form__card-element'
          options={{
            disabled: !isActive,
            style: cardElementStyles,
            hidePostalCode: true,
          }}
        />
      </div>

      {error && <div className='stripe-form__error-message'>{error}</div>}
    </div>
  )
}

export default StripeForm
