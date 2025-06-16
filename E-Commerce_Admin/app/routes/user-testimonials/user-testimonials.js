import React, {Component} from 'react';
import {browserHistory} from 'react-router';
import Pagination from "rc-pagination";
import Immutable from 'immutable';
import {connect} from 'react-redux';
import { getUserTestimonials, createUserTestimonial, deleteUserTestimonial, editUserTestimonial } from '../../actions/user_testimonials_actions';
import NewUserTestimonial from './new_user-testimonial.js';
import EditUserTestimonial from './edit_user-testimonial.js';


class UserTestimonials extends Component {
    constructor(props) {
      super(props);

      this.state = {
        pageNumber:1,
        pageLimit:15,
        newModal: false,
        editModal: false,
        a_profile_image: null,
        a_images: null,
        replicateModal: false,
        selectedUserTestimonial: null
      };
    }

    componentDidMount()
    {
      var location = browserHistory.getCurrentLocation();

      if(location.query.pageLimit)
        this.setState({ pageLimit: location.query.pageLimit });
      else
        location.query.pageLimit = 15;

      if(location.query.pageNumber)
        this.setState({ pageNumber: location.query.pageNumber });
      else
        location.query.pageNumber = 1;

      browserHistory.replace(location);
      this.props.getUserTestimonials();
    };

    resetPageNumber(location){
      location.query.pageNumber = 1;
      this.setState({ pageNumber: 1 });
      return location;
    }

    pageChange(pageNumber) {
      let location = browserHistory.getCurrentLocation();
      location.query.pageNumber = pageNumber;
      browserHistory.replace(location);
      this.props.getUserTestimonials();
    }

    CreateUserTestimonial(obj)
    {
      this.props.createUserTestimonial(obj);
      this.closeNewModal();
    }

    openNewModal() {
      this.setState({ newModal: true });
    }

    closeNewModal()
    {
      this.setState({ newModal: false })
    }

    openEditModal(userTestimonial) {
      this.setState({ editModal: true });
      this.setState({ selectedUserTestimonial: userTestimonial });
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

    EditUserTestimonial(id, data)
    {
      this.props.editUserTestimonial(id, data);
      this.closeEditModal();
    }

    DeleteUserTestimonial(testimonial)
    {
      var id = testimonial.id;
      if(window.confirm("Ali ste sigurni da hočete izbrisati izjavo?"))
        this.props.deleteUserTestimonial(id);
    }

    renderUserTestimonials(userTestimonial, index){
      return(
        <tr key={index}>
          <td><img src={userTestimonial.image_small} width="50" height="50" /></td>
          <td>{userTestimonial.user_name}</td>
          <td>{userTestimonial.category}</td>
          <td><div dangerouslySetInnerHTML={{ __html: userTestimonial.text }} /></td>
          <td>{userTestimonial.rating}</td>
          <td>{userTestimonial.lang}</td>
          <td>{userTestimonial.country}</td>
          <td className="center">
            <span onClick={this.openEditModal.bind(this, userTestimonial)} className="fas fa-pencil-alt pointer"></span>
          </td>
          <td className="center">
            <span onClick={this.DeleteUserTestimonial.bind(this, userTestimonial)} className="fas fa-trash pointer"></span>
          </td>
        </tr>
      )
    }

    render(){
      const { userTestimonials } = this.props;

      return (
        <div className="content-wrapper container-fluid">
          <div className="row">
            <div className="col-md-12">
              <h2 className="box-title">Mnenja strank</h2>
            </div>
          </div>
          <div className="box box-default">
            <div className="row main-box-head">
              <div className="col-md-12 right">
                <button onClick={this.openNewModal.bind(this)} className="btn btn-default">Dodaj mnenje</button>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="table-responsive no-padding">
                  <table className="table table-striped">
                      <thead>
                        <tr>
                          <th className="left table-pad-l-8">Avatar</th>
                          <th className="left table-pad-l-8">Ime</th>
                          <th className="left table-pad-l-8">Kategorija</th>
                          <th className="left table-pad-l-8">Poruka</th>
                          <th className="left table-pad-l-8">Ocjena</th>
                          <th className="left table-pad-l-8">Jezik</th>
                          <th className="left table-pad-l-8">Država</th>
                          <th className="center table-pad-l-8">Uredi</th>
                          <th className="center table-pad-l-8">Izbriši</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userTestimonials.map(this.renderUserTestimonials.bind(this))}
                      </tbody>
                    </table>
                </div>
                <div className="box-footer w-100 pb-3">
                  <div className="row w-100">
                    <div className="col-sm-6 col-xs-8">
                      <div className="pagination-block">
                        <Pagination
                          defaultPageSize={parseInt(this.state.pageLimit)}
                          defaultCurrent={parseInt(this.state.pageNumber)}
                          onChange={this.pageChange.bind(this)}
                          total={this.props.userTestimonialsCount}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <NewUserTestimonial
            newModal={this.state.newModal}
            closeNewModal={this.closeNewModal.bind(this)}
            countries={this.props.countries}
            languages={this.props.languages}
            CreateUserTestimonial={this.CreateUserTestimonial.bind(this)}
            categories={this.props.categories}
          />

          {
            this.state.editModal &&
            <EditUserTestimonial
              initialValues={ Immutable.fromJS(this.state.selectedUserTestimonial)}
              editModal={this.state.editModal}
              closeEditModal={this.closeEditModal.bind(this)}
              countries={this.props.countries}
              EditUserTestimonial={this.EditUserTestimonial.bind(this)}
              categories={this.props.categories}
              languages={this.props.languages}/>
            }
        </div>
      )
    }
 }

const mapDispatchToProps = (dispatch) => {
  return {
    getUserTestimonials: () => {
      dispatch(getUserTestimonials())
    },
    createUserTestimonial: (data) => {
      dispatch(createUserTestimonial(data))
    },
    deleteUserTestimonial: (id) => {
      dispatch(deleteUserTestimonial(id))
    },
    editUserTestimonial: (id, data) => {
      dispatch(editUserTestimonial(id, data));
    },
  }
}

function mapStateToProps(state)
{
  var nextState = state.toJS();

  return {
    userTestimonials: nextState.user_testimonials_data.userTestimonials,
    userTestimonialsCount: nextState.user_testimonials_data.userTestimonialsCount,
    initialValuesUserTestimonials: nextState.user_testimonials_data.initialValuesUserTestimonials,
    countries: nextState.main_data.countries,
    languages: nextState.main_data.languages,
    categories: nextState.main_data.categories,
    gender: [{label: 'Ženski', value: 'f'}, {label: 'Moški', value: 'm'}],
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserTestimonials);
