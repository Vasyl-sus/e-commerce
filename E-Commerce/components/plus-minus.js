import React from 'react';

function PlusMinus(props) {

  const { toggleSign, toggled } = props;

  const handleToggleClick = () => {
    toggleSign(!toggled)
  }

  return (
    <React.Fragment>
      {!toggled && <span onClick={handleToggleClick} className="pointer plus-sign align-self-center"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45.12 45.12"><defs><style>{`.cls-1{fill:none;stroke:#142135;stroke-miterlimit:10;}`}</style></defs><title>Asset 7</title><g id="Layer_24" data-name="Layer 2"><g id="o_produktu" data-name="o produktu"><circle className="cls-1" cx="22.56" cy="22.56" r="22.06" transform="translate(-4.58 39.33) rotate(-76.72)"/><line className="cls-1" x1="22.56" y1="10.6" x2="22.56" y2="34.53"/><line className="cls-1" x1="10.6" y1="22.56" x2="34.53" y2="22.56"/></g></g></svg></span>}
      {toggled && <span onClick={handleToggleClick} className="pointer minus-sign align-self-center"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45.12 45.12"><defs><style>{`.cls-1{fill:none;stroke:#142135;stroke-miterlimit:10;}`}</style></defs><title>Asset 7</title><g id="Layer_25" data-name="Layer 2"><g id="o_produktu" data-name="o produktu"><circle className="cls-1" cx="22.56" cy="22.56" r="22.06" transform="translate(-4.58 39.33) rotate(-76.72)"/><line className="cls-1" x1="10.6" y1="22.56" x2="34.53" y2="22.56"/></g></g></svg></span>}
    </React.Fragment>
  );
  
}

export default PlusMinus;
