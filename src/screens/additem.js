// @flow
import React, {Component} from 'react';
import {StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {CheckBox, SearchBar} from "react-native-elements";
import * as UI from "./UIStyles";
import i18n from '../i18n/i18n'
import LineupCell from "./components/LineupCell";
import Button from 'apsl-react-native-button'
import type {Id, Item, List} from "../types";
import {saveItem} from "./actions";
import * as Nav from "./Nav";
import {currentUserId} from "../CurrentUser";
import Snackbar from "react-native-snackbar"
import {connect} from "react-redux";
import {buildNonNullData} from "../utils/DataUtils";

type Props = {
    defaultLineupId: Id,
    item: Item,
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
        const {description, visibility} = this.state;

        let grey = UI.Colors.grey1;
        let req = this.state.reqAdd;
        let editable = req !== 1;
        return (
            <View style={[styles.container]}>


                <TouchableOpacity onPress={this.pickLineup.bind(this)}>
                    <Text>Ajouter à:</Text>
                    <LineupCell lineup={lineup} />
                </TouchableOpacity>


                <TextInput
                    autoFocus
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
                    checked={visibility===0}
                    style={{backgroundColor: 'transparent'}}
                    textStyle={{color: grey, fontSize: 12, }}
                    containerStyle={{ backgroundColor: "transparent", borderWidth: 0, width: "100%"}}
                />


                <View style={{flexDirection: 'row', width: "100%"}}>
                    <Button
                        isLoading={req === 1}
                        isDisabled={req === 2}
                        onPress={this.doAdd.bind(this)}
                        style={[{position: "absolute", right: 0}]}>
                        <Text>Ajouter</Text>
                    </Button>
                </View>

            </View>
        );
    }

    doAdd() {
        if (this.state.reqAdd === 1) return;
        this.setState({reqAdd: 1});

        let item = this.props.item;
        let {lineupId, description, visibility} = this.state;

        this.props
            .dispatch(saveItem(item.id, lineupId, visibility, description))
            .then(() => {
                Snackbar.show({
                    title: i18n.t('shared.goodsh_saved'),
                });
                this.setState({reqAdd: 2});
                this.props.navigator.popToRoot();
            }, (err)=> this.setState({reqAdd: 3}));
    }

    pickLineup() {
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
                // onLineupPressed: (lineup: List) => {
                //     this.setState({lineupId: lineup.id});
                //     this.props.navigator.dismissModal();
                // },
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
        flex: 1,
    },
    searchContainer: {
        backgroundColor: 'transparent',
    },
    searchInput: {
        backgroundColor: 'white',
        borderWidth: 0.5,
        borderColor: UI.Colors.grey1
    },
    input: {
        marginTop: 20,
        fontSize: 16,
        borderColor: UI.Colors.grey1,
        borderWidth: 0.5,
        padding: 5,
        minHeight: 100
    }
});