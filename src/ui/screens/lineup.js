// @flow

import React from 'react'
import {Image, ImageBackground, Keyboard, ScrollView, StyleSheet, Text, View} from 'react-native'
import {connect} from "react-redux"
import {logged} from "../../managers/CurrentUser"
import {getNavButtonForAction, ListColumnsSelector, TRANSPARENT_SPACER} from "../UIComponents"
import * as Api from "../../managers/Api"
import Feed from "../components/feed"
import type {Id, Lineup, RNNNavigator, Saving} from "../../types"
import {doDataMergeInState} from "../../helpers/DataUtils"
import ActivityCell from "../activity/components/ActivityCell"
import {displayLineupActionMenu, displayShareLineup, seeActivityDetails, startAddItem} from "../Nav"
import {Colors} from "../colors"
import Screen from "./../components/Screen"
import * as UI from "../UIStyles"
import {STYLES} from "../UIStyles"
import {FETCH_LINEUP, FETCH_SAVINGS, fetchLineup, followLineupPending, unfollowLineupPending,} from "../lineup/actions"
import {UNSAVE} from "../activity/actionTypes"
import {GLineupAction, LineupRights} from "../lineupRights"
import {LINEUP_AND_SAVING_SELECTOR} from "../../helpers/ModelUtils"
import {createSelector} from "reselect"
import FeedSeparator from "../activity/components/FeedSeparator"
import {CachedImage} from 'react-native-cached-image'
import GTouchable from "../GTouchable"
import {LineupHeader} from "../lineup/LineupHeader"

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
        // those props only affect Android
        navBarTitleTextCentered: true,
        navBarSubTitleTextCentered: true,
    }

    unsubscribe: ?() => void
    actions: ?GLineupAction[]

    state = {
        navBarState: {},
        renderType: 'grid',
    }

    componentWillMount() {
        this.unsubscribe = this.props.navigator.addOnNavigatorEvent(this.onNavigatorEvent.bind(this));

        this.props.navigator.setStyle({
            ...UI.NavStyles,
            navBarCustomView: 'goodsh.LineupNav',
            navBarCustomViewInitialProps: {
                lineupId: this.props.lineupId
            }
        })
    }

    componentWillUnmount() {
        if (this.unsubscribe) this.unsubscribe()
    }

    componentDidAppear() {
        LineupScreen.refreshNavBar(this.props.navigator, this.props.lineupId)
    }

    refreshNavigatorButtons() {
        console.debug('refresh navigator buttons')
        this.props.navigator.setButtons(this.getMainActionButton2(this.props.actions, this.props.lineupId))

    }

    static refreshNavBar(navigator: RNNNavigator, lineupId: ?Id, lineup: ?Lineup) {

        if (lineup) {
            navigator.setTitle({title: lineup.name});
        }
    }

    //TODO: improve code
    getMainActionButton2(actions: GLineupAction[], lineupId: Id): any {
        let {mains, more} = this.getButtons(actions)

        let rightButtons = mains.map(action => getNavButtonForAction(action, `${lineupId}`))
        if (more.length > 0) {
            rightButtons.push({
                icon: require('../../img2/vertical-dots.png'),
                id: 'more_' + lineupId
            })
        }
        rightButtons.reverse()

        console.debug("lineup " + lineupId + ": buttons:", rightButtons, actions)
        return {rightButtons, fab: {}}
    }

    getButtons(actions) {
        let more = _.sortBy(actions, a => a.priority)
        // let _p = 0
        // const mains = _.remove(actions, a => {
        //     if (a.priority <= _p) {
        //         _p = a.priority
        //         return true
        //     }
        //     return false
        // })

        return {mains: [], more}
    }

// FIXME: terrible hack: watch store, refresh accordingly
    onNavigatorEvent(event) {
        console.debug('onNavigatorEvent', event)
        let lineup = this.props.lineup
        if (event.id === 'add_' + lineup.id) {
            startAddItem(this.props.navigator, lineup.id)
        }
        else if (event.id === 'follow_' + lineup.id) {
            followLineupPending(this.props.dispatch, lineup)
        }
        else if (event.id === 'share_' + lineup.id) {
            displayShareLineup({
                navigator: this.props.navigator,
                lineup: this.props.lineup
            })
        }
        else if (event.id === 'unfollow_' + lineup.id) {
            unfollowLineupPending(this.props.dispatch, lineup)
        }
        else if (event.id === 'more_' + lineup.id) {
            let {more} = this.getButtons(actions)
            displayLineupActionMenu(this.props.navigator, this.props.dispatch, lineup, a => !more.includes(a))
        }
    }

    // static getDerivedStateFromProps(props: Props, state: State) {
    // }


    render() {
        const {lineup, savings} = this.props

        LineupScreen.refreshNavBar(this.props.navigator, null, lineup)

        //this is not very react compliant, but I didn't find a good way to do it yet
        if (this.props.actions !== this.actions) {
            this.refreshNavigatorButtons()
            this.actions = this.props.actions
        }


        let fetchSrc = this.getFetchSrc(lineup)
        let numColumns = this.state.renderType === 'grid' ? 3 : 1
        return (
            <View style={styles.container}>
                <Feed
                    key={"lineup-" + this.state.renderType}
                    data={savings}
                    renderItem={this.state.renderType === 'grid' ? this.renderItemGrid.bind(this) : this.renderItemStream.bind(this)}
                    fetchSrc={fetchSrc}
                    hasMore={true}
                    ListEmptyComponent={<Text style={STYLES.empty_message}>{i18n.t("empty.lineup")}</Text>}
                    numColumns={numColumns}
                    ItemSeparatorComponent={TRANSPARENT_SPACER(SPACER)}
                    style={{flex: 1, backgroundColor: Colors.white}}
                    ListHeaderComponent={
                        (
                            <View>
                                <LineupHeader lineup={lineup} navigator={this.props.navigator} />
                                <FeedSeparator/>
                                <ListColumnsSelector size={30}
                                                     onTabPressed={index => this.setState({renderType: index === 0 ? 'grid' : 'stream'})}/>
                                <FeedSeparator/>
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

        if (!saving['built']) return null;

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
        let image = _.get(item, 'resource.image')
        const layout = LineupScreen.calcGridLayout(__DEVICE_WIDTH__, 3)
        index = index % layout.numColumns
        let styles = this.obtainGridStyles(layout)

        return (
            <GTouchable style={[styles.gridCellCommon, index === 0 ? styles.gridCellL : index === layout.numColumns ? styles.gridCellR : null ]}
                        onPress={() => seeActivityDetails(this.props.navigator, item)}>
                <CachedImage
                    source={{uri: image, }}
                    style={[styles.gridImg]}
                    resizeMode='cover'
                    fallbackSource={require('../../img/goodsh_placeholder.png')}/>
            </GTouchable>
        )
    }


    gridStyles = {}

    obtainGridStyles(layout: any) {
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





