import React, {Component} from 'react';
import Immutable from 'immutable';
import {connect} from 'react-redux';
import LanguageForm from './languageForm.js';
import NewLanguage from './add_language.js';
import Select from 'react-select';

import { getModulesByLang, setEditLanguage, getAllLanguages, addLanguage, setSubEditLanguage, setTEditLanguage } from '../../actions/languages_actions.js'

class Languages extends Component {
    constructor(props) {
    super(props);

    this.state = { initialValues: null, tab: 'header_footer', selectedLang: 'SL', newModal: false,
    subTab:'header', subSubTab: 'mail_complete', tTab: 'eyelash'};
  }

  componentDidMount() {
    this.props.getAllLanguages();
    this.props.getModulesByLang('SL');
  };

  changeTSubTab(tTab, tab) {
    this.props.setTEditLanguage(tTab, tab)
    this.setState({tTab})
  }

  changeTab(tab) {
    if(tab != 'cream' && tab != 'tattoo' && tab != 'royal' && tab != 'aqua' && tab != 'caviar' && tab != 'eyelash' && tab != 'lotion' && tab != 'procollagen' && tab != 'mail' && tab != 'testers'){
      this.props.setEditLanguage(tab)
      this.setState({tab})
    } else if (tab == 'mail') {
      this.setState({tab})
      this.props.setEditLanguage(tab)
      this.changeSubSubTab("mail_complete")
    } else if (tab == 'testers') {
      this.setState({tab})
      this.props.setEditLanguage(tab)
      this.changeTSubTab('eyelash', tab)
    } else{
      this.setState({tab})
      this.props.setEditLanguage(tab)
      this.changeSubTab('header', tab);
    }
  }

  changeLangSelect(event) {
    this.setState({selectedLang: event.value})
    this.props.getModulesByLang(event.value)
  }

  openNewModal()
  {
    this.setState({newModal: true});
  }

  closeNewModal()
  {
    this.setState({newModal: false})
  }

  addNewLanguage(obj) {
    this.props.addLanguage(obj);
    this.closeNewModal();
  }

  changeSubTab(subTab, name) {
    this.props.setSubEditLanguage(subTab, name)
    this.setState({subTab})
  }

  changeSubSubTab(subSubTab) {
    this.props.setEditLanguage(subSubTab)
    this.setState({subSubTab})
  }

