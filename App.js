
import React, { Component }    from 'react';
import { Animated,
         Dimensions,
         Easing,
         StyleSheet,
         Text,
         TouchableOpacity,
         View } from 'react-native';


export default class App extends Component {
  constructor () {
    super();
    this.animatedBaballe = new Animated.Value(0);
  }

  animate () {
    this.animatedBaballe.setValue(0);
    const heightAnimation = Animated.timing(
      this.animatedBaballe,
      {
        toValue: 1,
        duration: 5000,
        easing: Easing.bounce,
      },
    );
    Animated.loop(heightAnimation).start();
  }

  render() {
    const animatedMargin = this.animatedBaballe.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, Dimensions.get('window').height, 0]
    });
    const animatedColor = this.animatedBaballe.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: ["#123", "#f109bc", "#123"]
    });
    const animatedScale = this.animatedBaballe.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 2, 1]
    });
    const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
    return (
      <View style={styles.container}>
        <AnimatedTouchableOpacity onPress={this.animate.bind(this)}
                                  style={[styles.baballe, {
                                    backgroundColor: animatedColor,
                                    marginBottom: animatedMargin,
                                    transform: [{scale: animatedScale}],
                                  }]}
        >
        </AnimatedTouchableOpacity>
      </View>
    );
  }
}


const baballeSize = 44;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'flex-end',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  baballe: {
    marginLeft: (Dimensions.get('window').width - baballeSize) / 2,
    marginRight: (Dimensions.get('window').width - baballeSize) / 2,
    width: baballeSize,
    height: baballeSize,
    borderRadius: baballeSize / 2,
  }
});
