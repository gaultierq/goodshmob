// @flow

import React from 'react'
import {Image, ImageBackground, Keyboard, ScrollView, StyleSheet, Text, View} from 'react-native'
import {connect} from "react-redux"
import {logged} from "../../managers/CurrentUser"
import {InnerPlus, ListColumnsSelector, TRANSPARENT_SPACER} from "../UIComponents"
import * as Api from "../../managers/Api"
import Feed from "../components/feed"
import type {Lineup, Saving} from "../../types"
import {doDataMergeInState} from "../../helpers/DataUtils"
import ActivityCell from "../activity/components/ActivityCell"
import {CANCELABLE_MODAL2, seeActivityDetails} from "../Nav"
import {Colors} from "../colors"
import Screen from "./../components/Screen"
import {LINEUP_PADDING, STYLES} from "../UIStyles"
import {FETCH_LINEUP, FETCH_SAVINGS, fetchLineup,} from "../lineup/actions"
import {UNSAVE} from "../activity/actionTypes"
import {GLineupAction, LineupRights} from "../lineupRights"
import {LINEUP_AND_SAVING_SELECTOR} from "../../helpers/ModelUtils"
import {createSelector} from "reselect"
import FeedSeparator from "../activity/components/FeedSeparator"
import {CachedImage} from 'react-native-cached-image'
import GTouchable from "../GTouchable"
import {LineupHeader} from "../lineup/LineupHeader"

import {createDetailsLink} from "../activity/activityDetail"
import {openLinkSafely} from "../../managers/Links"
import SearchItems from "./searchitems"
import GImage from "../components/GImage"
import {LineupMedals} from "../lineup/LineupMedals"

type Props = {
    lineupId: string,
    navigator: any,
    lineup: ?Lineup,
    saving: ?Saving[],
};

type State = {
    title?: {title: string, titleImage: string},
    titleSet?: boolean,
    renderType: 'grid' | 'stream'
}
export const selector = createSelector(
    [
        LINEUP_AND_SAVING_SELECTOR,
        state => state.pending
    ],
    ({lineup, savings}, pending) => {

        let actions = LineupRights.getActions(lineup, pending)
        return {lineup, savings, actions}
    }
)

const SPACER = 6

@logged
@connect(selector)
class LineupScreen extends Screen<Props, State> {

    static navigatorStyle = {
        navBarHidden: true,
    }
    // static navigatorStyle = {
    //     drawUnderNavBar: true,
    //     navBarTransparent: true,
    //     navBarTranslucent: true,
    //     navBarBackgroundColor: Colors.dirtyWhite,
    //     topBarElevationShadowEnabled: false
    // }

    static navigatorButtons = CANCELABLE_MODAL2

    unsubscribe: ?() => void
    actions: ?GLineupAction[]

    state = {
        navBarState: {},
        renderType: 'grid',
    }


    render() {
        const {lineup, savings} = this.props

        let fetchSrc = this.getFetchSrc(lineup)
        let numColumns = this.state.renderType === 'grid' ? 3 : 1
        let data
        if (this.state.renderType === 'grid') {
            data = _.concat([{type: 'plus_button'}], savings)
        }
        else {
            data = savings
        }
        return (
            <View style={styles.container}>
                <Feed
                    key={"lineup-" + this.state.renderType}
                    data={data}
                    renderItem={this.state.renderType === 'grid' ? this.renderItemGrid.bind(this) : this.renderItemStream.bind(this)}
                    fetchSrc={fetchSrc}
                    hasMore={true}
                    ListEmptyComponent={<Text style={STYLES.empty_message}>{i18n.t("empty.lineup")}</Text>}
                    numColumns={numColumns}
                    ItemSeparatorComponent={TRANSPARENT_SPACER(SPACER)}
                    style={{flex: 1, backgroundColor: Colors.white}}
                    ListHeaderComponent={
                        (
                            <View style={{marginTop: 40, }}>

                                <View style={{flexDirection: 'row', flex:1}}>
                                    <LineupHeader lineup={lineup} navigator={this.props.navigator} />
                                </View>

                                <LineupMedals navigator={this.props.navigator} lineup={lineup}/>
                                <FeedSeparator style={{marginTop: LINEUP_PADDING}}/>
                                <ListColumnsSelector
                                    size={30}
                                    onTabPressed={index => this.setState({renderType: index === 0 ? 'grid' : 'stream'})}
                                />
                                <FeedSeparator />
                            </View>
                        )}
                />
            </View>
        );
    }
    getFetchSrc(lineup: Lineup) {
        let fetchSrc
        if (lineup && lineup.savings) {
            fetchSrc = {
                callFactory: () => actions.fetchSavings(this.props.lineupId),
                action: FETCH_SAVINGS,
                options: {listId: this.props.lineupId}
            }
        }
        else {
            fetchSrc = {
                callFactory: () => fetchLineup(this.props.lineupId),
                action: FETCH_LINEUP,
                options: {listId: this.props.lineupId}
            }
        }
        return fetchSrc
    }

