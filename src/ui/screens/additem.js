// @flow
import React from 'react';
import {ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {CheckBox, SearchBar} from "react-native-elements";
import {renderSimpleButton, renderSimpleLink} from "../UIStyles";

import LineupCell from "../components/LineupCell";
import type {Id, Item, ItemType} from "../../types";
import {fetchItemCall, saveItem} from "../lineup/actions";
import {currentUserId} from "../../CurrentUser";
import Snackbar from "react-native-snackbar"
import {connect} from "react-redux";
import {buildData, buildNonNullData} from "../../utils/DataUtils";
import ItemCell from "../components/ItemCell";
import Screen from "../components/Screen";
import {safeDispatchAction} from "../../utils/Api";
import {LineupListScreen} from "./lineuplist";
import AddLineupComponent from "../components/addlineup";
import {MainBackground} from "../UIComponents";
import {FETCH_ITEM} from "../lineup/actionTypes";
import {Colors} from "../colors";

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
    selectedLineupId?: Id,
    showLineupList: boolean
};


@connect((state, ownProps) => ({
    data: state.data,
}))
export default class AddItemScreen extends Screen<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            visibility: 0,
            selectedLineupId: props.defaultLineupId,
            showLineupList: !props.defaultLineupId
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

        const {description, visibility, selectedLineupId, showLineupList} = this.state;

        let grey = Colors.grey1;
        let req = this.state.reqAdd;
        let editable = req !== 1;
        let xml = (<View style={[styles.container]}>
            <Text>#Toutes vos listes</Text>
        </View>);
        return (
            <MainBackground>
                <ScrollView>
                    <View>
                        <ItemCell item={item}>
                            <TextInput
                                editable={editable}
                                style={[styles.input, (editable ? {color: "black"} : {color: "grey"})]}
                                value={description}
                                onChangeText={description => this.setState({description})}
                                placeholder={/*i18n.t("create_list_controller.placeholder")*/"#Ajouter une description"}
                                returnKeyType={selectedLineupId ? 'go' : 'next'}
                                onSubmitEditing={() => {selectedLineupId && this._doAdd(selectedLineupId)}}
                            />

                            <CheckBox
                                right
                                title="#Visible par mes amis"
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
                        </ItemCell>


                    </View>


                    {selectedLineupId && <LineupCell lineup={buildNonNullData(this.props.data, 'lists', selectedLineupId)}/>}

                    {showLineupList && <LineupListScreen
                        userId={currentUserId()}
                        navigator={this.props.navigator}
                        ListHeaderComponent={xml}
                        ListFooterComponent={<AddLineupComponent/>}
                        renderItem={(item) => (
                            <TouchableOpacity onPress={() => this.setState({selectedLineupId: item.id, showLineupList: false})}>
                                <LineupCell lineup={item}/>
                            </TouchableOpacity>
                        )}
                    />
                    }

                    {selectedLineupId && !showLineupList && (
                        <View style={{flex: 1}}>
                            {
                                <View style={{flex: 1, alignItem:'flex-end', margin: 8}}>
                                    {renderSimpleLink(
                                    '#Choisir une autre liste',
                                    () => this.setState({showLineupList: true}),
                                    )}
                                </View>
                            }
                            {renderSimpleButton(i18n.t('shared.add'), ()=>this._doAdd(selectedLineupId), )}
                        </View>
                    )
                    }
                </ScrollView>
            </MainBackground>
        );
    }

    _doAdd = (lineupId: Id) => {
        let {description, visibility} = this.state;

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
        ).then(() => this.setState({selectedLineupId: null}))
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
        borderColor: Colors.grey1,
        borderWidth: StyleSheet.hairlineWidth,
    }
});