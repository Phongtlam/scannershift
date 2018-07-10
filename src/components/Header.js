import React from 'react';
import '../stylesheets/header.css';

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

    }
  }

  render() {
    return (
      <div className="app-header">
        <div className="app-header__button file-container">
          Upload Receipt
          <input
            type="file"
            onChange={(e)=>this.props.imageChange(e)}
          />
        </div>
      </div>
    )
  }
}

export default Header;