import * as React from 'react';

const ProductRadio = (
  {
    selectedOption,
    options,
    language,
    onChange = (v) => {},
  }) => {



  return (
    options?.length > 0 ?
      <div className='mb-3'>
        <div className='mb-3 pick-version-txt'>
          {language?.data.pickversion.value}
        </div>
        {
          options?.map((option, index) => (
            <button
              key={`option-${index}`}
              className={selectedOption === option ? 'btn btn-variation btn-variation-1' : 'btn btn-variation btn-variation-2'}
              onClick={() => onChange(option)}
            >{option}</button>
          ))
        }
      </div> : null
  )
}

export default ProductRadio;
