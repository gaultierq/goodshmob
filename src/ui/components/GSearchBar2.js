//@flow
import type {Node} from 'react'
import React, {Component} from 'react'
import {StyleSheet, Text, TextInput, View,} from 'react-native'
import GTouchable from "../GTouchable"
import {Colors} from "../colors"
import Octicons from "react-native-vector-icons/Octicons"

type State = {
    value: string
};

export type Props = {
    value?: ?string,
    onCancel?: () => void,
    cancelTitle?: string,
    inputStyle?: any,
    onChangeText: string => void,
    ref?: any => string

};

// Important: padding must be handled in the SearchBar component, otherwise the animation is ugly
export default class GSearchBar2 extends Component<Props, State> {

    inputNode: Node

    constructor(props: Props) {
        super(props)
        this.state = {
            value: props.value || ''
        }
    }

    render() {

        const color1 = _.isEmpty(this.state.value) ? 'rgb(142,142,147)' : 'black'
        return (
            <View style={{flexDirection: 'row'}}>

                <View style={[{flexDirection: 'row', flex:1}, styles.inputContainer]}>
                    <Octicons name="search" size={16} color={color1} style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        alignSelf: 'center',
                        paddingRight: 6,
                        // backgroundColor: 'red'
                    }}/>
                    <View style={[{flex:1, justifyContent: 'center',}]}>
                        <TextInput
                            placeholderTextColor={color1}
                            {...this.props}
                            value={this.state.value}
                            onChangeText={this.onChangeText.bind(this)}
                            style={[styles.input, {
                                // backgroundColor: 'green',
                            }]}
                            ref={ref => {
                                this.inputNode = ref
                                if (this.props.ref) this.props.ref(ref)
                            }}
                        />
                    </View>
                </View>
                {
                    this.displayCancelButton() && (
                        <GTouchable
                            style={{alignItems: 'center', justifyContent: 'center'}}
                            onPress={() => {
                                this.inputNode && this.inputNode.clear()
                                this.inputNode && this.inputNode.blur()
                                this.onChangeText('')
                                this.props.onCancel && this.props.onCancel()
                            }}>
                            <Text style={{
                                fontSize: 15,
                                color: Colors.brownishGrey,
                                paddingLeft: 6,
                            }}>{this.props.cancelTitle}</Text>
                        </GTouchable>)
                }

                )
            </View>
        )
    }

    displayCancelButton() {
        return !!this.state.value || this.inputNode && this.inputNode.isFocused()
    }

    onChangeText = async (value : string) => {
        await this.setState({ value });
        this.props.onChangeText &&
        (await this.props.onChangeText(this.state.value));
    };
}


const styles = StyleSheet.create({
    input: {
        fontSize: 17,
        // lineHeight: 22,
        // backgroundColor: 'green',


    },
    inputContainer: {
        height: 36,
        paddingHorizontal: 14,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: 'rgba(142,142,142,0.12)',
        // alignItems: 'center',

    },
});
