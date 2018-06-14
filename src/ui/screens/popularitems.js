// @flow

import type {Node} from 'react';
import React from 'react';
import {
    ActivityIndicator,
    Button,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import {connect} from "react-redux";
import {logged} from "../../managers/CurrentUser"
import {SearchBar} from 'react-native-elements'
import {GListState} from "../../types";
import Screen from "../components/Screen";
import * as Api from "../../managers/Api";
import {reduceList2} from "../../managers/Api";
import ApiAction from "../../helpers/ApiAction";
import type {FeedSource} from "../components/feed";
import Feed from "../components/feed";
import ItemCell from "../components/ItemCell";
import {buildData, buildNonNullData} from "../../helpers/DataUtils";
import type {Id, RequestState} from "../../types";
import GTouchable from "../GTouchable";
import {Colors} from "../colors";
import {SFP_TEXT_REGULAR} from "../fonts";
import {LINEUP_PADDING, renderSimpleButton} from "../UIStyles";
import {fetchActivity} from "../activity/actions";
import * as types from "../activity/actionTypes";
import {hexToRgbaWithHalpha} from "../../helpers/DebugUtils"


export type Props = {
    onFinished ?: () => void
};

type State = {
    selectedItems: Id[],
    reqAdd?: RequestState
};

@logged
@connect(state => ({
        data: state.data,
        popular_items: state.popular_items,
    }), dispatch => ({
        saveManyItems: (itemsIds) => dispatch(saveManyItems(itemsIds))
    })
)
export default class PopularItemsScreen extends Screen<Props, State> {


    state = {
        selectedItems: []
    }

    constructor(props: Props) {
        super(props)
        props.navigator.setTitle({title: i18n.t("popular_screen.title")});
    }

    render() {
        const data = this.props.popular_items.list.map(i => buildNonNullData(this.props.data, i.type, i.id))

        const empty = _.isEmpty(this.state.selectedItems)
        return (
            <View style={{flex: 1, justifyContent: "space-between"}}>
                <View style={{padding: LINEUP_PADDING}}>
                    <Text style={{
                        fontSize: 18,
                        fontFamily: SFP_TEXT_REGULAR
                    }}>{i18n.t("popular_screen.main_explanation")}</Text>
                </View>
                <Feed
                    data={data}
                    renderItem={({item}) => (
                        <GTouchable
                            style={{backgroundColor: this.state.selectedItems.includes(item.id) ? hexToRgbaWithHalpha(Colors.green, 0.3) : "transparent" }}
                            onPress={()=>{
                                let selectedItems = this.state.selectedItems;
                                selectedItems = _.xor(selectedItems, [item.id])
                                this.setState({selectedItems})
                            }
                            }>
                            <ItemCell item={item}/>
                        </GTouchable>
                    )}
                    listRef={ref=>ref}
                    displayName={"PopularItems"}
                    fetchSrc={this.fetchSrc()}
                    empty={<Text>{i18n.t("popular_screen.empty")}</Text>}
                />
                <View style={{
                    padding: LINEUP_PADDING,
                    flexDirection: "row", justifyContent: "space-between", alignItems: 'center'}}>
                    <Text style={{
                        fontSize: 16,
                        fontFamily: SFP_TEXT_REGULAR
                    }}>{i18n.t("popular_screen.item_selected", {count: this.state.selectedItems.length})}</Text>
                    {
                        empty ?
                            renderSimpleButton(
                                i18n.t("popular_screen.button_skip"),
                                this._finish , {textStyle: {fontSize: 18, color: Colors.greyish}}
                            )
                            : renderSimpleButton(
                            i18n.t("popular_screen.button_next"),
                            () => this.saveMany(this.state.selectedItems),
                            {
                                loading: this.state.reqAdd === 'sending',
                                // disabled: !enabled,
                                textStyle: {fontSize: 18, color: Colors.black}
                            }
                        )
                    }
                </View>
            </View>
        )
    }

    fetchSrc(): FeedSource {
        return {
            callFactory: fetchFollowedLineups,
            action: FETCH_POPULAR_ITEMS,
        }
    }

    saveMany(itemIds: Id[]) {
        const call = itemIds.length > 0 ? Api.safeExecBlock.call(
            this,
            () => this.props.saveManyItems(itemIds),
            'reqAdd'
        ) : Promise.resolve()
        call.then(this.props.onFinished)
    }

    _finish = () => {
        this.props.onFinished && this.props.onFinished()
    }
}

const fetchFollowedLineups =  () => new Api.Call()
    .withMethod('GET')
    .withRoute(`items/popular`)


const FETCH_POPULAR_ITEMS = ApiAction.create("fetch_popular_items", "retrieve popular items");


const saveManyItems =  (itemIds: Id[]) => new Api.Call()
    .withMethod('POST')
    .withRoute(`items/save`)
    .include('savings')
    .withBody({savings: itemIds.map(item_id=>({item_id}))})
    .createActionDispatchee(SAVE_MANY_ITEMS)


const SAVE_MANY_ITEMS = ApiAction.create("save_many_items", "save many items");



export const reducer = (state:GListState = {list: []}, action: any) => {
    return reduceList2(state, action, FETCH_POPULAR_ITEMS);
};
