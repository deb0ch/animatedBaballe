
import PropTypes            from 'prop-types';
import React, { Component } from 'react';
import { Animated,
         Button,
         Easing,
         PanResponder,
         StyleSheet,
         Text,
         TouchableOpacity,
         View }             from 'react-native';


export default class Baballe extends Component {
  constructor (props) {
    super(props);
    this.animatedBaballePose = new Animated.ValueXY({x: 0, y: 0});
    this.animatedBaballeOnTouch = new Animated.Value(1);
    this.animatedBaballeTravel = new Animated.Value(0);
    this.touchOffset = {x: 0, y: 0};
    this.baballeInitialized = false;
    this.styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: this.props.bgColor,
      },
      baballe: {
        backgroundColor: this.props.baballeColor,
        position: 'absolute',
        borderRadius: this.props.baballeSize / 2,
        width: this.props.baballeSize,
        height: this.props.baballeSize,
      }
    });
    this.state = {
      layout: null,
    };
  }

  componentWillMount () {
    this.panResponderBaballe = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => false,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
      onPanResponderTerminationRequest: (evt, gestureState) => false,
      onShouldBlockNativeResponder: (evt, gestureState) => true,
      onPanResponderGrant: this.baballeOnPanResponderGrant.bind(this),
      onPanResponderMove: this.baballeOnPanResponderMove.bind(this),
      onPanResponderRelease: this.baballeOnPanResponderRelease.bind(this),
      onPanResponderTerminate: (evt, gestureState) => {},
    });
    this.panResponderNav = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => false,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => false,
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onShouldBlockNativeResponder: (evt, gestureState) => true,
      onPanResponderGrant: (evt, gestureState) => {},
      onPanResponderMove: (evt, gestureState) => {},
      onPanResponderRelease: this.navOnPanResponderRelease.bind(this),
      onPanResponderTerminate: (evt, gestureState) => {},
    });
  }

  baballeOnPanResponderGrant(evt, gestureState) {
    this.touchOffset.x = evt.nativeEvent.locationX;
    this.touchOffset.y = evt.nativeEvent.locationY;
    this.animateOnTouch();
    Animated.loop(Animated.timing(
      this.animatedBaballeTravel, {
        toValue: 1200,
        duration: 600,
        easing: Easing.sin,
      }
    )).start();
  }

  baballeOnPanResponderMove(evt, gestureState) {
    this.animatedBaballePose.setValue({
      x: gestureState.moveX - this.touchOffset.x,
      y: gestureState.moveY - this.touchOffset.y,
    });
  }

  baballeOnPanResponderRelease(evt, gestureState) {
    Animated.decay(
      this.animatedBaballePose, {
        velocity: {x: gestureState.vx, y: gestureState.vy},
        deceleration: 0.997,
      }
    ).start();
    Animated.decay(
      this.animatedBaballeTravel, {
        velocity: Math.sqrt(Math.pow(gestureState.vx, 2) + Math.pow(gestureState.vy, 2)),
        deceleration: 0.997,
      }
    ).start();
  }

  navOnPanResponderRelease(e, gestureState) {
    if (gestureState.dx > this.state.layout.x / 3) {
      this.props.navigation.navigate(this.props.leftScreen);
    } else if (gestureState.dx < -this.state.layout.x / 3) {
      this.props.navigation.navigate(this.props.rightScreen);
    }
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
    for (const i = 1; i <= numWraps; i++) {
      inputRange.unshift(-i * value);
      inputRange.push(i * value);
      outputRange.unshift(i % 2 === 0 ? 0 : value);
      outputRange.push(i % 2 === 0 ? 0 : value);
    }
    return {inputRange, outputRange};
  }

  makeColorFadingRange(period, times, color1, color2) {
    const inputRange = [];
    const outputRange = [];
    inputRange.push(0);
    outputRange.push(color1);
    for (const i = 1; i <= times; i++) {
      inputRange.unshift(-i * period);
      inputRange.push(i * period);
      outputRange.unshift(i % 2 ? color2 : color1);
      outputRange.push(i % 2 ? color2 : color1);
    }
    return {inputRange, outputRange};
  }

  initBaballe(layout) {
    this.animatedBaballePose.x.setValue((layout.width - this.props.baballeSize) / 2);
    this.animatedBaballePose.y.setValue((layout.height - this.props.baballeSize) / 2);
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
        <View style={this.styles.container}
              onLayout={this.handleOnLayout.bind(this)}
        />
      );
    }
    const limitX = this.state.layout.width - this.props.baballeSize;
    const limitY = this.state.layout.height - this.props.baballeSize;
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
    const baballeColor = this.animatedBaballeTravel.interpolate({
      ...this.makeColorFadingRange(600, 100,
                                   this.props.baballeColor1,
                                   this.props.baballeColor2),
    })
    return (
      <View style={this.styles.container}
            onLayout={this.handleOnLayout.bind(this)}
            {...this.panResponderNav.panHandlers}
      >
        <Animated.View style={[this.styles.baballe, {
                         transform: [{scale: this.animatedBaballeOnTouch}],
                         top: wrappedAnimatedPoseY,
                         left: wrappedAnimatedPoseX,
                         backgroundColor: baballeColor,
                       }]}
                       {...this.panResponderBaballe.panHandlers}
        />
      </View>
    );
  }
}

Baballe.propTypes = {
  bgColor: PropTypes.string.isRequired,
  baballeColor1: PropTypes.string.isRequired,
  baballeColor2: PropTypes.string.isRequired,
  baballeSize: PropTypes.number.isRequired,
  leftScreen: PropTypes.string.isRequired,
  rightScreen: PropTypes.string.isRequired,
};
