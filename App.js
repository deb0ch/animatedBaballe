
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
const baballeFriction = 0.1
const baballeMass = 10


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

  getBaballeTravelTime(v0)
  {
    return baballeMass * ((Math.abs(v0) + Math.sqrt(Math.pow(v0, 2) + 1))
                          / baballeFriction);
  }

  getBaballeTravelDistance(v0)
  {
    const sign = v0 > 0 ? 1 : -1;
    return sign * (Math.pow(v0, 2) * baballeMass / (2 * baballeFriction));
  }

  animateThrow(currentY, speedY) {
    console.log(" ---------------------------- ");
    console.log("v0 = ", speedY);
    console.log("dist = ", this.getBaballeTravelDistance(speedY));
    console.log("time = ", this.getBaballeTravelTime(speedY));
    console.log("dist / time = ", (this.getBaballeTravelDistance(speedY)
                                   / this.getBaballeTravelTime(speedY)));
    console.log(" ---------------------------- ");
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

  render() {
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.baballe, {
                         transform: [{scale: this.animatedBaballeOnTouch}],
                         top: this.animatedBaballePoseY,
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