    static calcGridLayout(width: number, numColumns: number) {
        // if (this.state.renderType !== 'grid') throw "bad layout"
        let cellWidth = (width + SPACER) / numColumns - SPACER
        return {numColumns, cellWidth, cellHeight: cellWidth}
    }

    renderItemStream({item}) {

        let saving: Saving = item
        return (
            <ActivityCell
                activity={saving}
                activityType={saving.type}
                onPressItem={() => seeActivityDetails(this.props.navigator, saving)}
                navigator={this.props.navigator}
            />
        )
    }

    renderItemGrid({item, index}) {


        const layout = LineupScreen.calcGridLayout(__DEVICE_WIDTH__, 3)
        index = index % layout.numColumns
        let styles = LineupScreen.obtainGridStyles(layout)

        let uri, child
        if (item.type === 'plus_button') {
            uri = SearchItems.createAddLink(this.props.lineupId)
            child = (
                <View style={{width: layout.cellWidth, height: layout.cellHeight}}>
                    <InnerPlus plusStyle={{backgroundColor: Colors.black, borderRadius: 4,}}/>
                </View>
            )
        }
        else {
            uri = createDetailsLink(item.id, item.type)
            child = <GImage
                source={{uri: _.get(item, 'resource.image'), }}
                style={[styles.gridImg]}
                resizeMode='cover'
                fallbackSource={require('../../img/goodsh_placeholder.png')}/>
        }
        return (
            <GTouchable style={[styles.gridCellCommon, index === 0 ? styles.gridCellL : index === layout.numColumns ? styles.gridCellR : null ]}
                        onPress={() => openLinkSafely(uri)}>
                {child}
            </GTouchable>
        )
    }


    static gridStyles = {}

    static obtainGridStyles(layout: any) {
        const width = layout.cellWidth
        const height = layout.cellHeight
        const key = `${width}x${height}`

        let res = this.gridStyles[key]
        if (res) return res
        res = StyleSheet.create({
            gridCellL: {
                marginLeft: 0,
                marginRight: SPACER / 2,

            },
            gridCellCommon: {
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: Colors.greying,

            },
            gridCellR: {
                marginLeft: SPACER / 2,
                marginRight: 0,
            },
            gridImg: {
                width: width,
                height: height,
                backgroundColor: Colors.white,
                alignSelf: 'center',
                alignItems: 'center',
            },
        })
        this.gridStyles[key] = res
        return res
    }



}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
})

const actions = {

    fetchSavings: (lineupId: string) => {
        return new Api.Call().withMethod('GET')
            .withRoute(`lists/${lineupId}/savings`)
            .addQuery({
                page: 1,
                include: "*.*"
            });
    },

    deleteSaving: (saving:Saving) => {
        let call = new Api.Call()
            .withMethod('DELETE')
            .withRoute(`savings/${saving.id}`);

        return call.createActionDispatchee(UNSAVE);
    }
};



const reducer = (() => {
    const initialState = Api.initialListState()

    return (state = initialState, action = {}) => {

        switch (action.type) {
            case FETCH_SAVINGS.success(): {
                let {listId, mergeOptions} = action.options;
                let path = `lists.${listId}.relationships.savings.data`;
                state = doDataMergeInState(state, path, action.payload.data, mergeOptions);
                break;
            }
        }
        return state;
    }
})();

let screen = LineupScreen;

export {reducer, screen, actions};





