// @flow
import React from 'react';
import type {Node} from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';

type Props = {
    children: Node
};

type State = {
};

export default class Sheet extends React.Component<Props, State> {

    animatedValue = new Animated.Value(0);

    constructor(props: Props) {
        super(props);
        let h = _.get(props, 'children.props.style.height');
        if (!_.isNumber(h)) throw "Sheet need its direct children to have a fixed height";
    }

    componentDidMount () {
        this.animate(1, 0);
    }

    animate (start: number, end: number, callback:? ()=>void) {
        this.animatedValue.setValue(start);
        Animated.timing(
            this.animatedValue,
            {
                toValue: end,
                duration: 400,
                easing: Easing.ease
            }
        ).start(callback)
    }

    render() {
        const translateY = this.animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 270]
        });
        const backgroundColor = this.animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0)']
        });

        return (

            <TouchableWithoutFeedback
                onPress={()=>this.close()}
            >
                <Animated.View style={[styles.container, {backgroundColor}]}>
                    <Animated.View style={[styles.content, {transform: [{translateY}]}]}>
                        {this.props.children}
                    </Animated.View>
                </Animated.View>
            </TouchableWithoutFeedback>
        );
    }

    close() {
        this.animate(0, 1, ()=>this.props.navigator.dismissModal({animationType: 'none'}));
    }
}

const styles = StyleSheet.create({
    container: {
        flex:1,
        width: "100%",
        height: "100%",
        justifyContent: 'flex-end',
    },
    content: {
        width: "100%",
        // backgroundColor: "white",
    }
});
