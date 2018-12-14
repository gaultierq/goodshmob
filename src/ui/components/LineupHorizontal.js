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
import {logged} from "../../managers/CurrentUser"
import {Navigation} from 'react-native-navigation'
import {displaySavingActions, seeActivityDetails, seeList} from "../Nav"
import LineupCellSaving from "../components/LineupCellSaving"

import GTouchable from "../GTouchable"
import {EmptyCell} from "./LineupCellSaving"
import {LINEUP_PADDING} from "../UIStyles"
import {InnerPlus, renderLineupMenu} from "../UIComponents"
import LineupTitle2 from "./LineupTitle2"
import {LINEUP_SELECTOR, SAVING_LIST_SELECTOR} from "../../helpers/Selectors"
import {Colors} from "../colors"
import {createStructuredSelector} from "reselect"
import {FETCH_LINEUP, fetchLineup} from "../lineup/actions"
import * as Api from "../../managers/Api"

// $FlowFixMe
type Props = {
    lineup: Lineup,
    savings?: Saving[],
    // dataResolver: Id => {lineup: Lineup, savings: Array<Saving>},
    renderMenuButton?: () => Node,
    skipLineupTitle?: boolean,
    onPressEmptyLineup?: () => void,
    onSavingPressed?:(navigator: RNNNavigator, saving: Saving) => void,
    renderSaving?: (saving:Saving) => Node,
    renderTitle?: (lineup: Lineup) => Node,
    style?: ViewStyle,
    renderEmpty: (list: Lineup) => Node,
};

type State = {
};

export const ITEM_SEP = 10

let lineupId = props => props.lineupId || props.lineup.id


@connect(() => {
    const lineup = LINEUP_SELECTOR()
    const savings = SAVING_LIST_SELECTOR()
    return (state, props) => ({
        lineup: lineup(state, props),
        savings: savings(state, props),
    })
})
@logged
export default class LineupHorizontal extends Component<Props, State> {

    static defaultProps = {
        skipLineupTitle: false,
        renderTitle: lineup => <LineupTitle2 lineup={lineup}/>,
        renderSaving: saving => <LineupCellSaving item={saving.resource} />,
        renderEmpty: (list: Lineup) => LineupHorizontal.defaultRenderEmpty()
    }

    componentDidMount() {
        if (!this.props.lineup || !this.props.savings) {
            const listId = lineupId(this.props)
            Api.safeDispatchAction.call(this,this.props.dispatch,
                fetchLineup(listId).createActionDispatchee(FETCH_LINEUP, {listId: listId}),
                'fetchLineup'
            )
        }
    }

    render() {

        const {
            lineup, savings,
            renderTitle, renderMenuButton,
            skipLineupTitle, style, ...attributes} = this.props;

        if (!lineup) {
            console.warn('lineup not found for id', lineupId)
            return null;
        }

        // console.info('savings', savings)

        return (
            <View style={[style]}>
                {
                    !skipLineupTitle &&

                    <View style={{flexDirection:'row', paddingHorizontal: LINEUP_PADDING}}>
                        {renderTitle && renderTitle(lineup)}
                        {renderMenuButton && renderMenuButton()}
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
                        // EmptyComponent={this.props.renderEmpty(lineup)}
                        {...attributes}
                    />
                }
            </View>
        )
    }

    _renderItem = ({item}) => {
        return this.props.renderSaving(item.saving)
    }

    static defaultRenderEmpty(renderFirstAsPlus: boolean = false, plusRef?: () => void) {
        return (
            <View style={{flexDirection: 'row', paddingLeft: LINEUP_PADDING,}}>{
                [0,1,2,3,4].map((o, i) => {
                        return (
                            <EmptyCell key={`empty-${i}`} style={{marginRight: 10}}>
                                {i === 0 && renderFirstAsPlus && this.renderInnerPlus(plusRef)}
                            </EmptyCell>
                        )
                    }
                )
            }</View>
        )
    }

    static renderPlus(cellProps: any, ref?: () => void) {
        return (
            <EmptyCell key={`key-${0}`} {...cellProps}>
                {this.renderInnerPlus(ref)}
            </EmptyCell>
        )
    }

    static renderInnerPlus(ref?: () => void) {
        return (
            <InnerPlus ref={ref} plusStyle={{backgroundColor: Colors.white, borderRadius: 4,}}/>
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
    return <GTouchable onPress={()=>seeList(navigator, lineup)}>

        <LineupHorizontal
            lineup={lineup}
            renderSaving={saving => (
                <GTouchable
                    onPress={() => seeActivityDetails(navigator, saving)}
                    onLongPress={saving.pending ? null : ()=> {
                        displaySavingActions(navigator, props.dispatch, saving.id, saving.type)
                    }}
                >
                    <LineupCellSaving item={saving.resource} />
                </GTouchable>
            )}
            renderMenuButton={() => renderLineupMenu(navigator, dispatch, lineup)}
            {...attr}
        />
    </GTouchable>
});
