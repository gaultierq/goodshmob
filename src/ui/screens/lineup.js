// @flow

import React from 'react'
import {Image, ImageBackground, Keyboard, ScrollView, StyleSheet, Text, View} from 'react-native'
import {connect} from "react-redux"
import {logged} from "../../managers/CurrentUser"
import {InnerPlus, ListColumnsSelector, renderLinkInText} from "../UIComponents"
import * as Api from "../../managers/Api"
import Feed from "../components/feed"
import type {Lineup, Saving} from "../../types"
import {doDataMergeInState} from "../../helpers/DataUtils"
import ActivityCell from "../activity/components/ActivityCell"
import {CANCELABLE_MODAL2, seeActivityDetails} from "../Nav"
import {Colors} from "../colors"
import Screen from "./../components/Screen"
import {LINEUP_PADDING} from "../UIStyles"
import {FETCH_LINEUP, FETCH_SAVINGS, fetchLineup,} from "../lineup/actions"
import {UNSAVE} from "../lineup/actionTypes"
import {L_ADD_ITEM} from "../lineupRights"
import {createStructuredSelector} from "reselect"
import FeedSeparator from "../activity/components/FeedSeparator"
import {CachedImage} from 'react-native-cached-image'
import {LineupHeader} from "../lineup/LineupHeader"
import {buildSearchItemUrl} from "../../managers/Links"
import SearchItems from "./searchitems"
import {LineupMedals} from "../lineup/LineupMedals"
import {
    LINEUP_ACTIONS_SELECTOR,
    LINEUP_SAVING_COUNT_SELECTOR,
    LINEUP_SELECTOR,
    lineupId,
    LIST_SAVINGS_SELECTOR
} from "../../helpers/Selectors"
import {calcGridLayout, obtainGridStyles, renderSavingForGrid, savingForGridRenderer} from "../../helpers/GridHelper"

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


@logged
@connect(() => {
    const lineup = LINEUP_SELECTOR()
    const savings = LIST_SAVINGS_SELECTOR()
    const actions = LINEUP_ACTIONS_SELECTOR()
    const savingsCount = LINEUP_SAVING_COUNT_SELECTOR()

    return createStructuredSelector({
        lineup,
        savings,
        actions,
        savingsCount,
    })
})
class LineupScreen extends Screen<Props, State> {

    static navigatorStyle = {navBarHidden: true,}

    static navigatorButtons = CANCELABLE_MODAL2

    layout: any = calcGridLayout(__DEVICE_WIDTH__, 3)

    gridStyles: any = obtainGridStyles(this.layout)

    _savingForGridRenderer = savingForGridRenderer(this.layout, this.gridStyles)

    state = {
        navBarState: {},
        renderType: 'grid',
    }

    render() {
        const {lineup, savings} = this.props
        let sc = this.props.savingsCount.total
        let fetchSrc = this.getFetchSrc(lineup)
        let numColumns = this.state.renderType === 'grid' ? 3 : 1
        let data
        let canAdd = this.props.actions.indexOf(L_ADD_ITEM) >= 0
        if (sc > 0 && canAdd && this.state.renderType === 'grid') {
            data = _.concat([{type: 'plus_button'}], savings)
        }
        else {
            data = savings
        }

        return (
            <View style={styles.container}>
                <Feed
                    key={"lineup-" + this.state.renderType}
                    // decorateLoadMoreCall={(sections: any[], call: Call) => call.addQuery({id_after: _.get(_.last(data), 'saving.id')})}
                    data={data}
                    renderItem={this.state.renderType === 'grid' ? this.renderItemGrid.bind(this) : this.renderItemStream.bind(this)}
                    fetchSrc={fetchSrc}
                    hasMore={true}
                    ListEmptyComponent={renderLinkInText(canAdd ? "empty_lineup_add" : "empty_lineup_cry", buildSearchItemUrl(this.lineupId()))}
                    numColumns={numColumns}
                    ItemSeparatorComponent={this.layout.ItemSeparatorComponent}
                    style={{flex: 1, backgroundColor: Colors.white}}
                    ListHeaderComponent={(isContentReady) => this.renderHeader(lineup, sc)}
                />
            </View>
        );
    }

    renderHeader(lineup, sc) {
        return (
            <View style={{marginTop: 40,}}>

                <LineupHeader lineup={lineup} navigator={this.props.navigator}/>

                <LineupMedals navigator={this.props.navigator} lineup={lineup}/>
                <FeedSeparator style={{marginTop: LINEUP_PADDING}}/>
                <ListColumnsSelector
                    disabled={sc <= 0}
                    size={30}
                    initialIndex={this.state.renderType === 'stream' ? 1 : 0}
                    onTabPressed={index => this.setState({renderType: index === 0 ? 'grid' : 'stream'})}
                />
                <FeedSeparator/>
            </View>
        )
    }

    lineupId() {
        return lineupId(this.props)
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

    renderItemStream({item}) {

        let saving: Saving = item
        if (item.from === 'pending') return null
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


        const layout = this.layout
        index = index % layout.numColumns
        const gridStyles = this.gridStyles

        if (item.type === 'plus_button') {
            return renderSavingForGrid(
                index,
                gridStyles,
                layout,
                SearchItems.createAddLink(this.props.lineupId), (
                <View style={{width: layout.cellWidth, height: layout.cellHeight}}>
                    <InnerPlus plusStyle={{backgroundColor: Colors.black, borderRadius: 4,}}/>
                </View>
            ))
        }

        return this._savingForGridRenderer({item, index})
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


