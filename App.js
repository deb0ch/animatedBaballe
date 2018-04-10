
import React, { Component }    from 'react';
import { Animated,
         Dimensions,
         Easing,
         PanResponder,
         StyleSheet,
         Text,
         TouchableOpacity,
         View } from 'react-native';


export default class App extends Component {
  constructor () {
    super();
    this.animatedBaballe = new Animated.Value(0);
    this.animatedBaballeSize = new Animated.Value(baballeSize);
  }

  componentWillMount () {
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onShouldBlockNativeResponder: (evt, gestureState) => true,
      onPanResponderGrant: (evt, gestureState) => { this.animateOnTouch(); },
      onPanResponderMove: (evt, gestureState) => {},
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 15)
          this.animateBounce();
      },
      onPanResponderTerminate: (evt, gestureState) => {},
    });
  }

  animateBounce() {
    this.animatedBaballe.setValue(0);
    const heightAnimation = Animated.timing(
      this.animatedBaballe,
      {
        toValue: 1,
        duration: 5000,
        easing: Easing.bounce,
      },
    );
    // Animated.loop(heightAnimation).start();
    heightAnimation.start();
  }

  animateOnTouch() {
    this.animatedBaballeSize.setValue(baballeSize * 0.9);
    Animated.spring(
      this.animatedBaballeSize,
      {
        toValue: baballeSize,
        friction: 1.5,
        velocity: 10,
      },
    ).start();
  }

  render() {
    const animatedMargin = this.animatedBaballe.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, Dimensions.get('window').height, 0]
    });
    const animatedColor = this.animatedBaballe.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: ["#ea296a", "#ffeb3b", "#ea296a"]
    });
    const animatedScale = this.animatedBaballe.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 2, 1]
    });
    const animatedBorderRadius = Animated.divide(this.animatedBaballeSize, 2.0);
    const animatedSideMargin = Animated.divide(
      Animated.add(Dimensions.get('window').width,
                   Animated.multiply(this.animatedBaballeSize, -1)),
      2.0);
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.baballe, {
                          backgroundColor: animatedColor,
                          marginBottom: animatedMargin,
                          transform: [{scale: animatedScale}],
                          width: this.animatedBaballeSize,
                          height: this.animatedBaballeSize,
                          borderRadius: animatedBorderRadius,
                          marginLeft: animatedSideMargin,
                          marginRight: animatedSideMargin,
                       }]}
                       {...this.panResponder.panHandlers}
        >
        </Animated.View>
      </View>
    );
  }
}


const baballeSize = 44;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4b5cba',
    alignItems: 'flex-end',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  baballe: {
  }
});
