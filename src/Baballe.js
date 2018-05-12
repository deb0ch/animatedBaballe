
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
  static propTypes = {
    bgColor: PropTypes.string.isRequired,
    baballeColor1: PropTypes.string.isRequired,
    baballeColor2: PropTypes.string.isRequired,
    baballeSize: PropTypes.number.isRequired,
    deceleration: PropTypes.number,
    leftScreen: PropTypes.string.isRequired,
    rightScreen: PropTypes.string.isRequired,
  };

  static defaultProps = {
    deceleration: 0.997,
  }

  constructor(props) {
    super(props);
    this.animatedBaballePose = new Animated.ValueXY({x: 0, y: 0});
    this.animatedBaballeScale = new Animated.Value(1);
    this.animatedBaballeTravel = new Animated.Value(0);
    this.animatedBaballeColor = this.animatedBaballeTravel.interpolate({
      ...this.makeColorFadingRange(600, 100,
                                   this.props.baballeColor1,
                                   this.props.baballeColor2),
      extrapolate: 'clamp',
    });
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
      onStartShouldSetPanResponder: (e, gestureState) => false,
      onStartShouldSetPanResponderCapture: (e, gestureState) => true,
      onMoveShouldSetPanResponder: (e, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (e, gestureState) => true,
      onPanResponderTerminationRequest: (e, gestureState) => false,
      onShouldBlockNativeResponder: (e, gestureState) => true,
      onPanResponderGrant: this.baballeOnPanResponderGrant.bind(this),
      onPanResponderMove: this.baballeOnPanResponderMove.bind(this),
      onPanResponderRelease: this.baballeOnPanResponderRelease.bind(this),
      onPanResponderTerminate: (e, gestureState) => {},
    });
    this.panResponderNav = PanResponder.create({
      onStartShouldSetPanResponder: (e, gestureState) => true,
      onStartShouldSetPanResponderCapture: (e, gestureState) => false,
      onMoveShouldSetPanResponder: (e, gestureState) => false,
      onMoveShouldSetPanResponderCapture: (e, gestureState) => false,
      onPanResponderTerminationRequest: (e, gestureState) => true,
      onShouldBlockNativeResponder: (e, gestureState) => true,
      onPanResponderGrant: (e, gestureState) => {},
      onPanResponderMove: (e, gestureState) => {},
      onPanResponderRelease: this.navOnPanResponderRelease.bind(this),
      onPanResponderTerminate: (e, gestureState) => {},
    });
  }

  baballeOnPanResponderGrant(e, gestureState) {
    this.touchOffset.x = e.nativeEvent.locationX;
    this.touchOffset.y = e.nativeEvent.locationY;
    this.animatedBaballeTravel.setValue(0);
    this.animateSpringScale();
  }

  baballeOnPanResponderMove(e, gestureState) {
    const pos = {
      x: gestureState.moveX - this.touchOffset.x,
      y: gestureState.moveY - this.touchOffset.y,
    };
    const {layout} = this.state;
    const {baballeSize} = this.props;
    pos.x = Math.min(pos.x, layout.x + layout.width - baballeSize);
    pos.x = Math.max(pos.x, layout.x);
    pos.y = Math.min(pos.y, layout.y + layout.height - baballeSize);
    pos.y = Math.max(pos.y, layout.y);
    this.animatedBaballePose.setValue(pos);
  }

  baballeOnPanResponderRelease(e, gestureState) {
    Animated.decay(
      this.animatedBaballePose, {
        velocity: {x: gestureState.vx, y: gestureState.vy},
        deceleration: this.props.deceleration,
      }
    ).start();
    Animated.decay(
      this.animatedBaballeTravel, {
        velocity: Math.sqrt(Math.pow(gestureState.vx, 2)
                            + Math.pow(gestureState.vy, 2)),
        deceleration: 0.997,
      }
    ).start();
  }

  navOnPanResponderRelease(e, gestureState) {
    if (gestureState.dx > this.state.layout.width / 3) {
      this.props.navigation.navigate(this.props.leftScreen);
    } else if (gestureState.dx < -this.state.layout.width / 3) {
      this.props.navigation.navigate(this.props.rightScreen);
    }
  }

  animateSpringScale() {
    this.animatedBaballeScale.setValue(1.0);
    Animated.spring(
      this.animatedBaballeScale, {
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
    const initWidth = (layout.width - this.props.baballeSize) / 2;
    const initHeight = (layout.height - this.props.baballeSize) / 2;
    this.animatedBaballePose.x.setValue(initWidth);
    this.animatedBaballePose.y.setValue(initHeight);
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
      extrapolate: 'clamp',
    });
    const wrappedAnimatedPoseY = this.animatedBaballePose.y.interpolate({
      ...this.makeWrappingRange(limitY, 100),
      extrapolate: 'clamp',
    });
    return (
      <View style={this.styles.container}
            onLayout={this.handleOnLayout.bind(this)}
            {...this.panResponderNav.panHandlers}
      >
        <Animated.View style={[this.styles.baballe, {
                         transform: [{scale: this.animatedBaballeScale}],
                         top: wrappedAnimatedPoseY,
                         left: wrappedAnimatedPoseX,
                         backgroundColor: this.animatedBaballeColor,
                       }]}
                       {...this.panResponderBaballe.panHandlers}
        />
      </View>
    );
  }
}
