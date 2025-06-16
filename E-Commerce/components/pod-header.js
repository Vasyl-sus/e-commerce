import React from "react";
import Link from 'next/link'

class PodHeader extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      
    };
  }

  render() {
    const { language, lang, country, routes } = this.props;

    var blogLink = routes && routes.find(r => {return r.page == blogRoute}) || {route: ''}
    var ambasadorsLink = routes && routes.find(r => {return r.page == ambasadorsRoute}) || {route: ''}
    var productsLink = routes && routes.find(r => {return r.page == productsRoute}) || {route: ''}

    return (
      <nav className="navbar navbar-expand-lg navbar-light pod-header-wrap">
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav mr-auto ml-auto">
            <li className="nav-item mr-5 active">
              <Link href={`/${lang}-${country}/${productsLink.route}`}><a className="nav-link">{language.header.data.nav_1.value} 
              <span className="sr-only">(current)</span></a></Link>
            </li>
            <li className="nav-item mr-5">
              <Link href={`/${lang}-${country}/${ambasadorsLink.route}`}><a className="nav-link">{language.header.data.nav_2.value} 
              <span className="sr-only">(current)</span></a></Link>
            </li>
            <li className="nav-item mr-5">
              <Link href={`/${lang}-${country}/${blogLink.route}`}><a className="nav-link">{language.header.data.nav_3.value} 
              <span className="sr-only">(current)</span></a></Link>
            </li>
            <li className="nav-item mr-5">
              <Link href={`/${lang}-${country}`}><a className="nav-link">{language.header.data.nav_4.value} 
              <span className="sr-only">(current)</span></a></Link>
            </li>
          </ul>
        </div>
      </nav>
    );
  }
}

PodHeader.propTypes = {

};

export default PodHeader;
