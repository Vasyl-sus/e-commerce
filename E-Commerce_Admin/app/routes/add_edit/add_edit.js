import React, {Component} from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import { addImages, closeModal } from '../../actions/main_actions.js'
import ImagesModal from './imagesModal.js';

class Add_Edit extends Component {
    constructor(props) {
      super(props);

      this.state = {
        images: null
      };
    }

    componentDidMount()
    {
    };

    openImage(preview) {
      this.setState({images:preview})
      var data = new FormData();
      for (var i = 0; i < preview.length; i++) {
        data.append(`images[${i}]`, preview[i])
      }

      this.props.addImages(data)
    }

    closeModal() {
      this.props.closeModal()
    }

    render(){

      return (
        <div className="content-wrapper container-fluid">
          <div className="row">
            <div className="col-12">
              <h2 className="box-title">Sistemske nastavitve</h2>
            </div>
          </div>
          <div className="row settings-container">
            <div className="settings-box">
              <Link to='/admins' className="small-box">
                  <div className="inner">
                    <h3>Uporabniki</h3>
                    <p>Dodaj ali uredi uporabnike</p>
                  </div>
              </Link>
            </div>
            <div className="settings-box">
              <Link to='/userGroups' className="small-box">
                  <div className="inner">
                  <h3>Uporabniške skupine</h3>
                  <p>Dodaj ali uredi uporabniške skupine</p>
                  </div>
              </Link>
            </div>
            <div className="settings-box">
              <Link to='/deliveryMethods' className="small-box">
                  <div className="inner">
                  <h3>Načini dostave</h3>
                  <p>Dodaj ali uredi načini dostave</p>
                  </div>
              </Link>
            </div>
            <div className="settings-box">
              <Link to='/paymentMethods' className="small-box">
                  <div className="inner">
                  <h3>Plačilne metode</h3>
                  <p>Dodaj ali uredi plačilne metode</p>
                  </div>
              </Link>
            </div>
            <div className="settings-box">
              <Link to='/orderStatuses' className="small-box">
                  <div className="inner">
                  <h3>Statusi naročil</h3>
                  <p>Dodaj ali uredi statuse</p>
                  </div>
              </Link>
            </div>
            <div className="settings-box">
              <Link to='/colors' className="small-box">
                  <div className="inner">
                  <h3>Barve naročil</h3>
                  <p>Dodaj ali uredi barve naročil</p>
                  </div>
              </Link>
            </div>
            <div className="settings-box">
              <Link to='/badges' className="small-box">
                  <div className="inner">
                  <h3>Značke uporabnikov</h3>
                  <p>Dodaj ali uredi značke</p>
                  </div>
              </Link>
            </div>
            <div className="settings-box">
              <Link to='/utms' className="small-box">
                  <div className="inner">
                  <h3>UTM mediumi</h3>
                  <p>Dodaj ali uredi UTM mediume</p>
                  </div>
              </Link>
            </div>
            <div className="settings-box">
              <Link to='/countries' className="small-box">
                  <div className="inner">
                  <h3>Države</h3>
                  <p>Dodaj ali uredi države</p>
                  </div>
              </Link>
            </div>
            <div className="settings-box">
              <Link to='/currencies' className="small-box">
                  <div className="inner">
                  <h3>Valute</h3>
                  <p>Dodaj ali uredi valute</p>
                  </div>
              </Link>
            </div>
            <div className="settings-box">
              <Link to='/expense_configurator' className="small-box">
                  <div className="inner">
                  <h3>Konfigurator stroškov</h3>
                  <p>Nastavi stroške</p>
                  </div>
              </Link>
            </div>
            <div className="settings-box">
              <Link to='/gift_configurator' className="small-box">
                  <div className="inner">
                  <h3>Konfigurator daril</h3>
                  <p>Nastavi</p>
                  </div>
              </Link>
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <h2 className="box-title box-title-dark">Izdelki</h2>
            </div>
          </div>
          <div className="row settings-container">
            <div className="settings-box">
              <Link to='/product' className="small-box">
                  <div className="inner">
                  <h3>Produkti</h3>
                  <p>Dodaj ali uredi produkte</p>
                  </div>
              </Link>
            </div>
            <div className="settings-box">
              <Link to='/therapies' className="small-box">
                  <div className="inner">
                  <h3>Terapije</h3>
                  <p>Dodaj ali uredi terapije</p>
                  </div>
              </Link>
            </div>
            <div className="settings-box">
              <Link to='/categories' className="small-box">
                  <div className="inner">
                  <h3>Kategorije produktov</h3>
                  <p>Dodaj ali uredi kategorije produktov</p>
                  </div>
              </Link>
            </div>
            <div className="settings-box">
              <Link to='/gifts' className="small-box">
                  <div className="inner">
                  <h3>Darila</h3>
                  <p>Dodaj ali uredi darila</p>
                  </div>
              </Link>
            </div>
            <div className="settings-box">
              <Link to='/accessories' className="small-box">
                  <div className="inner">
                  <h3>Dodatki</h3>
                  <p>Dodaj ali uredi dodatke</p>
                  </div>
              </Link>
            </div>
            <div className="settings-box">
              <Link to='/stock' className="small-box">
                  <div className="inner">
                  <h3>Zaloga</h3>
                  <p>Dodaj ali uredi zalogo</p>
                  </div>
              </Link>
            </div>
          </div>
          <ImagesModal closeModal={this.closeModal.bind(this)} files={this.props.files} newModal={this.props.openFilesModal} />
        </div>
      )
    }
 }

const mapDispatchToProps = (dispatch) => {
  return {
    addImages: (data) => {
      dispatch(addImages(data))
    },
    closeModal: (data) => {
      dispatch(closeModal(data))
    },
  }
}

function mapStateToProps(state)
{
  var nextState = state.toJS();

  return {
    openFilesModal: nextState.main_data.openFilesModal,
    files: nextState.main_data.files
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Add_Edit);
