import React, {Component} from 'react';
import Modal from "react-modal"; // Updated import
import Link from 'next/link';

import { homePageRoute, ROOT_URL } from '../constants/constants';

class LangModal extends Component {
  constructor(props) {
    super(props)

    this.state = {
      selectedCountry: null
    }
  }

  componentDidMount() {

  };

  setLang = (row) => () => {
    this.setState({selectedCountry: row})
  }

  renderSingleCountry = (row, index) => {
    var homeLink = this.props.routes && this.props.routes.find(r => {return r.page == homePageRoute}) || {route: ''}
    return (
      <React.Fragment key={index}>
        <div onClick={this.setLang(row)} className="row align-items-center pb-2 pt-2">
          <div className="col-4">
            <img data-pointer="lang-t" className="lang-flag" src={`/static/images/flags/${row.name.toLowerCase()}.svg`} alt="Choose country" />
          </div>
          <div className="col-8">
            <span className="lang-name-t">{row.full_name}</span>
          </div>
        </div>
        { this.state.selectedCountry && this.state.selectedCountry.id === row.id && this.state.selectedCountry.langs.map((r, i) => {
          return (
            <Link key={i} href={`${ROOT_URL}/${this.state.selectedCountry.name.toLowerCase()}-${r.name.toLowerCase()}/${homeLink.route}`}>
              <div className="row pt-2 pb-2">
                <div className="col-6"></div>
                <div className="col-6">
                  <span className="lang-name-t">{r.full_name}</span>
                </div>
              </div>
            </Link>
          )
        })}
      </React.Fragment>
    )
  }

  render() {
    const { countries } = this.props;
    return (
      <Modal
        isOpen={this.props.isOpen}
        onRequestClose={this.props.closeModal}
        className="react-modal-style"
        overlayClassName="react-modal-overlay"
        ariaHideApp={false}
      >
        {countries.map(this.renderSingleCountry)}
      </Modal>
    );
  }
}

LangModal.propTypes = {
};

export default LangModal;