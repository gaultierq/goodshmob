// @flow

import React from 'react'
import {Image, ImageBackground, Keyboard, SafeAreaView, ScrollView, StyleSheet, Text, View} from 'react-native'
import {connect} from "react-redux"
import {logged} from "../../managers/CurrentUser"
import {GoodshContext, InnerPlus, ListColumnsSelector, renderLinkInText} from "../UIComponents"
import * as Api from "../../managers/Api"
import Feed from "../components/feed"
import type {Lineup, Saving} from "../../types"
import {doDataMergeInState, sanitizeActivityType} from "../../helpers/DataUtils"
import ActivityCell from "../activity/components/ActivityCell"
import {CANCELABLE_MODAL2, seeActivityDetails} from "../Nav"
import {Colors} from "../colors"
import Screen from "./../components/Screen"
import {LINEUP_PADDING} from "../UIStyles"
import {FETCH_LINEUP, FETCH_SAVINGS, fetchLineup, FOLLOW_LINEUP_PENDING, followLineupPending,} from "../lineup/actions"
import {FOLLOW_LINEUP, UNSAVE} from "../lineup/actionTypes"
import {L_ADD_ITEM, L_FOLLOW} from "../lineupRights"
import {createStructuredSelector} from "reselect"
import FeedSeparator from "../activity/components/FeedSeparator"
import {CachedImage} from 'react-native-cached-image'
import {LineupHeader} from "../lineup/LineupHeader"
import {buildSearchItemUrl, openLinkSafely} from "../../managers/Links"
import SearchItems from "./searchitems"
import {LineupMedals} from "../lineup/LineupMedals"
import {
    LINEUP_ACTIONS_SELECTOR,
    LINEUP_SAVING_COUNT_SELECTOR,
    LINEUP_SELECTOR,
    lineupId,
    LIST_SAVINGS_SELECTOR
} from "../../helpers/Selectors"
import {
    calcGridLayout,
    gridCellPositioningStyle,
    obtainGridStyles,
    savingForGridRenderer2
} from "../../helpers/GridHelper"
import GMap from "../components/GMap"
import ActionButton from "react-native-action-button"
import MaterialIcon from "react-native-vector-icons/MaterialIcons"
import GTouchable from "../GTouchable"
import {createDetailsLink} from "../activity/activityDetail"
import _Messenger from "../../managers/Messenger"
import {UPDATE_ACTIVITY} from "./changeDescription"

type Props = {
    lineupId: string,
    navigator: any,
    lineup: ?Lineup,
    saving: ?Saving[],
    mapDisplay?: boolean,
    renderType?: 'grid' | 'stream',
};

