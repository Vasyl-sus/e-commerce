import React, {Component} from 'react';
import {browserHistory} from 'react-router';
import Pagination from "rc-pagination";
import Immutable from 'immutable';
import {connect} from 'react-redux';
import {getTestimonials, createTestimonial, deleteTestimonial, editTestimonial, setInitialValuesTestimonial} from '../../actions/testimonials_actions';
import NewTestimonial from './new_testimonial.js';
import EditTestimonial from './edit_testimonial.js';
import ReplicateTestimonial from './replicate_testimonial.js';

class Testimonials extends Component {
    constructor(props) {
      super(props);

      this.state = {pageNumber:1, pageLimit:15, newModal: false, editModal: false, a_profile_image:null, a_images:null, replicateModal: false, selectedTestimonial: null};
    }

    componentDidMount()
    {
      var location = browserHistory.getCurrentLocation();

      if(location.query.pageLimit)
        this.setState({pageLimit: location.query.pageLimit});
      else
        location.query.pageLimit = 15;

      if(location.query.pageNumber)
        this.setState({pageNumber: location.query.pageNumber});
      else
        location.query.pageNumber = 1;

      browserHistory.replace(location);
      this.props.getTestimonials();
    };

    resetPageNumber(location){
      location.query.pageNumber = 1;
      this.setState({pageNumber:1});
      return location;
    }

    pageChange(pageNumber) {
      let location = browserHistory.getCurrentLocation();
      location.query.pageNumber = pageNumber;
      browserHistory.replace(location);
      this.props.getTestimonials();
    }

    CreateTestimonial(obj)
    {
      this.props.createTestimonial(obj)
      this.closeNewModal();
    }

    openNewModal() {
      this.setState({newModal: true});
    }

    closeNewModal()
    {
      this.setState({newModal: false})
    }

    openEditModal(testimonial) {
      this.setState({editModal: true});
      this.setState({a_profile_image: testimonial.profile_image})
      this.setState({a_images: testimonial.timeline_image})
      this.setState({a_instagram_images: testimonial.instagram_images})
      var data = testimonial;
      data.therapies = []

      data.productcategories.map(p => {
        data.therapies.push({value: p.pc_id, label: p.pc_name})
      })
      this.setState({selectedTestimonial: data})
    }

    closeEditModal()
    {
      this.setState({editModal: false})
    }

    openReplicateModal(testimonial) {
      this.setState({replicateModal: true});
      this.setState({a_profile_image: testimonial.profile_image})
      this.setState({a_images: testimonial.timeline_image})
      this.setState({a_instagram_images: testimonial.instagram_images})
      var data = testimonial;
      data.therapies = []

      data.productcategories.map(p => {
        data.therapies.push({value: p.pc_id, label: p.pc_name})
      })
      this.setState({selectedTestimonial: data})
    }

    closeReplicateModal()
    {
      this.setState({replicateModal: false})
    }

    ReplicateTestimonial(obj)
    {
      this.props.createTestimonial(obj)
      this.closeReplicateModal();
    }

    EditTestimonial(data, testimonial)
    {
      var id = testimonial.id;
      //delete testimonial.id;
      this.props.editTestimonial(id, data);
      this.closeEditModal();
    }

    DeleteTestimonial(testimonial)
    {
      var id = testimonial.id;
      if(window.confirm("Ali ste sigurni da hočete izbrisati izjavo?"))
        this.props.deleteTestimonial(id);
    }

    renderTestimonials(testimonial, index){
      return(
        <tr key={index}>
          <td>{testimonial.full_name}</td>
          <td>{testimonial.profession}</td>
          <td>{testimonial.gender}</td>
          <td>{testimonial.language}</td>
          <td>{testimonial.category}</td>
          <td className="center">
            <span onClick={this.openEditModal.bind(this, testimonial)} className="fas fa-pencil-alt pointer"></span>
          </td>
          <td className="center">
            <span onClick={this.openReplicateModal.bind(this, testimonial)} className="fas fa-clone pointer"></span>
          </td>
          <td className="center">
            <span onClick={this.DeleteTestimonial.bind(this, testimonial)} className="fas fa-trash pointer"></span>
          </td>
        </tr>
      )
    }

