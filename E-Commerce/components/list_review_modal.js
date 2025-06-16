import React from 'react'
import Modal from 'react-modal'
import Rating from 'react-rating'
import format from 'date-fns/format'

function ListReviewModal(props) {
  const { language, reviews, listReviewOpen } = props

  const closeModal = () => {
    props.closeModal()
  }

  const renderSingleRow = (row, index) => {
    return (
      <tr key={index}>
        <td>
          <p className='review-name'>{row.name}</p>
        </td>
        <td>
          <Rating
            initialRating={row.grade}
            placeholderRating='5'
            readonly={true}
            emptySymbol={
              <img src='/static/images/star-empty.svg' className='icon' alt='empty stars' />
            }
            fullSymbol={
              <img src='/static/images/star-full.svg' className='icon' alt='all stars' />
            }
            placeholderSymbol={
              <img src='/static/images/star-empty.svg' className='icon' alt='empty stars' />
            }
          />
        </td>
        <td>
          <p className='review-content'>
            {format(new Date(row.date_added), 'dd-MM-yyyy')}
          </p>
        </td>
        <td>
          <p className='review-content'>{row.review}</p>
        </td>
      </tr>
    )
  }

  return (
    <Modal isOpen={listReviewOpen} onRequestClose={closeModal} className="react-modal-style" overlayClassName="react-modal-overlay" ariaHideApp={false} >
      <img onClick={closeModal} className="x-img pointer" width="25" height="25" alt="image" src="/static/images/times.svg" />
      <div className='modal-header-gray text-center mb-5'>
        <h1 className='text-center'>{language.main.data.rmh.value}</h1>
      </div>
      <div className='cart-modal review-modal modal-container pt-4'>
        <table>
          <tbody>{reviews.map(renderSingleRow)}</tbody>
        </table>
      </div>
      <div className='modal-footer-pink text-center'>
        <button
          onClick={closeModal}
          className='btn btn-primary new-btn-to-order'>
          {language.main.data.rmc.value}
        </button>
      </div>
    </Modal>
  )
}

export default ListReviewModal
