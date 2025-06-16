import * as React from 'react';

const ProductDropdown = (
  {
    isOpen,
    currency,
    fixed,
    selectedTherapy,
    th,
    openTDropdown,
    pickTherapy,
  }) => {
  return (
    <div>
      <div onClick={openTDropdown} className="th-price-w pointer">
        <p className="main-t d-flex align-items-center">{selectedTherapy.name}</p>
        <div className="border"></div>
        <div className="d-flex align-items-center main-p justify-content-around">
          <p className="precrtano">{(selectedTherapy.inflated_price)?.toFixed(fixed)} {currency?.symbol}</p>
          <p className="cena">{selectedTherapy.total_price?.toFixed(fixed)} {currency?.symbol}</p>
        </div>
      </div>
      <div className={`dropdown-t ${isOpen ? '' : 'd-none'}`}>
        {th && th.length> 0 && th.map((t, index) => {
          return (
            <div key={index} onClick={pickTherapy(t)} className="th-price-w pointer">
              <p className="main-t">{t.name}</p>
              <div className="border"></div>
              <div className="d-flex align-items-center main-p justify-content-around">
                <p className="precrtano">{t.inflated_price.toFixed(fixed)} {currency.symbol}</p>
                <p className="cena">{t.total_price.toFixed(fixed)} {currency.symbol}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ProductDropdown;
