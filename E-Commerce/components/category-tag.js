import React from "react";

class CategoryTag extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedCategory: ''
    };

    this.renderSingleCategory = this.renderSingleCategory.bind(this)
    this.renderSingleTag = this.renderSingleTag.bind(this)
  }

  componentDidMount(){

  };

  changeCategory = (row) => () => {
    if (!this.props.readonly)
      this.props.changeCategory(row)
  }

  changeTag = (row) => () => {
    if (!this.props.readonly)
      this.props.changeTag(row)
  }

  renderSingleCategory(row, index) {
    return (
      <li key={index} className="pointer nav-item mr-2 ml-2 text-center">
        <p onClick={this.changeCategory(row)} className={`nav-link ${row.active ? 'active' : ''}`}>{row.name}
        <span className="sr-only">(current)</span></p>
      </li>
    )
  }

  renderSingleTag(row, index) {
    return (
      <li key={index} className="pointer nav-item mr-3 ml-3">
        <p onClick={this.changeTag(row)} className={`nav-link ${row.active ? 'active' : ' ' } `}>{row.name}
        <span className="sr-only">(current)</span></p>
      </li>
    )
  }

  render() {
    const { blog_categories, blog_tags, renderTags=true } = this.props;
    return (
      <div>
        <nav className="navbar navbar-expand-sm navbar-light category-nav">
          <div className="navbar-collapse">
            <ul className="navbar-nav mr-auto ml-auto">
              {blog_categories.map(this.renderSingleCategory)}
            </ul>
          </div>
        </nav>
        <div className="border nav-border"></div>
        {renderTags && <nav className="navbar navbar-expand-lg navbar-light tag-nav">
          <div className="navbar-collapse">
            <ul className="mr-auto ml-auto">
              {blog_tags.map(this.renderSingleTag)}
            </ul>
          </div>
        </nav>}
      </div>
    );
  }
}

CategoryTag.propTypes = {

};

export default CategoryTag;
