import React, {Component} from 'react';
import {connect} from 'react-redux';
import { ROOT_URL } from '../../config/constants';
// Require Editor JS files.
import 'froala-editor/js/froala_editor.pkgd.min.js';

// Require Editor CSS files.
import 'froala-editor/css/froala_style.min.css';
import 'froala-editor/css/froala_editor.pkgd.min.css';

import FroalaEditor from 'react-froala-wysiwyg';
import 'froala-editor/js/plugins.pkgd.min.js';


class Froala extends Component {
  constructor(props) {
    super(props)

    this.state = {};
  }


  signOut() {
    this.props.signoutUser();
  }

  render() {
    const { events, config, input } = this.props;

    let c = {...config, key: "fIE3A-9D2H2J2B4D4A3teC-9sE4koldD-13f1D1wzF-7kB6B5F5C4F3E3A3F2A5D3=="}
    c.toolbarButtons = {
              'moreText': {
                'buttons': ['bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'fontFamily', 'fontSize', 'textColor', 'backgroundColor', 'inlineClass', 'inlineStyle', 'clearFormatting']
              },
              'moreParagraph': {
                'buttons': ['alignLeft', 'alignCenter', 'formatUL', 'formatOLSimple', 'alignRight', 'alignJustify', 'formatOL', 'paragraphFormat', 'paragraphStyle', 'lineHeight', 'quote']
              },
              'moreRich': {
                'buttons': ['insertLink', 'insertImage', 'insertTable', 'emoticons', 'fontAwesome', 'specialCharacters', 'embedly']
              },
              'moreMisc': {
                'buttons': ['undo', 'redo', 'html', 'fullscreen', 'getPDF', 'selectAll', 'print', 'help'],
                'align': 'right'
              }
            }
    c.height = 350
    c.emoticonsUseImage = false
    c.charCounterCount = false
    c.codeBeautifierOptions = {
      end_with_newline: true,
      indent_inner_html: true,
      extra_liners: "['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'ul', 'ol', 'table', 'dl']",
      brace_style: 'expand',
      indent_char: ' ',
      indent_size: 4,
      wrap_line_length: 0
    }
    c.imageUploadToS3 = {
      bucket: 'E-commerce',
      region: 'eu-central-1',
      keyStart: 'upload',
      params: {
        acl: 'public-read', // ACL according to Amazon Documentation.
        AWSAccessKeyId: 'AKIAI746ZGDU4SZ5FUDQ', // Access Key from Amazon.
        policy: 'POLICY_STRING',
        signature: ''
    }
    }

    return (
      <FroalaEditor
        tag='textarea'
        config={c}
        {...input}
        model={input.value}
        onModelChange={input.onChange}
      />
    );
  }
}

const mapDispatchToProps = (dispatch) => {
	return {
	}
}

export default connect(null, mapDispatchToProps)(Froala);
