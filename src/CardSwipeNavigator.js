
import React, { Component }         from 'react';
import { Animated,
         Dimensions,
         Easing,
         Image,
         PanResponder,
         StyleSheet,
         View }                     from 'react-native';
import { createNavigationContainer,
         createNavigator,
         SceneView,
         TabRouter }                from 'react-navigation'


export default createCardSwipeNavigator;


const bgImage = require("../assets/892.jpg");


function createCardSwipeNavigator(routeConfigMap, config = {}) {
    const router = TabRouter(routeConfigMap, config);
    const Navigator = createNavigator(CardSwipeNavView, router, config);
    return createNavigationContainer(Navigator);
};


class CardSwipeScenes extends Component {
    static propTypes = {
        // TODO
    }

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
            onPanResponderMove: (e, gestureState) => {
                this.props.translateBg.setValue(gestureState.dx);
                this.scrollX.setValue(gestureState.dx);
            },
            onPanResponderRelease: this.onPanResponderRelease.bind(this),
            onPanResponderTerminate: () => {},
        });
    }

    swipe(direction) {
        const { navigation } = this.props;
        const { index, routes } = navigation.state;
        const { width } = this.state.layout;
        const animateSwipe = (screenCount) => {
            Animated.timing(
                this.scrollX, {
                    toValue: width * -screenCount,
                    duration: 300,
                }
            ).start(() => {
                navigation.navigate(routes[index + screenCount].routeName);
                this.scrollX.setValue(0);
            });
            Animated.timing(
                this.props.translateBg, {
                    toValue: width * -screenCount,
                    duration: 300,
                }
            ).start(() =>
                    this.props.translateBg.stopAnimation((finalValue) => {
                        this.props.translateBg.setOffset(finalValue);
                        this.props.translateBg.setValue(0);
                    }));
        }
        switch (direction) {
        case 'left':
            animateSwipe(-1);
            break;
        case 'right':
            animateSwipe(1);
            break;
        default:
            Animated.spring(this.scrollX, {toValue: 0}).start();
            Animated.spring(this.props.translateBg, {toValue: 0}).start();
        }
    }

    onPanResponderRelease(e, gestureState) {
        const { dx, vx } = gestureState;
        const { navigation } = this.props;
        const { index, routes } = navigation.state;
        const canSwipeLeft = (index > 0
                              && dx > this.state.layout.width / 4
                              && vx > 0.5);
        const canSwipeRight = (index < routes.length - 1
                               && dx < -this.state.layout.width / 4
                               && vx < -0.5);
        if (canSwipeLeft) {
            this.swipe('left');
        } else if (canSwipeRight) {
            this.swipe('right');
        } else {
            this.swipe('');
        }
    }

    getSwipingTransform(index, focusedIndex) {
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
        const scale = this.scrollX.interpolate({
            inputRange: [-width, -width / 2, 0, width / 2, width],
            outputRange: [1, 0.9, 1, 0.9, 1],
        })
        return {transform: [{translateX}, {scale}]};
    }

    renderScene(route, index) {
        const { descriptors, navigation, screenProps } = this.props;
        const descriptor = descriptors[route.key];
        const SceneComponent = descriptor.getComponent();
        const focusedIndex = navigation.state.index;
        const isFocused = focusedIndex === index;
        const panHandlers = isFocused ? this.panResponder.panHandlers : {};
        const {width} = this.state.layout;
        const opacity = this.scrollX.interpolate({
            inputRange: [-width, -width / 2, 0, width / 2, width],
            outputRange: [0, 0.2, 0, 0.2, 0],
        });
        return (
            <Animated.View
                key={route.key}
                style={[StyleSheet.absoluteFill, {
                    margin: 20,
                    borderRadius: 15,
                    overflow: 'hidden',
                    zIndex: isFocused ? 0 : -1000000,
                    ...this.getSwipingTransform(index, focusedIndex),
                }]}
                {...panHandlers}
            >
                <SceneView component={SceneComponent}
                           navigation={descriptor.navigation}
                           screenProps={screenProps}
                />
                <Animated.View style={[StyleSheet.absoluteFill, {
                                   opacity,
                                   backgroundColor: '#FFFFFF',
                               }]}
                               pointerEvents={'none'}
                />
            </Animated.View>
        );
    }

    handleOnLayout(e) {
        this.setState({layout: e.nativeEvent.layout});
    }

    render() {
        if (!this.state.layout)
            return (
                <View onLayout={this.handleOnLayout.bind(this)}
                      style={StyleSheet.absoluteFill}
                />
            );
        const { descriptors, navigation, screenProps } = this.props;
        return (
            <View onLayout={this.handleOnLayout.bind(this)}
                  style={StyleSheet.absoluteFill}
                  ref={this.container}
            >
                {navigation.state.routes.map(this.renderScene.bind(this))}
            </View>
        );
    };
}


class BackgroundWrapper extends Component {
    constructor(props) {
        super(props);
    }

    shouldComponentUpdate() {
        return false;
    }

    render() {
        const width = Dimensions.get('screen').width;
        const translateX = this.props.translateBg.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1/5],
        });
        return (
            <Animated.Image
                source={bgImage}
                resizeMode={"repeat"}
                style={{
                    width: width * this.props.scenesCount,
                    height: '100%',
                    left: -width/2,
                    zIndex: -1000000000,
                    transform: [
                        { translateX },
                        { scale: 1.05 },
                    ],
                }}
            />
         );
    }
}


class CardSwipeNavView extends Component {
    constructor(props) {
        super(props);
        this.translateBg = new Animated.Value(0);
    }

    render() {
        const { routes } = this.props.navigation.state;
        return (
            <View>
                <BackgroundWrapper translateBg={this.translateBg}
                                   scenesCount={routes.length}
                                   {...this.props}
                />
                <CardSwipeScenes translateBg={this.translateBg}
                                 {...this.props}
                />
            </View>
        );
    }
}
