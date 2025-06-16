import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { openLanguages } from '../actions/mainActions.js'

class LanguagePicker extends Component {
  constructor(props) {
    super(props)
    this.state = {
      activeCountry: {},
      activeLang: {},
    }
    this.setWrapperRef = this.setWrapperRef.bind(this)
    this.handleClickOutside = this.handleClickOutside.bind(this)
    this.renderSingleCountry = this.renderSingleCountry.bind(this)
    this.renderActiveCountry = this.renderActiveCountry.bind(this)
    this.renderCountryLanguages = this.renderCountryLanguages.bind(this)
  }

  setCountry = data => () => {
    if (this.state.activeCountry.id !== data.id) {
      this.setState({ 
        activeCountry: data,
        activeLang: data.langs[0]
      })
    }
  }

  renderSingleCountry(country, index) {
    return (
      <React.Fragment key={index}>
        <li
          className={`country-item d-flex align-items-center ${
            this.state.activeCountry.id === country.id ? 'active' : ''
          }`}
          onClick={this.setCountry(country)}>
          <span className='list-flag'>
            <img
              src={`/static/images/flags/${country.name.toLowerCase()}.svg`}
              className='img-fluid'
              alt={`${country.full_name}`}
            />
          </span>{' '}
          {country.full_name}
        </li>
      </React.Fragment>
    )
  }

  renderActiveCountry(country, index) {
    return (
      <React.Fragment key={index}>
        {this.state.activeCountry.id === country.id && (
          <div
            className={`country-item d-flex align-items-center ${
              this.state.activeCountry.id === country.id ? 'active' : ''
            }`}>
            <span className='list-flag'>
              <img
                src={`/static/images/flags/${country.name.toLowerCase()}.svg`}
                className='img-fluid'
                alt={`${country.full_name}`}
              />
            </span>{' '}
            {country.full_name}
          </div>
        )}
      </React.Fragment>
    )
  }

  renderCountryLanguages(country, index) {
    return (
      <React.Fragment key={index}>
        {country.langs.length > 0 ? (
          <div
            className={`country-options ${
              this.state.activeCountry.id === country.id ? '' : 'closed'
            }`}>
            {country.langs &&
              country.langs.map(this.renderSubLanguages.bind(this, country))}
          </div>
        ) : (
          ''
        )}
      </React.Fragment>
    )
  }

  setLanguage = (country, lang) => () => {
    this.setState({ activeLang: lang })
    localStorage.setItem(
      'locale',
      JSON.stringify({ country: country.name, lang: lang.name }),
    )
    this.props.setLanguage(country.name, lang.name)
  }

  renderSubLanguages(country, data, index) {
    return (
      <a
        key={index}
        onClick={this.setLanguage(country, data)}
        className={`country-options-a ${
          data.name === this.state.activeLang.name ? 'active' : ''
        }`}>
        {data.full_name}
      </a>
    )
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside)
    let locale = localStorage.getItem('locale')

    if (
      this.props.locale &&
      this.props.locale.country !== this.props.country.toUpperCase() &&
      !locale
    ) {
      this.openLangs()
      let country = this.props.countries.find(c => {
        return c.name === this.props.locale.country
      })
      this.setState({ 
        activeCountry: country,
        activeLang: country.langs[0]
      })
    } else {
      let country = this.props.countries && this.props.countries.find(c => {
        return c.name === this.props.country.toUpperCase()
      })
      this.setState({ 
        activeCountry: country,
        activeLang: country && country.langs[0]
      })
    }
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside)
  }

  setWrapperRef(node) {
    this.wrapperRef = node
  }

  handleClickOutside(event) {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      if (
        this.props.isLanguagesOpen &&
        event.srcElement.dataset.pointer !== 'lang-t'
      ) {
        this.props.openLanguages(false)
      }
    }
  }

  openLangs() {
    this.props.openLanguages(!this.props.isLanguagesOpen)
  }

  render() {
    const { countries, isLanguagesOpen, language } = this.props

    return (
      <div
        ref={this.setWrapperRef}
        className={`language-picker-wrap ${isLanguagesOpen ? '' : 'closed'}`}>
        <div className='container language-picker-in'>
          <div className='row d-flex flex-column'>
            <p className='lang-text'>{language.header.data.pilant.value}</p>
            <label className='country-dropdown'>
              <div className='btn btn-country-pick dd-button'>
                {countries && countries.map(this.renderActiveCountry)}
              </div>
              <input type='checkbox' className='dd-input' id='countryDrop' />
              <ul className='dd-menu'>
                {countries && countries.map(this.renderSingleCountry)}
              </ul>
            </label>
            <p className='lang-text'>{language.header.data.pilang.value}</p>
            {countries && countries.map(this.renderCountryLanguages)}
            <div className='submit-language text-right'>
              <a
                onClick={this.setLanguage(
                  this.state.activeCountry,
                  this.state.activeLang,
                )}
                className={`btn btn-primary btn-main-small`}>
                {language.main.data.lang_btn1.value}
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    openLanguages: bindActionCreators(openLanguages, dispatch),
  }
}

function mapStateToProps(state) {
  return {
    isLanguagesOpen: state.main.isLanguagesOpen,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LanguagePicker)