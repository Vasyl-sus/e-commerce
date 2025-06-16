import React, { useState } from "react";
import Modal from "react-modal";

const MediumsAbout = (props) => {

  const [toggled, setToggled] = useState(false)
  const [isOpenImage, setisOpenImage] = useState(false);
  const [selectedLogo, setselectedLogo] = useState({profile_image: {}, images: []})
  const [photoIndex, setphotoIndex] = useState(5);

  const toggleText = () => {
    setToggled(!toggled)
    setphotoIndex(100)
  }

  const openImage = (row) => () => {
    setisOpenImage(!isOpenImage)
    setselectedLogo(row)
  }

  const closeModal = () => {
    setisOpenImage(false)
  }

  const renderSingleLogo1 = (row, index) => {
    if (index <= photoIndex)
      return (
        <div key={index} onClick={openImage(row)} className="col-3 col-md-2 pointer">
          <img src={row.profile_image && row.profile_image.link} alt="img" className="w-100 media-image" />
          <div className="roverlay"><p>POGLEJ</p></div>
        </div>
      )
  }

  const { language, mediums } = props;
  return (
    <div className="container medium-info-w">
      <div className="row">
        <div className="col-12 pl-md-0 pr-md-0 medium-info">
        <p className="naslov">{language?.data.ppomtt.value}</p>
        <p className="title">{language?.data.ppomttb.value}</p>
        {/* {!toggled && */}
        <div className={`medium-indent`}>
          <div className="row justify-content-center">
            {mediums?.map(renderSingleLogo1)}
          </div>
        </div>
        {mediums?.length > 6 && <div className="text-center mt-3">
          {!toggled && <span onClick={toggleText} className="pointer plus-sign medium-sign"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45.12 45.12"><defs><style>{`.cls-1{fill:none;stroke:#142135;stroke-miterlimit:10;}`}</style></defs><title>Asset 7</title><g id="Layer_24" data-name="Layer 2"><g id="o_produktu" data-name="o produktu"><circle className="cls-1" cx="22.56" cy="22.56" r="22.06" transform="translate(-4.58 39.33) rotate(-76.72)"/><line className="cls-1" x1="22.56" y1="10.6" x2="22.56" y2="34.53"/><line className="cls-1" x1="10.6" y1="22.56" x2="34.53" y2="22.56"/></g></g></svg> {language?.data.ppomtnal.value}</span>}
          {toggled && <span onClick={toggleText} className="pointer minus-sign medium-sign"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45.12 45.12"><defs><style>{`.cls-1{fill:none;stroke:#142135;stroke-miterlimit:10;}`}</style></defs><title>Asset 7</title><g id="Layer_25" data-name="Layer 2"><g id="o_produktu" data-name="o produktu"><circle className="cls-1" cx="22.56" cy="22.56" r="22.06" transform="translate(-4.58 39.33) rotate(-76.72)"/><line className="cls-1" x1="10.6" y1="22.56" x2="34.53" y2="22.56"/></g></g></svg> {language?.data.ppomtclo.value}</span>}
        </div> }
        </div>
        <div className="border-product"></div>
      </div>
      {isOpenImage && (
       <Modal isOpen={isOpenImage} onRequestClose={closeModal} className="react-modal-style-big" overlayClassName="react-modal-overlay" ariaHideApp={false} >
            <img onClick={closeModal} className="x-img pointer" width="25" height="25" alt="image" src="/static/images/times.svg" />
            <div className="container overflow-auto" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
              <img alt="img" src={selectedLogo.images.length > 0 && selectedLogo.images[0].link} className="w-100" />
            </div>
        </Modal>
      )}
    </div>
  );
}

export default MediumsAbout;
