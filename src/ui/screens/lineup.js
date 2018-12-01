// @flow

import React from 'react'
import {Image, ImageBackground, Keyboard, ScrollView, StyleSheet, Text, View} from 'react-native'
import {connect} from "react-redux"
import {logged} from "../../managers/CurrentUser"
import {Avatar, getNavButtonForAction, ListColumnsSelector, TRANSPARENT_SPACER} from "../UIComponents"
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
import {Col, Grid, Row} from "react-native-easy-grid"
import GButton from "../components/GButton"
import {LINEUP_PADDING} from "../UIStyles"
import {fullName2} from "../../helpers/StringUtils"
import {SFP_TEXT_BOLD, SFP_TEXT_REGULAR} from "../fonts"

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
        let _p = 0
        const mains = _.remove(actions, a => {
            if (a.priority <= _p) {
                _p = a.priority
                return true
            }
            return false
        })

        return {mains, more}
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

        const layout = this.calcLayout()
        return (
            <View style={styles.container}>


                {this.trucEnHaut(lineup)}
                <FeedSeparator/>

                <ListColumnsSelector size={30}
                                     onTabPressed={index => this.setState({renderType: index === 0 ? 'grid' : 'stream'})}/>

                <FeedSeparator/>

                <Feed
                    key={"lineup-" + this.state.renderType}
                    data={savings}
                    renderItem={this.state.renderType === 'grid' ? this.renderItemGrid.bind(this) : this.renderItemStream.bind(this)}
                    fetchSrc={fetchSrc}
                    hasMore={true}
                    ListEmptyComponent={<Text style={STYLES.empty_message}>{i18n.t("empty.lineup")}</Text>}
                    numColumns={layout.numColumns}
                    ItemSeparatorComponent={TRANSPARENT_SPACER(SPACER)}
                    style={{flex: 1, backgroundColor: Colors.white}}
                />
            </View>
        );
    }

    trucEnHaut(lineup: Lineup) {
        const avatarContainerSize = LINEUP_PADDING * 7
        const user = lineup.user
        const savingsCount = _.get(lineup, 'meta.savingsCount')
        const followersCount = _.get(lineup, 'meta.followersCount')

        const styles = StyleSheet.create({
            counters: {
                fontFamily: SFP_TEXT_BOLD,
                fontSize: 22,
                color: Colors.black,
            },
            counters_names: {
                fontFamily: SFP_TEXT_REGULAR,
                fontSize: 18,
                color: Colors.greyish,
            },
            button: {
                color: Colors.green,
                // backgroundColor: 'red',
                fontFamily: SFP_TEXT_BOLD,
                fontSize: 20,

                borderWidth: 2,
                borderColor: Colors.green,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                // margin: 20,
            },
            userName: {
                alignItems: 'center',
                fontFamily: SFP_TEXT_BOLD,
                color: Colors.greyishBrown,
                fontSize: 15,
            }

        })

        return (
            <View style={{flexDirection: 'row', margin: LINEUP_PADDING}}>
                <View style={{
                    alignItems: 'center',
                    marginRight: LINEUP_PADDING
                }}>
                    <Avatar style={{alignItems: 'center',}} user={user}
                            size={avatarContainerSize}/>
                    <Text style={[{marginTop: 4}, styles.userName]}>{fullName2(user)}</Text>
                </View>

                <View style={{
                    flex: 1,
                    // backgroundColor: 'red',

                }}>
                    <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-around'}}>
                        <View style={{alignItems: 'center',}}>
                            <Text style={[styles.counters]}>{`${savingsCount}`}</Text>
                            <Text style={[styles.counters_names]}>{`éléments`}</Text>
                        </View>
                        <View style={{alignItems: 'center',}}>
                            <Text style={[styles.counters]}>{`${followersCount}`}</Text>
                            <Text style={[styles.counters_names]}>{`abonnés`}</Text>
                        </View>


                    </View>
                    <View style={{
                        // backgroundColor: 'red',
                        flex:1, flexDirection:'row', alignItems: 'flex-start', justifyContent: 'flex-start', }}>
                        <Text onPress={()=>alert('t')} style={[{padding: 8, flex:1}, styles.button]}>Suivre</Text>
                    </View>

                </View>
            </View>
        )
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

    calcLayout() {
        let numColumns = this.state.renderType === 'grid' ? 3 : 1
        let cellWidth = (__DEVICE_WIDTH__ + SPACER) / numColumns - SPACER
        let cellHeight = cellWidth
        return {numColumns, cellWidth, cellHeight}
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
        const layout = this.calcLayout()
        index = index % layout.numColumns
        return (
            <GTouchable style={{
                marginLeft: index > 0 ? SPACER / 2 : 0,
                marginRight: index < layout.numColumns ? SPACER / 2 : 0,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: Colors.greying,

            }} onPress={() => seeActivityDetails(this.props.navigator, item)}>
                <CachedImage
                    source={{uri: image, }}
                    style={[{
                        width: layout.cellWidth,
                        height: layout.cellHeight,
                        backgroundColor: Colors.white,
                        backgroundColor: 'blue',
                        alignSelf: 'center',
                        alignItems: 'center',
                    }
                    ]}
                    resizeMode='cover'
                    fallbackSource={require('../../img/goodsh_placeholder.png')}/>
            </GTouchable>
        )

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


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    description: {
        backgroundColor: 'transparent',
        margin: 10
    },
});


