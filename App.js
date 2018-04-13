
import React, { Component }    from 'react';
import { Animated,
         Dimensions,
         Easing,
         PanResponder,
         StyleSheet,
         Text,
         TouchableOpacity,
         View } from 'react-native';


const baballeSize = 44;


export default class App extends Component {
  constructor () {
    super();
    const initialHeight = (Dimensions.get('window').height - baballeSize) / 2.0;
    this.animatedBaballePoseY = new Animated.Value(initialHeight);
    this.animatedBaballeOnTouch = new Animated.Value(1.0);
    this.touchOffset = {x: 0, y: 0};
  }

  componentWillMount () {
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onShouldBlockNativeResponder: (evt, gestureState) => true,
      onPanResponderGrant: (evt, gestureState) => {
        this.touchOffset.x = evt.nativeEvent.locationX;
        this.touchOffset.y = evt.nativeEvent.locationY;
        this.animateOnTouch();
      },
      onPanResponderMove: (evt, gestureState) => {
        this.animatedBaballePoseY.setValue(gestureState.moveY - this.touchOffset.y);
      },
      onPanResponderRelease: (evt, gestureState) => {
        this.animateThrow(gestureState.moveY, gestureState.vy);
      },
      onPanResponderTerminate: (evt, gestureState) => {},
    });
  }

  animateThrow(currentY, speedY) {
    Animated.decay(
      this.animatedBaballePoseY, {
        velocity: speedY,
        deceleration: 0.997,
      }).start();
  }

  animateOnTouch() {
    this.animatedBaballeOnTouch.setValue(1.0);
    Animated.spring(
      this.animatedBaballeOnTouch, {
        toValue: 1.0,
        friction: 1.5,
        velocity: -1,
      },
    ).start();
  }

  makeWrappingRange(value, numWraps) {
    const inputRange = [];
    const outputRange = [];

    inputRange.push(0);
    outputRange.push(0);
    for (i = 1; i < numWraps; i++) {
      inputRange.unshift(-i * value);
      inputRange.push(i * value);
      outputRange.unshift(i % 2 === 0 ? 0 : value);
      outputRange.push(i % 2 === 0 ? 0 : value);
    }
    return {inputRange, outputRange};
  }

  render() {
    const heightLimit = Dimensions.get('window').height - baballeSize;
    const wrappedAnimatedPoseY = this.animatedBaballePoseY.interpolate({
      ...this.makeWrappingRange(heightLimit, 100),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      }
    );
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.baballe, {
                         transform: [{scale: this.animatedBaballeOnTouch}],
                         top: wrappedAnimatedPoseY,
                       }]}
                       {...this.panResponder.panHandlers}
        >
        </Animated.View>
      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4b5cba',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    alignItems: 'flex-end',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  baballe: {
    backgroundColor: "#ea296a",
    position: 'absolute',
    left: (Dimensions.get('window').width - baballeSize) / 2.0,
    borderRadius: baballeSize / 2.0,
    width: baballeSize,
    height: baballeSize,
  }
});
