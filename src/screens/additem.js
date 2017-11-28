// @flow
import React, {Component} from 'react';
import {ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator} from 'react-native';
import {CheckBox, SearchBar} from "react-native-elements";
import * as UI from "./UIStyles";

import LineupCell from "./components/LineupCell";
import type {Id, Item, ItemType} from "../types";
import {FETCH_ITEM, fetchItemCall, saveItem} from "./actions";
import {currentUserId} from "../CurrentUser";
import Snackbar from "react-native-snackbar"
import {connect} from "react-redux";
import {buildData} from "../utils/DataUtils";
import ItemCell from "./components/ItemCell";
import Screen from "./components/Screen";
import {safeDispatchAction} from "./../utils/Api";
import {LineupListScreen} from "./lineuplist";
import AddLineupComponent from "./components/addlineup";

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
    reqAdd?: number,
    reqFetch?: number,
    selectedLineup?: Id
};


@connect((state, ownProps) => ({
    data: state.data,
}))
export default class AddItemScreen extends Screen<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            lineupId: props.defaultLineupId,
            visibility: 0
        };
    }

    getItem() {
        return this.props.item || buildData(this.props.data, this.props.itemType, this.props.itemId)
    }

    componentWillAppear() {
        if (!this.getItem()) {
            safeDispatchAction.call(
                this,
                this.props.dispatch,
                fetchItemCall(this.props.itemId).include('*').disptachForAction2(FETCH_ITEM),
                'reqFetch'
            );
        }
    }


    render() {

        // let lineup = buildNonNullData(this.props.data, "lists", this.state.lineupId);
        let item = this.getItem();
        if (!item) return null;

        const {description, visibility} = this.state;

        let grey = UI.Colors.grey1;
        let req = this.state.reqAdd;
        let editable = req !== 1;
        let xml = <View style={[styles.container]}>

            <ItemCell item={item}/>

            <TextInput
                editable={editable}
                style={[styles.input, (editable ? {color: "black"} : {color: "grey"})]}
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

            <Text>Toutes vos listes</Text>

            <AddLineupComponent/>

        </View>;
        return (
            <LineupListScreen
                userId={currentUserId()}
                navigator={this.props.navigator}
                ListHeaderComponent={xml}
                renderItem={(item)=>this.renderListItem(item)}
            />
        );
    }

    renderListItem(item) {
        let s = this.state.selectedLineup;
        let addingIn = s === item.id;
        let opacity = !s || addingIn ? 1 : .5;

        return (
            <TouchableOpacity
                disabled={s}
                onPress={() => this._doAdd(item.id)}

            >
                <View style={{opacity, }}>
                    <LineupCell lineup={item}/>
                    {addingIn && <ActivityIndicator
                        animating={true}
                        size="small"
                        style={{position: 'absolute', alignSelf: 'center', top: "50%"}}
                    />}
                </View>

            </TouchableOpacity>
        )
    }

    _doAdd = (lineupId: Id) => {
        let {description, visibility} = this.state;

        this.setState({selectedLineup: lineupId});

        safeDispatchAction.call(
            this,
            this.props.dispatch,
            saveItem(this.props.itemId, lineupId, visibility, description),
            'reqAdd'
        ).then(()=> {
                Snackbar.show({
                    title: i18n.t('shared.goodsh_saved'),
                });
                let onAdded = this.props.onAdded;
                onAdded && onAdded();
            }
        ).then(() => this.setState({selectedLineup: null}))
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