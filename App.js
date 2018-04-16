
import React, { Component } from 'react';
import { StackNavigator }   from 'react-navigation';

import Baballe from './src/Baballe'


class BaballeScreen extends Component {
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


const RootStack = StackNavigator({
  Baballe: {
    screen: BaballeScreen,
  },
}, {
  initialRouteName: 'Baballe',
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
