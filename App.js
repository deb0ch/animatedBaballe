
import React, { Component } from 'react';
import { TabNavigator }     from 'react-navigation';

import Baballe            from './src/Baballe';
import CardSwipeNavigator from './src/CardSwipeNavigator';


class BaballeScreen1 extends Component {
  render() {
    return (
      <Baballe bgColor={'#4b5cba'}
               baballeColor1={'#ea296a'}
               baballeColor2={'#ffeb3b'}
               baballeSize={55}
               {...this.props}
      />
    );
  }
}


class BaballeScreen2 extends Component {
  render() {
    return (
      <Baballe bgColor={'#ea296a'}
               baballeColor1={'#4b5cba'}
               baballeColor2={'#ffeb3b'}
               baballeSize={55}
               {...this.props}
      />
    );
  }
}


const AppNavigator = CardSwipeNavigator({
  Baballe1: {
    screen: BaballeScreen1,
  },
  Baballe2: {
    screen: BaballeScreen2,
  },
}, {
  initialRouteName: 'Baballe1',
});


export default class App extends Component {
  render() {
    return (
      <AppNavigator />
    );
  }
}
