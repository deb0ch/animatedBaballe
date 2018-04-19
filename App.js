
import React, { Component } from 'react';
import { StackNavigator }   from 'react-navigation';

import Baballe from './src/Baballe'


class BaballeScreen1 extends Component {
  render() {
    return (
      <Baballe bgColor={'#4b5cba'}
               baballeColor1={'#ea296a'}
               baballeColor2={'#ffeb3b'}
               baballeSize={55}
               leftScreen={''}
               rightScreen={'Baballe2'}
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
               leftScreen={'Baballe1'}
               rightScreen={''}
               {...this.props}
      />
    );
  }
}


const RootStack = StackNavigator({
  Baballe1: {
    screen: BaballeScreen1,
  },
  Baballe2: {
    screen: BaballeScreen2,
  },
}, {
  initialRouteName: 'Baballe1',
  headerMode: 'none',
  navigationOptions: {
    headerVisible: false,
  }
});


export default class App extends Component {
  render() {
    return (
      <RootStack />
    );
  }
}
