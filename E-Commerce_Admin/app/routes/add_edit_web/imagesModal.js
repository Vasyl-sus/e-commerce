import React, {Component} from 'react';
import Modal from 'react-modal';

const otherModalStyles = {
  content : {
    display               : 'block',
    marginTop             : '40px',
    opacity               : 1,
    top                   : '1%',
    left                  : '20%',
    right                 : '20%',
    height                : '40%',
    bottom                : '7%',
    overflow 			        : 'auto',
    boxShadow             : '0px 0px 28px 10px #333'
  }
};

class ImagesModal extends Component {
	constructor(props) {
		super(props)

		this.state = {}
	}

  componentDidMount() {
  }

  closeModal() {
    this.props.closeModal();
  }

  renderSingleRow(row, index) {
    return (
      <li key={index}>
        {row.link}
      </li>
    )
  }

	render() {
    const { files, newModal } = this.props;

		return (
			<Modal
      isOpen={newModal}
      ariaHideApp={false}
      contentLabel="new-customer-prof Modal"
      onRequestClose={this.closeModal.bind(this)}
      style={otherModalStyles}>
        <div className="col-md-12">
          <ul>
            {files.map(this.renderSingleRow.bind(this))}
          </ul>
        </div>
      </Modal>
		);
	}
}

export default ImagesModal;
