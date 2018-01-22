// @flow
import React from 'react';
import {ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {CheckBox, SearchBar} from "react-native-elements";
import {renderSimpleButton} from "../UIStyles";
import type {Id, Item, ItemType} from "../../types";
import {fetchItemCall, saveItem} from "../lineup/actions";
import {logged} from "../../managers/CurrentUser";
import {connect} from "react-redux";
import {buildData, buildNonNullData} from "../../helpers/DataUtils";
import ItemCell from "../components/ItemCell";
import Screen from "../components/Screen";
import {safeDispatchAction} from "../../managers/Api";
import {renderTag} from "../UIComponents";
import {FETCH_ITEM} from "../lineup/actionTypes";
import {Colors} from "../colors";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import Sheet from "../components/sheet";
import {CANCELABLE_MODAL} from "../Nav";
import Snackbar from "react-native-snackbar"

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
};


@logged
@connect((state, ownProps) => ({
    data: state.data,
}))
export default class AddItemScreen extends Screen<Props, State> {

    static navigatorStyle = {
        navBarHidden: true,
        screenBackgroundColor: 'transparent',
        modalPresentationStyle: 'overFullScreen',
        tapBackgroundToDismiss: true
    };


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

        let grey = Colors.greyishBrown;
        let req = this.state.reqAdd;
        let editable = req !== 1;
        let xml = (<View style={[styles.container]}>
            <Text>{i18n.t('create_list_controller.all_list')}</Text>
        </View>);
        return (
            <KeyboardAwareScrollView
                contentContainerStyle={{flex:1}}
                scrollEnabled={false}
                keyboardShouldPersistTaps={true}
                // style={{position: 'absolute', bottom:0, top: 0}}
            >
                <Sheet
                    navigator={this.props.navigator}
                >

                    <View style={{height: 400, backgroundColor: Colors.white}}>
                        <ItemCell item={item}>
                            <TextInput
                                editable={editable}
                                style={[styles.input, (editable ? {color: "black"} : {color: "grey"})]}
                                value={description}
                                onChangeText={description => this.setState({description})}
                                placeholder={i18n.t("create_list_controller.add_description")}
                                returnKeyType={selectedLineupId ? 'go' : 'next'}
                                onSubmitEditing={() => {selectedLineupId && this._doAdd(selectedLineupId)}}
                                multiline={true}
                            />

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
                                containerStyle={{ backgroundColor: "transparent", borderWidth: 0, width: "100%"}}
                            />
                        </ItemCell>
                        {/*{selectedLineupId && <LineupCell style={{backgroundColor: Colors.white82, marginRight: 8, marginLeft: 8, borderRadius: 8}} lineup={buildNonNullData(this.props.data, 'lists', selectedLineupId)}/>}*/}
                        {selectedLineupId && this.renderList(selectedLineupId)}
                        {renderSimpleButton(i18n.t('shared.add'), ()=>this._doAdd(selectedLineupId), {style:{backgroundColor: Colors.green, padding: 10, marginTop: 10, marginRight: 8, marginLeft: 8}, textStyle:{ fontWeight:'normal', color: Colors.white }})}


                    </View>
                </Sheet>
            </KeyboardAwareScrollView>
        );
    }

    renderList(selectedLineupId: Id) {
        const lineup = buildNonNullData(this.props.data, 'lists', selectedLineupId);

        //QtoK: wrapping a child positioning in absolute is the only wa I found to have a component with the good width
        //other idea?
        return <View style={{height: 50}}>
            {renderTag(lineup.name, () => {
                //select lineup
                this.props.navigator.showModal({
                    screen: 'goodsh.AddInScreen', // unique ID registered with Navigation.registerScreen
                    title: i18n.t('create_list_controller.choose_list'),
                    passProps: {
                        onListSelected: list => {
                            this.setState({selectedLineupId:list.id});
                            this.props.navigator.dismissModal();
                        }
                    },
                    navigatorButtons: CANCELABLE_MODAL,
                });
            }, {position: 'absolute'})
            }
        </View>;
        // return <LineupCell style={{backgroundColor: Colors.white82, marginRight: 8, marginLeft: 8, borderRadius: 8}} lineup={buildNonNullData}/>;
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
        padding: 7
    },
    searchContainer: {
        backgroundColor: 'transparent',
    },
    input: {
        marginTop: 20,
        fontSize: 15,
        height: 60,
        borderColor: Colors.greyish,
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 5,
    }
});
