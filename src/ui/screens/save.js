// @flow
import React, {Component} from 'react'
import {StyleSheet, Text, TextInput, View} from 'react-native'
import type {Activity, Save} from "../../types"
import ItemBody from "../activity/components/ItemBody"
import {CheckBox} from "react-native-elements"
import {Colors} from "../colors"


export type Description = string;
export type Visibility = 0 | 1;

type Props = {
    activity: Activity,
    onDescription: (Description, Visibility) => void,
    containerStyle: any
};

type State = {
    description: Description,
    visibility: Visibility,
};

export default class SaveScreen extends Component<Props, State> {


    state = {description: "", visibility: 0};

    render() {
        const {activity, onDescription, containerStyle} = this.props;
        const {description, visibility} = this.state;

        let grey = Colors.greyishBrown;
        const item = activity.resource
        return (
            <View style={[styles.container, containerStyle]}>
                <ItemBody itemType={item} itemId={item.id} noGoodshButton />

                <CheckBox
                    right
                    title={i18n.t("create_list_controller.visible")}
                    iconRight
                    size={16}
                    checkedColor={grey}
                    uncheckedColor={grey}
                    onPress={(newValue)=> this.setState({visibility: visibility === 1 ? 0 : 1})}
                    checked={!visibility}
                    style={{backgroundColor: 'transparent'}}
                    textStyle={{color: grey, fontSize: 12, }}
                />

                <TextInput
                    onSubmitEditing={() => {this.state.description && onDescription(description, visibility)}}
                    value={this.state.description}
                    onChangeText={(description) => this.setState({description})}
                    placeholder={i18n.t("create_list_controller.add_description")}
                    autoFocus
                    style={styles.input}
                    returnKeyType={'done'}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 20,
        backgroundColor: 'transparent'
    },
    input: {
        marginTop: 20,
        fontSize: 16,
        borderColor: Colors.greyishBrown,
        borderWidth: 0.5,
        padding: 5,
        minHeight: 100
    }
});
