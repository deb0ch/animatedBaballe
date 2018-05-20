
'use strict';

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


function vector2DNorm(x, y) {
  return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
}


export default class Baballe extends Component {
  static propTypes = {
    bgColor: PropTypes.string.isRequired,
    baballeColor1: PropTypes.string.isRequired,
    baballeColor2: PropTypes.string.isRequired,
    baballeSize: PropTypes.number.isRequired,
    deceleration: PropTypes.number,
  };

  static defaultProps = {
    deceleration: 0.998,
  }

  constructor(props) {
    super(props);
    this.animatedBaballePose = new Animated.ValueXY({x: 0, y: 0});
    this.animatedBaballeScale = new Animated.Value(1);
    this.animatedBaballeSpeed = new Animated.Value(0);
    this.animatedBaballeColor = this.animatedBaballeSpeed.interpolate({
      inputRange: [0, 4],
      outputRange: [this.props.baballeColor1, this.props.baballeColor2],
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
    this.container = React.createRef();
    this.state = { layout: null };
  }

  componentWillMount () {
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (e, gestureState) => false,
      onStartShouldSetPanResponderCapture: (e, gestureState) => true,
      onMoveShouldSetPanResponder: (e, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (e, gestureState) => true,
      onPanResponderTerminationRequest: (e, gestureState) => false,
      onShouldBlockNativeResponder: (e, gestureState) => true,
      onPanResponderGrant: this.onPanResponderGrant.bind(this),
      onPanResponderMove: this.onPanResponderMove.bind(this),
      onPanResponderRelease: this.onPanResponderRelease.bind(this),
      onPanResponderTerminate: (e, gestureState) => {},
    });
  }

  onPanResponderGrant(e, gestureState) {
    this.touchOffset.x = e.nativeEvent.locationX + this.state.layout.pageX;
    this.touchOffset.y = e.nativeEvent.locationY + this.state.layout.pageY;
    this.animatedBaballeScale.setValue(1.0);
    Animated.spring(
      this.animatedBaballeScale, {
        toValue: 1.0,
        friction: 1.5,
        velocity: -1,
      },
    ).start();
  }

  onPanResponderMove(e, gestureState) {
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
    this.animatedBaballeSpeed.setValue(
      vector2DNorm(gestureState.vx, gestureState.vy)
    );
  }

  onPanResponderRelease(e, gestureState) {
    Animated.decay(
      this.animatedBaballePose, {
        velocity: {x: gestureState.vx, y: gestureState.vy},
        deceleration: this.props.deceleration,
      }
    ).start();
    const velocity = vector2DNorm(gestureState.vx, gestureState.vy);
    Animated.timing(
      this.animatedBaballeSpeed, {
        toValue: 0,
        duration: -Math.log(0.1 / velocity) / (1 - this.props.deceleration),
        easing: Easing.linear,
      }
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

  initBaballe(layout) {
    const initX = (layout.width - this.props.baballeSize) / 2;
    const initY = (layout.height - this.props.baballeSize) / 2;
    this.animatedBaballePose.x.setValue(initX);
    this.animatedBaballePose.y.setValue(initY);
    this.baballeInitialized = true;
  }

  handleOnLayout(e) {
    this.container.current.measure((x, y, width, height, pageX, pageY) => {
      const layout = {x, y, width, height, pageX, pageY};
      if (!this.state.baballeInitialized)
        this.initBaballe(layout);
      this.setState({layout});
    });
  }

  render() {
    if (!this.state.layout
        || this.state.layout.width === 0
        || this.state.layout.height === 0) {
      return (
        <View style={this.styles.container}
              onLayout={this.handleOnLayout.bind(this)}
              ref={this.container}
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
            ref={this.container}
      >
        <Animated.View style={[this.styles.baballe, {
                         transform: [{scale: this.animatedBaballeScale}],
                         top: wrappedAnimatedPoseY,
                         left: wrappedAnimatedPoseX,
                         backgroundColor: this.animatedBaballeColor,
                       }]}
                       {...this.panResponder.panHandlers}
        />
      </View>
    );
  }
}
