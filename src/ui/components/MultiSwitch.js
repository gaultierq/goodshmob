import React, { Component } from 'react';
import {
    Animated,
    Dimensions,
    PanResponder,
    View,
    Platform,
    Text,
    TouchableOpacity,
} from 'react-native';
const { width } = Dimensions.get('window');
import {Colors} from "../colors"

export default class MultiSwitch extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isComponentReady: false,
            position: new Animated.Value(0),
            posValue: 0,
            selectedPosition: 0,
            duration: 100,
            mainWidth: width - 30,
            switcherWidth: width / 3,
            thresholdDistance: width - 8 - width / 2.4
        };
        this.isParentScrollDisabled = false;
    }

    componentWillMount() {

    }

    notStartedSelected = () => {
        Animated.timing(this.state.position, {
            toValue: Platform.OS === 'ios' ? -2 : 0,
            duration: this.state.duration
        }).start();
        setTimeout(() => {
            this.setState({
                posValue: Platform.OS === 'ios' ? -2 : 0,
                selectedPosition: 0
            });
        }, 100);
        if (this.state.isComponentReady) this.props.onStatusChanged('Open');
    };

    inProgressSelected = () => {
        Animated.timing(this.state.position, {
            toValue: this.state.mainWidth / 2 - this.state.switcherWidth / 2,
            duration: this.state.duration
        }).start();
        setTimeout(() => {
            this.setState({
                posValue:
                this.state.mainWidth / 2 - this.state.switcherWidth / 2,
                selectedPosition: 1
            });
        }, 100);
        if (this.state.isComponentReady)
            this.props.onStatusChanged('In Progress');
    };

    completeSelected = () => {
        Animated.timing(this.state.position, {
            toValue:
                Platform.OS === 'ios'
                    ? this.state.mainWidth - this.state.switcherWidth
                    : this.state.mainWidth - this.state.switcherWidth - 2,
            duration: this.state.duration
        }).start();
        setTimeout(() => {
            this.setState({
                posValue:
                    Platform.OS === 'ios'
                        ? this.state.mainWidth - this.state.switcherWidth
                        : this.state.mainWidth - this.state.switcherWidth - 2,
                selectedPosition: 2
            });
        }, 100);
        if (this.state.isComponentReady) this.props.onStatusChanged('Complete');
    };

    getStatus = () => {
        switch (this.state.selectedPosition) {
            case 0:
                return 'Open';
            case 1:
                return 'In Progress';
            case 2:
                return 'Complete';
        }
    };

    setPosition(position) {
        console.log('setposition', this.state.switcherWidth * position)
        Animated.timing(this.state.position, {
            toValue: this.state.switcherWidth * position,
            duration: 300
        }).start();
    }
    render() {
        return (
            <View style={styles.container}>

                <TouchableOpacity style={styles.buttonStyle} onPress={() => this.setPosition(0)}>
                    <Text>Moi</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonStyle} onPress={() => this.setPosition(1)}>
                    <Text>Mes amis</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonStyle} onPress={() => this.setPosition(2)}>
                    <Text>Tout le monde</Text>
                </TouchableOpacity>

                <Animated.View
                    pointerEvents="none"
                    style={[
                        styles.switcher,
                        {
                            transform: [{ translateX: this.state.position }]
                        }
                    ]}
                >
                </Animated.View>
            </View>
        );
    }
}


const height = 25
const styles = {

    container: {
        width: width,
        height: height,
        marginTop: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 27.5
    },

    switcher: {
        flexDirection: 'row',
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: Colors.green,
        borderRadius: 28,
        zIndex: -10,
        height: height,
        alignItems: 'center',
        justifyContent: 'center',
        width: width / 3,
        shadowOpacity: 0.31,
        shadowRadius: 3,
        shadowColor: Colors.grey4
    },
    buttonStyle: {
        flex: 1,
        zIndex: 2,
        width: width/3,
        height: height,
        justifyContent: 'center',
        alignItems: 'center'
    }
}
