import React from "react";

class CheckoutFooter extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

    };

  }

  render() {
    const { language } = this.props;

    return (
      <footer className="footer">
        <div className="container">
          <div className="row">
            <div className="footer-border"></div>
          </div>
          <div className="col-12 text-center rights">
            <div dangerouslySetInnerHTML={{__html:language.footer.data.rights.value}}></div>
          </div>
        </div>
      </footer>
    );
  }
}


export default (CheckoutFooter);
