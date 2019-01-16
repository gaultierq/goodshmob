// @flow

import type {Node} from 'react'
import React, {Component} from 'react'
import {
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native'

import {connect} from "react-redux"
import type {Lineup, RNNNavigator, Saving} from "../../types"
import {ViewStyle} from "../../types"
import {currentGoodshboxId, logged} from "../../managers/CurrentUser"
import {Navigation} from 'react-native-navigation'
import {displayLineupActionMenu, displaySavingActions, displayShareLineup, seeActivityDetails, seeList} from "../Nav"
import LineupCellSaving from "../components/LineupCellSaving"

import GTouchable from "../GTouchable"
import {EmptyCell} from "./LineupCellSaving"
import {LINEUP_PADDING} from "../UIStyles"
import {InnerPlus, renderLineupMenu} from "../UIComponents"
import LineupTitle from "./LineupTitle"
import {
    LINEUP_ACTIONS_SELECTOR,
    LINEUP_AUTHOR,
    LINEUP_SELECTOR,
    lineupIdExtract,
    LIST_SAVINGS_SELECTOR
} from "../../helpers/Selectors"
import {Colors} from "../colors"
import {FETCH_LINEUP, fetchLineup} from "../lineup/actions"
import * as Api from "../../managers/Api"
import {GLineupAction, L_SHARE} from "../lineupRights"
import {pressToSeeLineup} from "../../managers/Links"

// $FlowFixMe
type Props = {
    lineup: Lineup,
    savings?: Saving[],
    // dataResolver: Id => {lineup: Lineup, savings: Array<Saving>},
    renderMenuButton?: GLineupAction[] => Node,
    skipLineupTitle?: boolean,
    onPressEmptyLineup?: () => void,
    onSavingPressed?:(navigator: RNNNavigator, saving: Saving) => void,
    renderSaving?: (saving:Saving) => Node,
    renderTitle?: (lineup: Lineup) => Node,
    style?: ViewStyle,
    renderEmpty?: (list: Lineup) => Node,
    renderTouchable?: (saving: Saving, node: Node) => Node,
    seeable?: boolean
};

type State = {
    renderSaving: (saving:Saving) => Node,
    renderTouchable?: (saving: Saving, node: ?Node) => ?Node,
}

export const ITEM_SEP = 10

@connect(() => {

    const lineup = LINEUP_SELECTOR()
    const author = LINEUP_AUTHOR()
    const savings = LIST_SAVINGS_SELECTOR()
    const actions = LINEUP_ACTIONS_SELECTOR()

    return (state, props) => ({
        lineup: lineup(state, props),
        author: author(state, props),
        savings: savings(state, props),
        actions: actions(state, props),
    })
})
@logged
export default class LineupHorizontal extends Component<Props, State> {

    render() {
        return <LineupHorizontalPure {...this.props} />
    }
}


//same as above, but read its data from props only
@connect()
export class LineupHorizontalPure extends Component<Props, State> {

    static defaultProps = {
        skipLineupTitle: false,
        renderTitle: lineup => <LineupTitle lineup={lineup}/>,
        renderEmpty: (list: Lineup) => defaultRenderEmpty(),

    }

    constructor(props: Props) {
        super(props)
        this.state = {
            renderSaving: this.props.renderSaving || this._renderDefaultSaving,
            renderTouchable: this.props.renderTouchable || ((saving, node) => node)
        }
    }

    componentDidMount() {
        if (!this.props.lineup || !this.props.savings) {
            const listId = lineupIdExtract(this.props)
            Api.safeDispatchAction.call(this,this.props.dispatch,
                fetchLineup(listId).createActionDispatchee(FETCH_LINEUP, {listId: listId}),
                'fetchLineup'
            )
        }
    }

    render() {

        const {
            lineup,
            savings,
            renderTitle,
            renderMenuButton,
            skipLineupTitle,
            style,
            actions,
            seeable,
            ...attributes
        } = this.props;

        if (!lineup) {
            console.warn('lineup not found for id', lineupIdExtract)
            return null;
        }

        return (
            <GTouchable
                deactivated={!seeable}
                style={[style]}
                onPress={seeable ? pressToSeeLineup(lineup) : null}>
                <View>
                    {
                        !skipLineupTitle &&

                        <View style={{flexDirection:'row', paddingHorizontal: LINEUP_PADDING}}>
                            {renderTitle && renderTitle(lineup)}
                            {renderMenuButton && renderMenuButton(actions)}
                        </View>
                    }
                    {/* TODO EmptyComponent does not work for some reason*/}
                    {_.isEmpty(savings) ? this.props.renderEmpty(lineup) :
                        <FlatList
                            data={savings}
                            renderItem={this._renderItem}
                            horizontal={true}
                            ItemSeparatorComponent={() => <View style={{width: ITEM_SEP}}/>}
                            contentContainerStyle={{paddingLeft: LINEUP_PADDING}}
                            showsHorizontalScrollIndicator={false}
                            {...attributes}
                        />
                    }
                </View>
            </GTouchable>
        )
    }

    _renderItem = ({item}) => {
        let node = this.state.renderSaving(item)
        return this.state.renderTouchable(item, node)
    }

    _renderDefaultSaving = saving => {
        let lAuthorId = _.get(this.props, 'author.id')
        let sAuthorId = _.get(saving, 'user.id')
        let author = lAuthorId && sAuthorId && lAuthorId !== sAuthorId ? {id: sAuthorId} : null

        return (
            <LineupCellSaving item={saving.resource} author={author}/>
        )
    }

}

export type Props1 = {
    lineup: Lineup,
    dispatch: any,
    navigator: RNNNavigator
}
export const LineupH1 = connect()((props: Props1) => {
    const {lineup, dispatch, navigator, ...attr} = props;
    if (!lineup) return null
    return (
        <LineupHorizontal
            seeable
            lineup={lineup}
            renderMenuButton={(actions) => renderLineupMenu(navigator, dispatch, lineup, actions)}
            renderTouchable={(saving: Saving, child) => (<GTouchable
                disabled={!!saving.pending}
                onPress={() => seeActivityDetails(navigator, saving)}
                onLongPress={saving.pending ? null : ()=> {
                    displaySavingActions(navigator, props.dispatch, saving.id, saving.type)
                }}
            >
                {child}
            </GTouchable>)}
            {...attr}
        />
    )
});

export function defaultRenderEmpty(renderFirstAsPlus: boolean = false, plusRef?: () => void) {
    return (
        <View style={{flexDirection: 'row', paddingLeft: LINEUP_PADDING,}}>{
            [0,1,2,3,4].map((o, i) => {
                    return (
                        <EmptyCell key={`empty-${i}`} style={{marginRight: 10}}>
                            {i === 0 && renderFirstAsPlus && renderInnerPlus(plusRef)}
                        </EmptyCell>
                    )
                }
            )
        }</View>
    )
}

export function renderInnerPlus(ref?: () => void) {
    return (
        <InnerPlus ref={ref} plusStyle={{backgroundColor: Colors.white, borderRadius: 4,}}/>
    )
}

export function renderLineupMenuButton(item: Lineup, actions: GLineupAction[], navigator: RNNNavigator, dispatch:any) {
    //TODO: use right manager
    if (!item || item.id === currentGoodshboxId()) return null;

    return (
        <View style={{
            flex: 0,
            flexDirection: 'row',
            // backgroundColor: 'red',
            // height: 36,
            alignItems: 'center',
        }}>
            <GTouchable
                style={{
                    paddingHorizontal: 8,
                    // backgroundColor: 'yellow',
                    justifyContent: 'center',
                }}
                onPress={() => {
                    displayShareLineup({
                        navigator: navigator,
                        lineup: item
                    })
                }}>
                <View style={{flex: 1, justifyContent: 'flex-start'}}>
                    <Image source={require('../../img2/share-small.png')} resizeMode="contain"
                           style={{height: 18, tintColor: Colors.brownishGrey, }} />
                </View>

            </GTouchable>
            <GTouchable style={{
                paddingLeft: 0,
                // backgroundColor: 'green',
                justifyContent: 'center',
            }}
                        onPress={() => displayLineupActionMenu(navigator, dispatch, item, _.filter(actions, a => a !== L_SHARE))}>
                <View style={{flex: 1, justifyContent: 'flex-start', paddingTop: 12}}>
                    <Image source={require('../../img2/sidedots.png')} resizeMode="contain"
                           style={{width: 17, tintColor: Colors.brownishGrey}}/>
                </View>
            </GTouchable>
        </View>
    )
}
