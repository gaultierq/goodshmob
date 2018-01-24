// @flow
import React from 'react';
import {ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image} from 'react-native';
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
import {SFP_TEXT_ITALIC, SFP_TEXT_REGULAR} from "../fonts"
import GTouchable from "../GTouchable";

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
    adding?: boolean
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

    _sheet;


    constructor(props: Props) {
        super(props);

        this.state = {
            visibility: 0,
            adding: false,
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
        let adding = this.state.adding;
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
                    ref={ref => this._sheet = ref}
                >

                    <View style={{height: 350, paddingTop: 7, paddingLeft: 7, paddingRight: 7, paddingBottom: 15, backgroundColor: Colors.white}}>
                        <View style={{flexDirection: 'row', padding: 8}}>
                            <GTouchable onPress={()=>this._sheet && this._sheet.close()}>
                                <Image source={require('../../img2/closeXGrey.png')}/>
                            </GTouchable>
                            <CheckBox
                                right
                                title={i18n.t("create_list_controller.unvisible")}
                                checkedTitle={i18n.t("create_list_controller.visible")}
                                iconRight
                                size={16}
                                onPress={(newValue)=> this.setState({visibility: visibility === 1 ? 0 : 1})}
                                checked={!visibility}
                                style={{backgroundColor: 'transparent', alignSelf: 'flex-end'}}
                                textStyle={{color: Colors.brownishGrey, fontSize: 14, fontFamily: SFP_TEXT_REGULAR, fontWeight: 'normal'}}
                                containerStyle={{ backgroundColor: "transparent", borderWidth: 0, marginRight:0, padding: 0, flex: 1}}
                                checkedIcon='unlock'
                                uncheckedIcon='unlock-alt'
                                checkedColor={Colors.brownishGrey}
                                uncheckedColor={Colors.brownishGrey}
                            />
                        </View>
                        <ItemCell item={item}>
                            <TextInput
                                editable={editable}
                                style={[styles.input, (editable ? {color: Colors.greyish} : {color: "grey"})]}
                                value={description}
                                onChangeText={description => this.setState({description})}
                                placeholder={i18n.t("create_list_controller.add_description")}
                                returnKeyType={selectedLineupId ? 'go' : 'next'}
                                onSubmitEditing={() => {selectedLineupId && this._doAdd(selectedLineupId)}}
                                multiline={true}
                            />
                        </ItemCell>
                        {/*{selectedLineupId && <LineupCell style={{backgroundColor: Colors.white82, marginRight: 8, marginLeft: 8, borderRadius: 8}} lineup={buildNonNullData(this.props.data, 'lists', selectedLineupId)}/>}*/}
                        {selectedLineupId && this.renderList(selectedLineupId)}
                        {renderSimpleButton(i18n.t('shared.add'), ()=>this._doAdd(selectedLineupId), {loading: adding, style:{backgroundColor: Colors.green, padding: 10, marginTop: 10, marginRight: 8, marginLeft: 8}, textStyle:{ fontWeight:'normal', color: Colors.white }})}
                    </View>
                </Sheet>
            </KeyboardAwareScrollView>
        );
    }

    renderList(selectedLineupId: Id) {
        const lineup = buildNonNullData(this.props.data, 'lists', selectedLineupId);

        //QtoK: wrapping a child positioning in absolute is the only wa I found to have a component with the good width
        //other idea?
        return <View style={{height: 35, paddingLeft: 8}}>
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

        this.setState({adding: true});

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
                this.setState({adding: false});
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
        backgroundColor: 'transparent',
        marginTop: 15,
        fontSize: 15,
        fontFamily: SFP_TEXT_ITALIC,
        height: 80,
        borderWidth: 0,
    }
});
