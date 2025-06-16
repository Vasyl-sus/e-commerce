import React, {Component} from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import Dropzone from 'react-dropzone';
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
      // console.log(preview)
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


      const dropzoneStyle = {
        width  : "100%",
        height : "100%",
        cursor : "pointer"
      };

      return (
        <div className="content-wrapper container-fluid">
          <div className="row">
            <div className="col-md-12">
              <h2 className="box-title">Spletna stran</h2>
            </div>
          </div>
          <div className="row settings-container">
            <div className="settings-box">
              <Link to='/stickyNotes' className="small-box">
                  <div className="inner">
                    <h3>Sticky bar</h3>
                    <p>Dodaj ali uredi sticky bar</p>
                  </div>
              </Link>
            </div>
            <div className="settings-box">
              <Link to='/discounts' className="small-box">
                  <div className="inner">
                    <h3>Kuponi</h3>
                    <p>Dodaj ali uredi kupone za popust</p>
                  </div>
              </Link>
            </div>
            <div className="settings-box">
              <Link to='/otoms' className="small-box">
                  <div className="inner">
                    <h3>OTO maili</h3>
                    <p>Dodaj ali uredi OTO maile</p>
                  </div>
              </Link>
            </div>
            <div className="settings-box">
              <Link to='/blog_categories' className="small-box">
                  <div className="inner">
                    <h3>Blog kategorije</h3>
                    <p>Dodaj ali uredi blog kategorije</p>
                  </div>
              </Link>
            </div>
            <div className="settings-box">
              <Link to='/top_image_bar' className="small-box">
                  <div className="inner">
                    <h3>Naslovni slider</h3>
                    <p>Dodaj ali uredi naslovni slider</p>
                  </div>
              </Link>
            </div>
            <div className="settings-box">
              <Link to='/instagram_feed' className="small-box">
                  <div className="inner">
                    <h3>Instagram feed</h3>
                    <p>Dodaj ali uredi instagram feed</p>
                  </div>
              </Link>
            </div>
            <div className="settings-box">
              <a className="small-box">
                  <div className="inner">
                  <Dropzone style={dropzoneStyle} name="images" multiple={ true } onDrop={this.openImage.bind(this)}>
                    <h3>Upload slik</h3>
                    <p>Dodaj slike</p>
                    </Dropzone>
                  </div>
              </a>
            </div>
            <div className="settings-box">
              <Link to='/mediums' className="small-box">
                  <div className="inner">
                    <h3>Mediji o nas</h3>
                    <p>Dodaj ali uredi medije</p>
                  </div>
              </Link>
            </div>
            <div className="settings-box">
              <Link to='/testimonials' className="small-box">
                  <div className="inner">
                    <h3>Izjave uporabnikov</h3>
                    <p>Dodaj ali uredi izjave uporabnikov</p>
                  </div>
              </Link>
            </div>
            <div className="settings-box">
              <Link to='/ac_mails' className="small-box">
                  <div className="inner">
                    <h3>Abandoned cart maili</h3>
                    <p>Dodaj ali uredi maile</p>
                  </div>
              </Link>
            </div>
            <div className="settings-box">
              <Link to='/user-testimonials' className="small-box">
                  <div className="inner">
                    <h3>Mnenja strank</h3>
                    <p>Dodaj ali uredi mnenja strank pri izdelkih</p>
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
