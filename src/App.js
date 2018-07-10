import React, { Component } from 'react';
import './App.css';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';
import axios from 'axios';
import Header from './components/Header';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      infoRow: ''
    }
  }
  componentDidMount() {
    this.getAccountData();
  }

  getAccountData() {
    const url = 'https://api-sandbox.tradeshift.com/tradeshift/rest/external/account/info';
    const oauth = OAuth({
      consumer: {
        key: process.env.REACT_APP_CONSUMER_KEY,
        secret: process.env.REACT_APP_CONSUMER_SECRET,
      },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string, key) {
        return crypto.createHmac('sha1', key).update(base_string).digest('base64');
      }
    });
    const request_data = {
      url: url,
      method: 'GET'
    };
    const token = {
      key: process.env.REACT_APP_TOKEN,
      secret: process.env.REACT_APP_TOKEN_SECRET
    };
    axios(url, {
      headers: {...oauth.toHeader(oauth.authorize(request_data, token))}
    })
    .then(response => {
      console.log(response)
      if (response.status !== 200) {
        console.log(`There is a problem with connection, status code ${response.status}`);
        return;
      }
      return response.data;
    })
    .then(data => {
      console.log('what is body', data)
    })
    .catch(error => {
      console.log('error', error);
    })
  }

  processImage = (e) => {
    e.preventDefault();
    const { imageViewer } = this.state;
    let myImage = imageViewer.slice(22, imageViewer.length);
    const googleV = `https://vision.googleapis.com/v1/images:annotate?key=${process.env.REACT_APP_VISION}`;

    axios(googleV, {
      method: 'POST',
      // mode: 'cors',
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      data: {
        "requests": [
          {
            "image": {
              "content": myImage,
            },
            "features": [
              {
                "type": "DOCUMENT_TEXT_DETECTION"
              }
            ]
          }
        ]
      }
    })
    .then(response => {
      console.log('what is receipt return', response)
      // this is the parse receipt
      let infoRow = (response) ? response.data.responses[0].textAnnotations[0].description.split('\n') : null;
      return infoRow;
    })
    .then(infoRow => {
      if (infoRow) {
        this.setState({ infoRow });
        return infoRow;
      } else {
        return;
      }
    })
    .then((infoRow) => {
      this.autoImport();
    })
  }

  imageChange = (e) => {
    e.persist();
    let reader = new FileReader();
    let image = e.target.files[0];
    if (!image) return;
    reader.readAsDataURL(image);

    reader.onloadend = () => {
      this.setState({
        image,
        imageViewer: reader.result,
      }, () => {
        this.processImage(e);
      });
    };
  }

  render() {
    return (
      <div className="App">
        <Header
          imageChange={this.imageChange}
        />
      </div>
    );
  }
}

export default App;
