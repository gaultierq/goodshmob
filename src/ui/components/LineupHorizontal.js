// @flow

import type {Node} from 'react'
import React, {Component} from 'react'
import {
    Alert,
    BackHandler,
    Button,
    Dimensions,
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
import type {Id, Lineup, RNNNavigator, Saving} from "../../types"
import {ViewStyle} from "../../types"
import {logged} from "../../managers/CurrentUser"
import {Navigation} from 'react-native-navigation'
import {displayActivityActions, seeActivityDetails, seeList} from "../Nav"
import {Colors} from "../colors"
import Feed from "../components/feed"
import LineupCellSaving from "../components/LineupCellSaving"

import GTouchable from "../GTouchable"
import {EmptyCell} from "./LineupCellSaving"
import {LINEUP_PADDING} from "../UIStyles"
import {renderLineupMenu} from "../UIComponents"
import LineupTitle2 from "./LineupTitle2"
import {createSelector} from "reselect"
import * as Api from "../../managers/Api"
import {FETCH_LINEUP, fetchLineup} from "../lineup/actions"
import {LINEUP_AND_SAVING_SELECTOR} from "../../helpers/ModelUtils"

// $FlowFixMe
type Props = {
    //merge these 2 into one
    lineupId: Id,
    lineup?: Lineup, //incomplete data (coming from algolia ?)

    savings?: Saving[],
    // dataResolver: Id => {lineup: Lineup, savings: Array<Saving>},
    renderMenuButton?: () => Node,
    skipLineupTitle?: boolean,
    onPressEmptyLineup?: () => void,
    onSavingPressed?:(navigator: RNNNavigator, saving: Saving) => void,
    renderSaving?: (saving:Saving) => Node,
    renderTitle: (lineup: Lineup) => Node,
    style?: ViewStyle,
    renderEmpty: (list: Lineup) => Node,
};

type State = {
};

export const ITEM_SEP = 10

let lineupId = props => props.lineupId || props.lineup.id


@connect((state, props) => ({
    pending: state.pending,
    ...LINEUP_AND_SAVING_SELECTOR(state, props)
}))
@logged
export default class LineupHorizontal extends Component<Props, State> {

    // updateTracker: UpdateTracker;

    static defaultProps = {
        skipLineupTitle: false,
        renderTitle: default_renderTitle,
        renderSaving: saving => <LineupCellSaving item={saving.resource} />,
        renderEmpty: (list: Lineup) => LineupHorizontal.defaultRenderEmpty()
    }

    constructor(props: Props) {
        super(props);
        // this.updateTracker = new UpdateTracker(
        //     nextProps => this.makeRefObject(nextProps),
        // );
    }

    componentDidMount() {
        if (!this.props.lineup || !this.props.savings) {
            console.info("missing data, fetching the lineup")
            const listId = lineupId(this.props)
            Api.safeDispatchAction.call(
                this,
                this.props.dispatch,
                fetchLineup(listId).createActionDispatchee(FETCH_LINEUP, {listId: listId}),
                'fetchLineup'
            )
        }
    }

    render() {
        // this.updateTracker.onRender(this.props);

        const {lineup, savings, renderTitle, renderMenuButton, skipLineupTitle, lineupId, style, ...attributes} = this.props;
        //let {lineup, savings} = this.props.dataResolver(lineupId);
        if (!lineup) {
            console.warn('lineup not found for id', lineupId)
            return null;
        }

        return (
            <View style={[style]}>
                {
                    !skipLineupTitle &&

                    <View style={{flexDirection:'row', paddingHorizontal: LINEUP_PADDING}}>
                        {renderTitle(lineup)}
                        {renderMenuButton && renderMenuButton()}
                    </View>
                }
                {/*{this.renderList(lineup, savings)}*/}
                {_.isEmpty(savings) ? this.props.renderEmpty(lineup) :
                    <Feed
                        data={savings}
                        renderItem={({item}) => this.props.renderSaving(item)}
                        hasMore={false}
                        horizontal={true}
                        ItemSeparatorComponent={()=> <View style={{width: ITEM_SEP}} />}
                        contentContainerStyle={{paddingLeft: LINEUP_PADDING}}
                        showsHorizontalScrollIndicator={false}
                        {...attributes}
                    />
                }
            </View>
        )
    }


    static defaultRenderEmpty(renderFirstAsPlus: boolean = false) {
        return (
            <View style={{flexDirection: 'row', paddingLeft: LINEUP_PADDING}}>{
                [0,1,2,3,4].map((o, i) => (
                        <EmptyCell key={`key-${i}`} style={{marginRight: 10}}>
                            {i === 0 && renderFirstAsPlus && this.renderInnerPlus()}
                        </EmptyCell>
                    )
                )
            }</View>
        )
    }

    static renderPlus(props: any = {}) {
        return (<EmptyCell key={`key-${0}`} {...props}>{this.renderInnerPlus()}</EmptyCell>)
    }

    static renderInnerPlus() {
        const size = "60%"
        const plusThickness = '8%'
        let plusColor = Colors.white
        return <View style={{
            position: 'absolute',
            width: size,
            height: size,
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <Image source={require('./../../img2/plus_white.png')} />
        </View>;
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
            lineupId={lineup.id}
            renderSaving={saving => (
                <GTouchable
                    onPress={() => seeActivityDetails(navigator, saving)}
                    onLongPress={saving.pending ? null : ()=> {
                        displayActivityActions(navigator, props.dispatch, saving.id, saving.type)
                    }}
                >
                    <LineupCellSaving item={saving.resource} />
                </GTouchable>
            )}
            renderMenuButton={renderLineupMenu(navigator, dispatch, lineup)}
            {...attr}
        />
    </GTouchable>
});


export function default_renderTitle(lineup: Lineup) {
    return <LineupTitle2
        lineupId={lineup.id}
        dataResolver={id => lineup}
    />
}
