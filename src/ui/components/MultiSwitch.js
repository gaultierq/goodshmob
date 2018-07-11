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
import {Colors} from "../colors"
import type {NavigableProps, SearchToken} from "../../types"

type Props = NavigableProps & {
    onPositionChange?: (position: number) => void,
    options: [{type: string, label: string}]
};

export default class MultiSwitch extends Component<Props> {

    constructor(props) {
        super(props);
        this.state = {
            isComponentReady: false,
            position: new Animated.Value(0),
            switcherWidth: switcherWidth,
        };
    }


    setPosition(position) {
        this.props.onPositionChange && this.props.onPositionChange(position)
        Animated.timing(this.state.position, {
            toValue: this.state.switcherWidth * position,
            duration: 300
        }).start();
    }

    render() {
        return (
            <View style={styles.container}>
                {this.props.options.map((option, index) => {
                        return <TouchableOpacity key={index}
                                                 style={styles.buttonStyle}
                                                 onPress={() => this.setPosition(index)}>
                            <Text>{option.label}</Text>
                        </TouchableOpacity>
                    }
                )}

                <Animated.View
                    pointerEvents="none"
                    style={[
                        styles.switcher,
                        {transform: [{translateX: this.state.position}]}
                    ]}/>
            </View>
        );
    }
}


const screenWidth = Dimensions.get('window').width;
const height = 25
const marginHorizontal = 10
const width = screenWidth - 2 * marginHorizontal
const switcherWidth = width / 3

const styles = {
    container: {
        width: width,
        height: height,
        marginTop: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 27.5,
        marginHorizontal: marginHorizontal
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
        width: switcherWidth,
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
