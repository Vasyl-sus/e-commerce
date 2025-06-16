import React from 'react'
import Link from "next/link"

function Error(props) {
  return (
    <React.Fragment>
      <div className="container page-container">
        <h1 className="main-page-title">Error 404 :(</h1>
        <div className="page-title-border"></div>
      </div>
      <div className="container page-wrap">
        <div className="row">
          <div className="col-12">
            <div className="desc-p text-center" dangerouslySetInnerHTML={{__html: "Error 404 :("}}>
            </div>
          </div>
        </div>
        <div className="text-center mt-5">
          <Link href={`/${props.lang && props.lang.toLowerCase()}-${props.country && props.country.toLowerCase()}`}><button className="btn btn-primary btn-main">Home</button></Link>
        </div>
      </div>
    </React.Fragment>
  )
}

Error.getInitialProps = ({ res, err, req }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : null
  return { statusCode, lang: req.session.lang, country: req.session.country }
}

export default Error