    render(){
      const {testimonials, categories} = this.props;

      return (
        <div className="content-wrapper container-fluid">
          <div className="row">
            <div className="col-md-12">
              <h2 className="box-title">Izjave uporabnikov</h2>
            </div>
          </div>
          <div className="box box-default">
            <div className="row main-box-head">
              <div className="col-md-12 right">
                <button onClick={this.openNewModal.bind(this)} className="btn btn-default">Dodaj izjavo</button>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="table-responsive no-padding">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th className="left table-pad-l-8">Ime in priimek</th>
                        <th className="left table-pad-l-8">Profesija</th>
                        <th className="left table-pad-l-8">Spol</th>
                        <th className="left table-pad-l-8">Jezik</th>
                        <th className="left table-pad-l-8">Kategorija</th>
                        <th className="center table-pad-l-8">Uredi</th>
                        <th className="center table-pad-l-8">Dupliciraj</th>
                        <th className="center table-pad-l-8">Izbriši</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testimonials.map(this.renderTestimonials.bind(this))}
                    </tbody>
                  </table>
                </div>
                <div className="box-footer w-100 pb-3">
                  <div className="row w-100">
                    <div className="col-sm-6 col-xs-8">
                      <div className="pagination-block">
                        <Pagination defaultPageSize={parseInt(this.state.pageLimit)} defaultCurrent={parseInt(this.state.pageNumber)} onChange={this.pageChange.bind(this)} total={this.props.testimonialsCount}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <NewTestimonial categories={categories} newModal={this.state.newModal} closeNewModal={this.closeNewModal.bind(this)} countries={this.props.countries} gender={this.props.gender} category={this.props.category} languages={this.props.languages} CreateTestimonial={this.CreateTestimonial.bind(this)}/>
          {this.state.editModal && <EditTestimonial categories={categories} initialValues={Immutable.fromJS(this.state.selectedTestimonial)} editModal={this.state.editModal} closeEditModal={this.closeEditModal.bind(this)} countries={this.props.countries} gender={this.props.gender}
          category={this.props.category} a_profile_image={this.state.a_profile_image} a_images={this.state.a_images} a_instagram_images={this.state.a_instagram_images} EditTestimonial={this.EditTestimonial.bind(this)} testimonials={this.props.testimonials} languages={this.props.languages}/>}
          {this.state.replicateModal && <ReplicateTestimonial categories={categories} initialValues={Immutable.fromJS(this.state.selectedTestimonial)} replicateModal={this.state.replicateModal} closeReplicateModal={this.closeReplicateModal.bind(this)} countries={this.props.countries} gender={this.props.gender}
          category={this.props.category} a_profile_image={this.state.a_profile_image} a_images={this.state.a_images} a_instagram_images={this.state.a_instagram_images} ReplicateTestimonial={this.ReplicateTestimonial.bind(this)} testimonials={this.props.testimonials} languages={this.props.languages}/>}
        </div>
      )
    }
 }

const mapDispatchToProps = (dispatch) => {
  return {
    getTestimonials: () => {
      dispatch(getTestimonials())
    },

    createTestimonial: (obj) => {
      dispatch(createTestimonial(obj))
    },

    setInitialValuesTestimonial: (testimonial) => {
      dispatch(setInitialValuesTestimonial(testimonial));
    },

    editTestimonial: (id, data) => {
      dispatch(editTestimonial(id, data));
    },

    deleteTestimonial: (id) => {
      dispatch(deleteTestimonial(id))
    }
  }
}

function mapStateToProps(state)
{
  var nextState = state.toJS();

  return {
    testimonials: nextState.testimonials_data.testimonials,
    testimonialsCount: nextState.testimonials_data.testimonialsCount,
    initialValuesTestimonials: nextState.testimonials_data.initialValuesTestimonials,
    countries: nextState.main_data.countries,
    languages: nextState.main_data.languages,
    categories: nextState.main_data.categories,
    gender: [{label: 'Ženski', value: 'f'}, {label: 'Moški', value: 'm'}],
    category: [{label: 'cream', value: 'cream'}, {label: 'eyelash', value: 'eyelash'}, {label: 'tattoo', value: 'tattoo'}, {label: 'aqua', value: 'aqua'}, {label: 'royal', value: 'royal'}, {label: 'caviar', value: 'caviar'}, {label: 'lotion', value: 'lotion'}, {label: 'procollagen', value: 'procollagen'}]
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Testimonials);
