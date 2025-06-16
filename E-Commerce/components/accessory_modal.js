import React from 'react'
import Modal from 'react-modal'
import { useDispatch } from 'react-redux'

import { cartPage } from '../constants/constants'
import { closeAccessoryModal as closeAccessoryModalAction } from '../actions/cartActions'

const AccessoryModal = ({
  closeAccessoryModal,
  accessoryModal,
  accessories,
  discountName,
  submitItem,
  routes,
  language,
}) => {
  const [state, setState] = React.useState({
    selectedOption: {
      name: language.main.data.chooseAccessory.value
    },
    error: '',
  })

  const setAccessoryOption = data => () => {
    if (state.selectedOption.id != data.id) {
      setState({ selectedOption: data,  error: '' })
    } else setState({ selectedOption: { name: language.main.data.chooseAccessory.value },  error: '' })
  }

  const dispatch = useDispatch()

  React.useEffect(() => {
    let cartLink = routes?.find(r => {
      return r.page == cartPage
    }) || { route: '' }

    setState(prev => ({ ...prev, cartLink }))
  }, [])

  React.useEffect(() => {
    return () => dispatch(closeAccessoryModalAction())
  }, [])

  const closeModal = () => {
    closeAccessoryModal()
  }

  const renderSingleOption = (accessory, index) => {
    console.log("Render Single option " + JSON.stringify(accessory))
    return (
      <React.Fragment key={index}>
        <li
          className={`country-item d-flex align-items-center ${
            state.selectedOption.id == accessory.id ? 'active' : ''
          }`}
          onClick={setAccessoryOption(accessory)}>
          {accessory.translations[0].name}
        </li>
      </React.Fragment>
    )
  }

  const renderActiveOption = (accessory, index) => {
    return (
      <React.Fragment key={index}>
        {state.selectedOption.id == accessory.id && (
          <div
            className={`country-item d-flex align-items-center ${
              state.selectedOption.id == accessory.id ? 'active' : ''
            }`}>
            {accessory.name}
          </div>
        )}
      </React.Fragment>
    )
  }

  return (
    <Modal isOpen={accessoryModal} onRequestClose={closeModal} className="react-modal-style" overlayClassName="react-modal-overlay" ariaHideApp={false} >
      <img onClick={closeModal} className="x-img pointer" width="25" height="25" alt="image" src="/static/images/times.svg" />
      <div className='modal-header-gray text-center mb-5'>
        <h4>{language && language.main && language.main.data && language.main.data.chooseAccessoryTitle && language.main.data.chooseAccessoryTitle.value}</h4>
      </div>
      <div className='cart-modal modal-container accessory-modal-content pt-4'>
        <label className='country-dropdown'>
          <div className='btn btn-country-pick dd-button'>
            {
              state.selectedOption.id ? accessories && accessories.map(renderActiveOption)
              : <div
                className={`country-item d-flex align-items-center ${
                  'active'
                }`}>
              {language.main.data.chooseAccessory.value}
            </div>
            }
          </div>
          <input type='checkbox' className='dd-input' id='countryDrop' />
          <ul className='dd-menu'>
            {accessories && accessories.map(renderSingleOption)}
          </ul>
          <p className="accessory-modal-error">{state.error}</p>
        </label>
      </div>
      <div className="modal-footer-pink text-center">
        <button className='btn btn-primary new-btn-to-order'
          onClick={() => {
            if (!state.selectedOption.id) {
              setState({
                selectedOption:  {
                  name: language.main.data.chooseAccessory.value
                },
                error: language.main.data.accessoryModalError.value,
              })
              return;
            }
            submitItem(discountName, state.selectedOption.id);
            closeModal()
            }}>
          {language && language.main && language.main.data && language.main.data.accessoryModalSubmit && language.main.data.accessoryModalSubmit.value}
        </button>
      </div>
    </Modal>
  )
}

export default AccessoryModal
