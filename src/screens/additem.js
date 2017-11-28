// @flow
import React, {Component} from 'react';
import {StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView} from 'react-native';
import {CheckBox, SearchBar} from "react-native-elements";
import * as UI from "./UIStyles";

import LineupCell from "./components/LineupCell";
import Button from 'apsl-react-native-button'
import type {Id, Item, ItemType, List} from "../types";
import {saveItem} from "./actions";
import * as Nav from "./Nav";
import {currentUserId} from "../CurrentUser";
import Snackbar from "react-native-snackbar"
import {connect} from "react-redux";
import {buildNonNullData} from "../utils/DataUtils";
import ItemCell from "./components/ItemCell";
import {renderSimpleButton} from "./UIStyles";
import {renderSimpleLink} from "./UIStyles";

type Props = {
    defaultLineupId: Id,
    itemId: Id,
    itemType: ItemType,
    item?: Item,
    onAdded: () => void,
    navigator: *,
    data: *
};

export type Description = string;
export type Visibility = 0 | 1;

type State = {
    description?: Description,
    visibility?: Visibility,
    lineupId: Id,
    reqAdd?: number
};

@connect((state, ownProps) => ({
    data: state.data,
}))
export default class AddItemScreen extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            lineupId: props.defaultLineupId,
            visibility: 0
        };
    }

    render() {

        let lineup = buildNonNullData(this.props.data, "lists", this.state.lineupId);
        let item = this.props.item || buildNonNullData(this.props.data, this.props.itemType, this.props.itemId);

        const {description, visibility} = this.state;

        let grey = UI.Colors.grey1;
        let req = this.state.reqAdd;
        let editable = req !== 1;
        return (
            <ScrollView>

                <View style={[styles.container]}>

                    <ItemCell item={item}/>


                    <View style={{flexDirection: "row", justifyContent: 'space-between', margin: 6}}>
                        <Text>Dans:</Text>
                        {renderSimpleLink("Changer", this.changeLineup.bind(this), {disabled: !editable})}

                    </View>
                    <LineupCell lineup={lineup} style={{backgroundColor: "transparent"}} />

                    <TextInput
                        editable={editable}
                        style={[styles.input, (editable ? {color: "black"} : {color: "grey"})]}
                        onSubmitEditing={this.doAdd.bind(this)}
                        value={description}
                        onChangeText={description => this.setState({description})}
                        placeholder={/*i18n.t("create_list_controller.placeholder")*/"Ajouter une description"}
                    />

                    <CheckBox
                        right
                        title='Visible par mes amis'
                        iconRight
                        size={16}
                        checkedColor={grey}
                        uncheckedColor={grey}
                        onPress={(newValue)=> this.setState({visibility: visibility === 1 ? 0 : 1})}
                        checked={!visibility}
                        style={{backgroundColor: 'transparent'}}
                        textStyle={{color: grey, fontSize: 12, }}
                        containerStyle={{ backgroundColor: "transparent", borderWidth: 0, width: "100%"}}
                    />


                    <View style={{height:100, flexDirection: 'row', width: "100%"}}>
                        {
                            renderSimpleButton(
                                "Ajouter",
                                this.doAdd.bind(this), {
                                    disabled: req === 2,
                                    loading: req === 1,
                                    style:{position: "absolute", right: 0}
                                })}
                    </View>

                </View>
            </ScrollView>
        );
    }

    doAdd() {
        if (this.state.reqAdd === 1) return;
        this.setState({reqAdd: 1});

        let itemId = this.props.itemId;
        let {lineupId, description, visibility} = this.state;

        this.props
            .dispatch(saveItem(itemId, lineupId, visibility, description))
            .then(() => {
                Snackbar.show({
                    title: i18n.t('shared.goodsh_saved'),
                });
                this.setState({reqAdd: 2});

                this.props.onAdded();

            }, (err)=> this.setState({reqAdd: 3}));
    }

    changeLineup() {
        this.props.navigator.showModal({
            screen: 'goodsh.AddInScreen', // unique ID registered with Navigation.registerScreen
            title: "Ajouter à une liste",
            //animationType: 'none',
            navigatorButtons: {
                leftButtons: [
                    {
                        id: Nav.CANCEL,
                        title: "Cancel"
                    }
                ],
            },
            passProps: {
                userId: currentUserId(),
                renderItem: (lineup) => {
                    return (<TouchableOpacity onPress={() => {
                        this.setState({lineupId: lineup.id});
                        this.props.navigator.dismissModal();
                    }}>
                        <LineupCell lineup={lineup} />
                    </TouchableOpacity>)
                },
                onCancel: ()=>this.props.navigator.dismissModal()
            },
        });
    }
}

const styles = StyleSheet.create({
    container: {
        // flex: 1,
        padding: 12
    },
    searchContainer: {
        backgroundColor: 'transparent',
    },
    input: {
        marginTop: 20,
        fontSize: 16,
        borderColor: UI.Colors.grey1,
        borderWidth: 0.5,
    }
});