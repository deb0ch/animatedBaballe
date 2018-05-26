
import React, { Component }         from 'react';
import { Animated,
         Easing,
         PanResponder,
         StyleSheet,
         View }                     from 'react-native';
import { createNavigationContainer,
         createNavigator,
         SceneView,
         TabRouter }                from 'react-navigation'


export default createCardSwipeNavigator;


function createCardSwipeNavigator(routeConfigMap, config = {}) {
    const router = TabRouter(routeConfigMap, config);
    const Navigator = createNavigator(CardSwipeNavView, router, config);
    return createNavigationContainer(Navigator);
};


class CardSwipeNavView extends Component {
    constructor(props) {
        super(props);
        this.scrollX = new Animated.Value(0);
        this.state = {layout: null};
    }

    componentWillMount() {
        this.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onStartShouldSetPanResponderCapture: () => false,
            onMoveShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponderCapture: () => false,
            onPanResponderTerminationRequest: () => true,
            onShouldBlockNativeResponder: () => true,
            onPanResponderGrant: () => {},
            onPanResponderMove: Animated.event([null, {dx: this.scrollX}]),
            onPanResponderRelease: this.onPanResponderRelease.bind(this),
            onPanResponderTerminate: () => {},
        });
    }

    swipe(direction) {
        const { navigation } = this.props;
        const { index, routes } = navigation.state;
        switch (direction) {
        case 'left':
            Animated.timing(
                this.scrollX, {
                    toValue: this.state.layout.width,
                    duration: 300,
                }
            ).start(() => {
                navigation.navigate(routes[index - 1].routeName);
                this.scrollX.setValue(0);
            });
            break;
        case 'right':
            Animated.timing(
                this.scrollX, {
                    toValue: -this.state.layout.width,
                    duration: 300,
                }
            ).start(() => {
                navigation.navigate(routes[index + 1].routeName);
                this.scrollX.setValue(0);
            });
            break;
        }
    }

    onPanResponderRelease(e, gestureState) {
        const { dx, vx } = gestureState;
        const { navigation } = this.props;
        const { index, routes } = navigation.state;
        const canSwipeLeft = (index > 0
                              && dx > this.state.layout.width / 4
                              && vx > 1);
        const canSwipeRight = (index < routes.length - 1
                               && dx < -this.state.layout.width / 4
                               && vx < -1);
        if (canSwipeLeft) {
            this.swipe('left');
        } else if (canSwipeRight) {
            this.swipe('right');
        } else {
            Animated.spring(this.scrollX, {toValue: 0}).start()
        }
    }

    getSwipingStyles(index, focusedIndex) {
        const { width, pageX } = this.state.layout;
        const initialPosX = (index - focusedIndex) * width;
        // Must isolate 0 as a special case so that scenes receive layout as if
        // they were occupying the whole screen, particularly from measure().
        const translateX = this.scrollX.interpolate({
            inputRange: [
                -width,
                -Number.EPSILON,
                0,
                Number.EPSILON,
                width
            ],
            outputRange: [
                initialPosX - width,
                initialPosX,
                0,
                initialPosX,
                initialPosX + width
            ],
        });
        const opacity = translateX.interpolate({
            inputRange: [-width, 0, width],
            outputRange: [0.8, 1, 0.8],
        });
        const scale = translateX.interpolate({
            inputRange: [-width, 0, width],
            outputRange: [0.9, 1, 0.9],
        })
        return {opacity, transform: [{translateX}, {scale}]};
    }

    renderScene(route, index) {
        const { descriptors, navigation, screenProps } = this.props;
        const descriptor = descriptors[route.key];
        const SceneComponent = descriptor.getComponent();
        const focusedIndex = navigation.state.index;
        const isFocused = focusedIndex === index;
        const panHandlers = isFocused ? this.panResponder.panHandlers : {};
        return (
            <Animated.View
                key={route.key}
                style={[StyleSheet.absoluteFill, {
                    margin: 20,
                    borderRadius: 15,
                    overflow: 'hidden',
                    zIndex: isFocused ? 0 : Number.MIN_SAFE_INTEGER,
                    ...this.getSwipingStyles(index, focusedIndex),
                }]}
                {...panHandlers}
            >
                <SceneView component={SceneComponent}
                           navigation={descriptor.navigation}
                           screenProps={screenProps}
                />
            </Animated.View>
        );
    }

    handleOnLayout(e) {
        this.setState({layout: e.nativeEvent.layout});
    }

    render() {
        const { descriptors, navigation, screenProps } = this.props;
        return (
            <View onLayout={this.handleOnLayout.bind(this)}
                  style={StyleSheet.absoluteFill}
                  ref={this.container}
            >
                {this.state.layout
                 && navigation.state.routes.map(this.renderScene.bind(this))}
            </View>
        );
    };
}
