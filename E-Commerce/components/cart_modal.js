import React from 'react'
import Modal from 'react-modal'
import Link from 'next/link'
import { useDispatch } from 'react-redux'

import { cartPage } from '../constants/constants'
import { closeCartModal as closeCartModalAction } from '../actions/cartActions'

const CartModal = ({
  closeCartModal,
  lang,
  cartModal,
  country,
  currency,
  language,
  addedTherapy = {},
  addedProduct,
  fixed,
  routes,
}) => {
  const [state, setState] = React.useState({
    last_cart_id: null,
    cartLink: '',
  })

  const dispatch = useDispatch()

  React.useEffect(() => {
    let cartLink = routes?.find(r => {
      return r.page == cartPage
    }) || { route: '' }

    setState(prev => ({ ...prev, cartLink }))
  }, [])

  React.useEffect(() => {
    return () => dispatch(closeCartModalAction())
  }, [dispatch])


  const closeModal = () => {
    dispatch(closeCartModalAction())
  }
  

  return (
    <Modal isOpen={cartModal} onRequestClose={closeModal} className="react-modal-style" overlayClassName="react-modal-overlay" ariaHideApp={false} >
      <img onClick={closeModal} className="x-img pointer" width="25" height="25" alt="image" src="/static/images/times.svg" />
      <div className='modal-header-gray text-center mb-5'>
        <h1 className='text-center'>{language.main.data.cmt.value}</h1>
      </div>
      <div className='cart-modal modal-container pt-4'>
        <table>
          <tbody>
            <tr>
              <td className='cart-modal-img'>
                <img
                  alt='image'
                  className='product-wraper-image'
                  src={
                    (addedTherapy.profile_image &&
                      addedTherapy.profile_image.link) ||
                    (addedTherapy.display_image &&
                      addedTherapy.display_image.link)
                  }
                />
              </td>
              <td className='cart-modal-name'>
                <p className='big'>{addedTherapy.name}</p>
                {addedProduct && addedProduct.name && (
                  <p className='small'>- {addedProduct.name}</p>
                )}
              </td>
              <td className='cart-modal-price'>
                {(addedTherapy.total_price &&
                  addedTherapy.total_price.toFixed(fixed)) ||
                  (addedTherapy.reduced_price &&
                    addedTherapy.reduced_price.toFixed(fixed))}{' '}
                {currency && currency.symbol}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {state.cartLink.page && (
        <div className='modal-footer-pink text-center'>
          <Link
            href={state.cartLink.page}
            as={`/${lang}-${country}/${state.cartLink.route}`}>
            <a>
              <button className='btn btn-primary new-btn-to-order'>
                {language.main.data.cmb.value}
              </button>
            </a>
          </Link>
        </div>
      )}
    </Modal>
  )
}

export default CartModal
