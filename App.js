
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
    const initialY = (Dimensions.get('window').height - baballeSize) / 2.0;
    const initialX = (Dimensions.get('window').width - baballeSize) / 2.0;
    this.animatedBaballePose = new Animated.ValueXY({x: initialX, y: initialY});
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
        this.animatedBaballePose.setValue({
          x: gestureState.moveX - this.touchOffset.x,
          y: gestureState.moveY - this.touchOffset.y,
        });
      },
      onPanResponderRelease: (evt, gestureState) => {
        Animated.decay(
          this.animatedBaballePose, {
            velocity: {x: gestureState.vx, y: gestureState.vy},
            deceleration: 0.997,
          }).start();
      },
      onPanResponderTerminate: (evt, gestureState) => {},
    });
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
    const limitX = Dimensions.get('window').width - baballeSize;
    const limitY = Dimensions.get('window').height - baballeSize;
    const wrappedAnimatedPoseX = this.animatedBaballePose.x.interpolate({
      ...this.makeWrappingRange(limitX, 100),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const wrappedAnimatedPoseY = this.animatedBaballePose.y.interpolate({
      ...this.makeWrappingRange(limitY, 100),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

    return (
      <View style={styles.container}>
        <Animated.View style={[styles.baballe, {
                         transform: [{scale: this.animatedBaballeOnTouch}],
                         top: wrappedAnimatedPoseY,
                         left: wrappedAnimatedPoseX,
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
    borderRadius: baballeSize / 2.0,
    width: baballeSize,
    height: baballeSize,
  }
});