type State = {
    title?: {title: string, titleImage: string},
    titleSet?: boolean,
    renderType: 'grid' | 'stream',
    mapDisplay: boolean
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

    static defaultProps = {
        renderType: 'grid',
        mapDisplay: false,
    }

    layout: any = calcGridLayout(__DEVICE_WIDTH__, 3)

    gridStyles: any = obtainGridStyles(this.layout)

    feedRef: any

    containerHeight:number
    headerHeight: number
    map: any

    constructor(props: Props) {
        super(props)
        this.state = {
            navBarState: {},
            renderType: props.renderType,
            mapDisplay: props.mapDisplay,
        }
    }

    componentDidMount() {
        const lineupId = this.getLineupId()
        this.props.dispatch(fetchLineup(lineupId).createActionDispatchee(FETCH_LINEUP))

        if (this.props.invitedBy && this.props.actions.indexOf(L_FOLLOW) >= 0) {
            followLineupPending(this.props.dispatch, this.props.lineup)
        }
    }

    getLineupId() {
        return this.props.lineup.id
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
            <GoodshContext.Provider value={{userOwnResources: true, resourceOwnerId: _.get(lineup, 'user.id')}}>
                <SafeAreaView
                    onLayout={e => this.containerHeight = e.nativeEvent.layout.height}
                    style={{
                        flex: 1,
                        // backgroundColor: 'orange',
                        height: '100%',
                    }}>
                    <ScrollView
                        // onEndReached={this._onEndReached}
                        onScroll={({nativeEvent}) => {
                            if (isCloseToBottom(nativeEvent)) {
                                this._onEndReached()
                            }
                        }}
                        scrollEventThrottle={100}
                    >
                        <View

                            style={{
                                flex:1,
                                // backgroundColor: 'pink',
                                // height: '100%',
                            }}>
                            <View onLayout={e => this.headerHeight = e.nativeEvent.layout.height}>
                                <LineupHeader lineup={lineup} navigator={this.props.navigator}/>
                                <LineupMedals navigator={this.props.navigator} lineup={lineup}/>
                                <FeedSeparator style={{marginTop: LINEUP_PADDING}}/>
                                <View>
                                    <ListColumnsSelector
                                        disabled={sc <= 0}
                                        size={30}
                                        initialIndex={this.state.renderType === 'stream' ? 1 : 0}
                                        onTabPressed={index => this.setState({renderType: index === 0 ? 'grid' : 'stream'})}
                                    />
                                    <FeedSeparator/>
                                </View>
                                { this.state.mapDisplay && this.renderMap() }
                            </View>
                            <Feed
                                feedRef={ref => this.feedRef = ref}
                                key={"lineup-" + this.state.renderType}
                                data={data}
                                renderItem={this.state.renderType === 'grid' ? this.renderItemGrid.bind(this) : this.renderItemStream.bind(this)}
                                fetchSrc={fetchSrc}
                                hasMore={true}
                                ListEmptyComponent={renderLinkInText(canAdd ? "empty_lineup_add" : "empty_lineup_cry", buildSearchItemUrl(this.lineupId()))}
                                numColumns={numColumns}
                                ItemSeparatorComponent={this.layout.ItemSeparatorComponent}
                                style={{flex: 1, backgroundColor: Colors.white}}
                                // listview in scrollview is not happy with the onEndReached event
                                onEndReached={() => null}
                            />

                        </View>
                    </ScrollView>
                    {_.some(data, s => _.get(s, 'resource.type') === 'Place') && this.renderMapButton()}
                </SafeAreaView>
            </GoodshContext.Provider>
        );
    }

    _savingForGridRenderer = savingForGridRenderer2(
        {width: __DEVICE_WIDTH__, columns: 3},
        item => this._makeOnItemPressed(item)
    )

    _makeOnItemPressed = item => {
        if (this.state.mapDisplay) {
            let desc = _.get(item, 'resource.description')
            const coordinate = _.pick(desc, ['latitude', 'longitude'])
            if (_.isEmpty(coordinate)) return null

            return () => this.map && this.map.animateToCoordinate(coordinate)
        }
        else {
            return () => openLinkSafely(createDetailsLink(item.id, item.type))
        }
    }

    _onEndReached = () => {
        console.debug("lineup scrollview: _onEndReached")
        return this.feedRef && this.feedRef.onEndReached()
    }

    renderMapButton() {
        return (
            <ActionButton buttonColor={Colors.orange}
                          icon={<MaterialIcon name={this.state.mapDisplay === 'map' ? 'list' : 'map'} color={Colors.white} size={32} />}
                          onPress={() => {
                              this.setState({mapDisplay: !this.state.mapDisplay})
                          }}
            />
        )
    }

    mapHeight = () => /*(this.containerHeight - this.headerHeight) || */__DEVICE_WIDTH__ / 1.618

    renderMap() {
        let points = this.props.savings.map(s => s.resource).filter(item => item.type === 'Place')
        let _savingFromItem = item => this.props.savings.find(s => s.resource === item)
        return (
            <View style={{
                width: "100%",
                height: this.mapHeight(),
                flex: 1}}>
                <GMap
                    setRef={ref => this.map = ref}
                    onItemPressed={(item) => seeActivityDetails(this.props.navigator, _savingFromItem(item))}
                    points={points}
                />
            </View>
        )
    }

    lineupId() {
        return lineupId(this.props)
    }


    getFetchSrc(lineup: Lineup) {
        let fetchSrc
        const listId = lineup.id
        if (lineup && !_.isEmpty(lineup.savings)) {
            fetchSrc = {
                callFactory: () => actions.fetchSavings(listId),
                action: FETCH_SAVINGS,
                options: {listId: this.lineupId()}
            }
        }
        else {
            fetchSrc = {
                callFactory: () => fetchLineup(listId),
                action: FETCH_LINEUP,
                options: {listId: listId}
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
            return (
                <GTouchable
                    key={`lineup.grid.${index}`}
                    style={gridCellPositioningStyle(gridStyles, index, layout)}
                    onPress={() => openLinkSafely(SearchItems.createAddLink(this.getLineupId()))}>
                    {(
                        <View style={{width: layout.cellWidth, height: layout.cellHeight}}>
                            <InnerPlus plusStyle={{backgroundColor: Colors.black, borderRadius: 4,}}/>
                        </View>
                    )}
                </GTouchable>
            )
        }

        return this._savingForGridRenderer({item, index})
    }

}

const actions = {

    fetchSavings: (lineupId: string) => {
        return new Api.Call().withMethod('GET')
            .withRoute(`lists/${lineupId}/savings`)
            .addQuery({
                page: 1,
                include: "*.*"
            });
    },
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



const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >=
        contentSize.height - paddingToBottom;
};
