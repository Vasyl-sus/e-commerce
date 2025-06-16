import React from "react";
import Router from 'next/router';

class NewsWrap extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

    };
  }

  redirect(url) {
    Router.push(url)
  }

  renderPostCat(row,index){
    return(
      <span className="white-box mx-1 text-uppercase" key={index}>{row}</span>
    )
  }

  renderPosts(row,index){
    var sectionStyle;
    if(row.profile_image){
      sectionStyle = {
        backgroundImage: `url(${row.profile_image.link})`
      };
    }
    else
    {
      sectionStyle = {
        backgroundColor: 'black'
      };
    }
    

    var eq = index;

    if(eq==0 || eq==3){
      return(
        <div key={index} className={`pointer first-one col-md-4 mt-4 ${eq==0 ? 'no-padding-left':'no-padding-right'}`} onClick={this.redirect.bind(this, '/si-si/blog/'+row.url)}>
          <div className="black-back img-blog news-padding blog-bgs" style={sectionStyle}>
            <div className="margin-bottom-small  mb-4">
              {row.categories.map(this.renderPostCat.bind(this))}
            </div>
            <h2 className="white-text">
              {row.title}
            </h2>
            <div className="overlay"></div>
          </div>

        </div>
      )
    }
    if(eq==1 && this.props.blogs.length==2){
      return(
        <div key={index} className="pointer col-md-4 mt-4" onClick={this.redirect.bind(this, '/si-si/blog/'+row.url)}>
          <div className="half-height-news news-margin-b">
            <div className="first-image news-center-padding blog-bgs img-blog" style={sectionStyle}>
              <div className="margin-bottom-small new-cat mb-4">
                {row.categories.map(this.renderPostCat.bind(this))}
              </div> 
              <h3 className="white-text transR right m-t-60">
                {row.title}
              </h3>
              <div className="overlay"></div>
            </div>
          </div>
         
        </div>
      )
    }
    if(eq==2 ){
      var sectionStyle1
      if(this.props.blogs[index-1].profile_image){
        sectionStyle1 = {
          backgroundImage: `url(${this.props.blogs[index-1].profile_image.link})`
        };
      }
      else
      {
        sectionStyle1 = {
          backgroundColor: 'black'
        };
      }
      return(
        <div key={index} className="pointer col-md-4 mt-4" onClick={this.redirect.bind(this, '/si-si/blog/'+this.props.blogs[index-1].url)}>
          <div className="half-height-news news-margin-b">
            <div className="first-image news-center-padding blog-bgs img-blog" style={sectionStyle1}>
              <div className="margin-bottom-small new-cat mb-4">
                {this.props.blogs[index-1].categories.map(this.renderPostCat.bind(this))}
              </div> 
              <h3 className="white-text transR right m-t-60">
                {this.props.blogs[index-1].title}
              </h3>
              <div className="overlay"></div>
            </div>
          </div>
          <div className="half-height-news">
            <div className="second-image news-center-padding blog-bgs img-blog" style={sectionStyle}>
              <div className="margin-bottom-small new-cat mb-4">
                {row.categories.map(this.renderPostCat.bind(this))}
              </div>
              <h3 className="white-text transR right m-t-60">
                {row.title}
              </h3>
              <div className="overlay"></div>
            </div>
          </div>
        </div>
      )
    }
    if(eq==4 ){
      return(
       <div key={index} className="third-image-div pointer col-md-4 no-padding-left mt-4 pt-2" onClick={this.redirect.bind(this, '/si-si/blog/'+row.url)}>
          <div className="third-image news-center-padding pl-5 pt-5 white-text img-blog blog-bgs" style={sectionStyle}>
            <div className="margin-bottom-small  mb-4">
              {row.categories.map(this.renderPostCat.bind(this))}
            </div>
            <h2 className="white-text">
              {row.title}
            </h2>
            <div className="overlay"></div>
          </div>
        
        </div>
      )
    }

    if(eq==5 ){
      return(
       <div key={index} className="pointer col-md-8 no-padding-right mt-4 pt-2" onClick={this.redirect.bind(this, '/si-si/blog/'+row.url)}>
          <div className="pink-back-blog news-padding-pink pl-5 pt-5 img-blog blog-bgs" style={sectionStyle}>
            <div className="margin-bottom-small mb-4">
              {row.categories.map(this.renderPostCat.bind(this))}
            </div>
            <h2 className="white-text">
              {row.title}
            </h2>
            <div className="overlay"></div>
          </div>
        </div>
      )
    }
  }

  render() {
    return (
      <div className="container py-5">
        <div className="row margin-bottom-small-s blog">
          {this.props.blogs && this.props.blogs.length>0 && this.props.blogs.map(this.renderPosts.bind(this))}
        </div>
       
      </div>
    );
  }
}


export default (NewsWrap);
