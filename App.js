
import React, { Component }    from 'react';

import Baballe from './src/Baballe'


export default class App extends Component {
  render() {
    return (
      <Baballe bgColor={'#4b5cba'}
               baballeColor1={'#ea296a'}
               baballeColor2={'#ffeb3b'}
               baballeSize={55}
      />
    );
  }
}
