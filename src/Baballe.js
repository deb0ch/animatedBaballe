
import React, { Component } from 'react';
import { Animated,
         Easing,
         PanResponder,
         StyleSheet,
         Text,
         TouchableOpacity,
         View }             from 'react-native';


const baballeSize = 55;


export default class Baballe extends Component {
  constructor () {
    super();
    this.animatedBaballePose = new Animated.ValueXY({x: 0, y: 0});
    this.animatedBaballeOnTouch = new Animated.Value(1.0);
    this.touchOffset = {x: 0, y: 0};
    this.baballeInitialized = false;
    this.state = {
      layout: null,
    };
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
    for (i = 1; i <= numWraps; i++) {
      inputRange.unshift(-i * value);
      inputRange.push(i * value);
      outputRange.unshift(i % 2 === 0 ? 0 : value);
      outputRange.push(i % 2 === 0 ? 0 : value);
    }
    return {inputRange, outputRange};
  }

  initBaballe(layout) {
    this.animatedBaballePose.x.setValue((layout.width - baballeSize) / 2);
    this.animatedBaballePose.y.setValue((layout.height - baballeSize) / 2);
    this.baballeInitialized = true;
  }

  handleOnLayout(e) {
    const layout = e.nativeEvent.layout;
    if (!this.state.baballeInitialized)
      this.initBaballe(layout);
    this.setState({layout});
  }

  render() {
    if (!this.state.layout) {
      return (
        <View style={styles.container}
              onLayout={this.handleOnLayout.bind(this)}
        />
      );
    }
    const limitX = this.state.layout.width - baballeSize;
    const limitY = this.state.layout.height - baballeSize;
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
      <View style={styles.container}
            onLayout={this.handleOnLayout.bind(this)}
      >
        <Animated.View style={[styles.baballe, {
                         transform: [{scale: this.animatedBaballeOnTouch}],
                         top: wrappedAnimatedPoseY,
                         left: wrappedAnimatedPoseX,
                       }]}
                       {...this.panResponder.panHandlers}
        />
      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4b5cba',
  },
  baballe: {
    backgroundColor: "#ea296a",
    position: 'absolute',
    borderRadius: baballeSize / 2,
    width: baballeSize,
    height: baballeSize,
  }
});