  render(){
    const { language, langFields, selectedLang } = this.props;

    return (
      <div className="content-wrapper container-fluid">
        <div className="row">
          <div className="col-md-12">
            <h2 className="box-title">Jeziki</h2>
          </div>
        </div>
        <div className="box box-default">
          <div className="row main-box-head no-bottom-border">
            <div className="col-md-4">
              <Select
                className="form-white"
                name=""
                placeholder="Izberite jezik..."
                value={this.state.selectedLang}
                onChange={this.changeLangSelect.bind(this)}
                options={this.props.allLanguages}
                multi={false}
              />
            </div>
            <div className="col-md-2">
              <button className="btn btn-primary btn-lg" onClick={this.openNewModal.bind(this)} ><i className="fa fa-heart" aria-hidden="true"></i>DODAJ JEZIK</button>
            </div>
          </div>
        </div>
        <div className="row extra-content">
          <div className="col-md-12">
            <div className="nav-tabs-custom nav-tabs-white">
              <ul className="nav nav-tabs">
                <li className={`cursor_style ${this.state.tab == 'header_footer' ? 'active' : ''}`} onClick={this.changeTab.bind(this, 'header_footer', false)}>
                  <a className="f-15">Header / Footer</a>
                </li>
                <li className={`cursor_style ${this.state.tab == 'main' ? 'active' : ''}`} onClick={this.changeTab.bind(this, 'main', false)}>
                  <a className="f-15">Main</a>
                </li>
                <li className={`cursor_style ${this.state.tab == 'home' ? 'active' : ''}`} onClick={this.changeTab.bind(this, 'home', false)}>
                  <a className="f-15">Home page</a>
                </li>
                <li className={`cursor_style ${this.state.tab == 'cream' ? 'active' : ''}`} onClick={this.changeTab.bind(this, 'cream', false)}>
                  <a className="f-15">4D HYALURON</a>
                </li>
                <li className={`cursor_style ${this.state.tab == 'eyelash' ? 'active' : ''}`} onClick={this.changeTab.bind(this, 'eyelash', false)}>
                  <a className="f-15">EYELASH</a>
                </li>
                <li className={`cursor_style ${this.state.tab == 'tattoo' ? 'active' : ''}`} onClick={this.changeTab.bind(this, 'tattoo', false)}>
                  <a className="f-15">TATTOO NANO SHOCK</a>
                </li>
                <li className={`cursor_style ${this.state.tab == 'caviar' ? 'active' : ''}`} onClick={this.changeTab.bind(this, 'caviar', false)}>
                  <a className="f-15">4D CAVIAR</a>
                </li>
                <li className={`cursor_style ${this.state.tab == 'aqua' ? 'active' : ''}`} onClick={this.changeTab.bind(this, 'aqua', false)}>
                  <a className="f-15">AQUA</a>
                </li>
                <li className={`cursor_style ${this.state.tab == 'royal' ? 'active' : ''}`} onClick={this.changeTab.bind(this, 'royal', false)}>
                  <a className="f-15">ROYAL</a>
                </li>
                <li className={`cursor_style ${this.state.tab == 'lotion' ? 'active' : ''}`} onClick={this.changeTab.bind(this, 'lotion', false)}>
                  <a className="f-15">LOTION</a>
                </li>
                <li className={`cursor_style ${this.state.tab == 'procollagen' ? 'active' : ''}`} onClick={this.changeTab.bind(this, 'procollagen', false)}>
                  <a className="f-15">PROCOLLAGEN</a>
                </li>
                <li className={`cursor_style ${this.state.tab == 'breadcrumbs' ? 'active' : ''}`} onClick={this.changeTab.bind(this, 'breadcrumbs', false)}>
                  <a className="f-15">About/Contact</a>
                </li>
                <li className={`cursor_style ${this.state.tab == 'terms' ? 'active' : ''}`} onClick={this.changeTab.bind(this, 'terms', false)}>
                  <a className="f-15">Terms</a>
                </li>
                <li className={`cursor_style ${this.state.tab == 'blog' ? 'active' : ''}`} onClick={this.changeTab.bind(this, 'blog', false)}>
                  <a className="f-15">Blog</a>
                </li>
                <li className={`cursor_style ${this.state.tab == 'ambassadors' ? 'active' : ''}`} onClick={this.changeTab.bind(this, 'ambassadors', false)}>
                  <a className="f-15">Ambasadors</a>
                </li>
                <li className={`cursor_style ${this.state.tab == 'testers' ? 'active' : ''}`} onClick={this.changeTab.bind(this, 'testers', false)}>
                  <a className="f-15">Testers</a>
                </li>
                <li className={`cursor_style ${this.state.tab == 'checkout' ? 'active' : ''}`} onClick={this.changeTab.bind(this, 'checkout', false)}>
                  <a className="f-15">Checkout</a>
                </li>
                <li className={`cursor_style ${this.state.tab == 'checkout_oto' ? 'active' : ''}`} onClick={this.changeTab.bind(this, 'checkout_oto', false)}>
                  <a className="f-15">Checkout OTO</a>
                </li>
                <li className={`${this.state.tab == 'mail' ? 'active' : ''}`} onClick={this.changeTab.bind(this, 'mail')}>
                    <a className="pointer">Mails</a>
                </li>
                <li className={`${this.state.tab == 'meta_data' ? 'active' : ''}`} onClick={this.changeTab.bind(this, 'meta_data')}>
                    <a className="pointer">Meta</a>
                </li>
                <li className={`${this.state.tab == 'private_cookies' ? 'active' : ''}`} onClick={this.changeTab.bind(this, 'private_cookies')}>
                    <a className="pointer">Zasebnost in piškotki</a>
                </li>
                <li className={`${this.state.tab == 'delivery' ? 'active' : ''}`} onClick={this.changeTab.bind(this, 'delivery')}>
                    <a className="pointer">Dostava in način plačila</a>
                </li>
                <li className={`${this.state.tab == 'returns' ? 'active' : ''}`} onClick={this.changeTab.bind(this, 'returns')}>
                    <a className="pointer">Garancija in vračilo</a>
                </li>
                <li className={`${this.state.tab == 'faq' ? 'active' : ''}`} onClick={this.changeTab.bind(this, 'faq')}>
                    <a className="pointer">FAQ</a>
                </li>
                <li className={`${this.state.tab == 'how_to_buy' ? 'active' : ''}`} onClick={this.changeTab.bind(this, 'how_to_buy')}>
                    <a className="pointer">How to buy</a>
                </li>
                <li className={`${this.state.tab == 'valentines_day' ? 'active' : ''}`} onClick={this.changeTab.bind(this, 'valentines_day')}>
                    <a className="pointer">Valentinovo</a>
                </li>
                <li className={`${this.state.tab == 'stripe_codes' ? 'active' : ''}`} onClick={this.changeTab.bind(this, 'stripe_codes')}>
                    <a className="pointer">Stripe</a>
                </li>
                <li className={`${this.state.tab == 'black_friday' ? 'active' : ''}`} onClick={this.changeTab.bind(this, 'black_friday')}>
                    <a className="pointer">Black Friday</a>
                </li>
              </ul>
            </div>
            {this.state.tab=='testers' &&
              <div className="nav-tabs-custom nav-tabs-white">
                <ul className="nav nav-tabs">
                  <li className={`${this.state.tTab == 'eyelash' ? 'active' : ''}`} onClick={this.changeTSubTab.bind(this, 'eyelash', this.state.tab)}>
                    <a className="pointer">Eyelash</a>
                  </li>
                  <li className={`${this.state.tTab == 'cream' ? 'active' : ''}`} onClick={this.changeTSubTab.bind(this, 'cream', this.state.tab)}>
                    <a className="pointer">Cream</a>
                  </li>
                  <li className={`${this.state.tTab == 'tattoo' ? 'active' : ''}`} onClick={this.changeTSubTab.bind(this, 'tattoo', this.state.tab)}>
                    <a className="pointer">Tattoo</a>
                  </li>
                  <li className={`${this.state.tTab == 'caviar' ? 'active' : ''}`} onClick={this.changeTSubTab.bind(this, 'caviar', this.state.tab)}>
                    <a className="pointer">Caviar</a>
                  </li>
                  <li className={`${this.state.tTab == 'aqua' ? 'active' : ''}`} onClick={this.changeTSubTab.bind(this, 'aqua', this.state.tab)}>
                    <a className="pointer">Aqua</a>
                  </li>
                  <li className={`${this.state.tTab == 'royal' ? 'active' : ''}`} onClick={this.changeTSubTab.bind(this, 'royal', this.state.tab)}>
                    <a className="pointer">Royal</a>
                  </li>
                  <li className={`${this.state.tTab == 'lotion' ? 'active' : ''}`} onClick={this.changeTSubTab.bind(this, 'lotion', this.state.tab)}>
                    <a className="pointer">Lotion</a>
                  </li>
                  <li className={`${this.state.tTab == 'procollagen' ? 'active' : ''}`} onClick={this.changeTSubTab.bind(this, 'procollagen', this.state.tab)}>
                    <a className="pointer">Procollagen</a>
                  </li>
                  <li className={`${this.state.tTab == 'testers' ? 'active' : ''}`} onClick={this.changeTSubTab.bind(this, 'testers', this.state.tab)}>
                    <a className="pointer">Ostalo</a>
                  </li>
                </ul>
              </div>
            }
            {this.state.tab=='mail' &&
              <div className="nav-tabs-custom nav-tabs-white">
                <ul className="nav nav-tabs">
                  <li className={`${this.state.subSubTab == 'mail_complete' ? 'active' : ''}`} onClick={this.changeSubSubTab.bind(this, 'mail_complete')}>
                    <a className="pointer">Prejeto</a>
                  </li>
                  <li className={`${this.state.subSubTab == 'mail_sent' ? 'active' : ''}`} onClick={this.changeSubSubTab.bind(this, 'mail_sent')}>
                    <a className="pointer">Poslano</a>
                  </li>
                  <li className={`${this.state.subSubTab == 'mail_canceled' ? 'active' : ''}`} onClick={this.changeSubSubTab.bind(this, 'mail_canceled')}>
                    <a className="pointer">Preklicano</a>
                  </li>
                  <li className={`${this.state.subSubTab == 'mail_before_delivered' ? 'active' : ''}`} onClick={this.changeSubSubTab.bind(this, 'mail_before_delivered')}>
                    <a className="pointer">Pred dostavljeno</a>
                  </li>
                  <li className={`${this.state.subSubTab == 'mail_delivered' ? 'active' : ''}`} onClick={this.changeSubSubTab.bind(this, 'mail_delivered')}>
                    <a className="pointer">Dostavljeno</a>
                  </li>
                </ul>
              </div>
            }
            {this.state.tab =='cream' || this.state.tab =='tattoo' || this.state.tab =='caviar' || this.state.tab =='aqua' || this.state.tab =='royal' || this.state.tab =='eyelash' || this.state.tab =='lotion' || this.state.tab =='procollagen' ?
              <div className="nav-tabs-custom nav-tabs-white">
                <ul className="nav nav-tabs">
                  <li className={`${this.state.subTab == 'header' ? 'active' : ''}`} onClick={this.changeSubTab.bind(this, 'header', this.state.tab)}>
                    <a className="pointer">Header</a>
                  </li>
                  <li className={`${this.state.subTab == 'ambasador' ? 'active' : ''}`} onClick={this.changeSubTab.bind(this, 'ambasador', this.state.tab)}>
                    <a className="pointer">Ambasador</a>
                  </li>
                  <li className={`${this.state.subTab == 'about_product' ? 'active' : ''}`} onClick={this.changeSubTab.bind(this, 'about_product', this.state.tab)}>
                    <a className="pointer">O izdelku</a>
                  </li>
                  <li className={`${this.state.subTab == 'how_it_works' ? 'active' : ''}`} onClick={this.changeSubTab.bind(this, 'how_it_works', this.state.tab)}>
                    <a className="pointer">Kako deluje</a>
                  </li>
                  <li className={`${this.state.subTab == 'ingridients' ? 'active' : ''}`} onClick={this.changeSubTab.bind(this, 'ingridients', this.state.tab)}>
                    <a className="pointer">Sestavine</a>
                  </li>
                  <li className={`${this.state.subTab == 'how_its_used' ? 'active' : ''}`} onClick={this.changeSubTab.bind(this, 'how_its_used', this.state.tab)}>
                    <a className="pointer">Kako ga uporabljamo</a>
                  </li>
                  <li className={`${this.state.subTab == 'below_content' ? 'active' : ''}`} onClick={this.changeSubTab.bind(this, 'below_content', this.state.tab)}>
                    <a className="pointer">Below_content</a>
                  </li>
                  <li className={`${this.state.subTab == 'product_users' ? 'active' : ''}`} onClick={this.changeSubTab.bind(this, 'product_users', this.state.tab)}>
                    <a className="pointer">Uporabniki</a>
                  </li>
                  <li className={`${this.state.subTab == 'below_cta' ? 'active' : ''}`} onClick={this.changeSubTab.bind(this, 'below_cta', this.state.tab)}>
                    <a className="pointer">Below cta</a>
                  </li>
                </ul>
              </div> : <div></div>
            }
            <div className="box box-default box-upper-tabs">
              <div className="box-body">
                <LanguageForm tab={this.state.tab} selectedLang={selectedLang} langFields={langFields} language={language} initialValues={langFields} />
                <NewLanguage newModal={this.state.newModal} closeNewModal={this.closeNewModal.bind(this)} addNewLanguage={this.addNewLanguage.bind(this)} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    getModulesByLang: (lang) => {dispatch(getModulesByLang(lang))},
    setEditLanguage: (lang, flag) => {dispatch(setEditLanguage(lang, flag))},
    getAllLanguages: () => {dispatch(getAllLanguages())},
    addLanguage: (obj) => {dispatch(addLanguage(obj))},
    setSubEditLanguage: (lang, name) => {dispatch(setSubEditLanguage(lang, name))},
    setTEditLanguage: (lang, name) => {dispatch(setTEditLanguage(lang, name))},

  }
}

function mapStateToProps(state)
{
  var nextState = state.toJS();
  return {
    language: nextState.language_data.language,
    langFields: Immutable.fromJS(nextState.language_data.langFields),
    selectedLang: nextState.language_data.selectedLang,
    allLanguages: nextState.language_data.languages
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Languages);
