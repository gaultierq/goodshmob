// @flow

import type {Node} from 'react';
import React, {Component} from 'react';
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
} from 'react-native';

import {connect} from "react-redux";
import type {Id, Lineup, RNNNavigator, Saving} from "../../types";
import {logged} from "../../managers/CurrentUser"
import {Navigation} from 'react-native-navigation';
import {displayActivityActions, seeActivityDetails, seeList} from "../Nav";
import {Colors} from "../colors";
import Feed from "../components/feed";
import LineupCellSaving from "../components/LineupCellSaving";

import GTouchable from "../GTouchable";
import {UpdateTracker} from "../UpdateTracker";
import StoreManager from "../../managers/StoreManager";
import {EmptyCell} from "./LineupCellSaving";
import {LINEUP_PADDING} from "../UIStyles";
import {renderLineupMenu} from "../UIComponents";
import LineupTitle2 from "./LineupTitle2";
import {ViewStyle} from "../../types";

// $FlowFixMe
type Props = {
    lineupId: Id,
    dataResolver: Id => {lineup: Lineup, savings: Array<Saving>},
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


@connect(state => ({
    data: state.data,
    pending: state.pending,
}))
@logged
export default class LineupHorizontal extends Component<Props, State> {

    updateTracker: UpdateTracker;

    static defaultProps = {
        skipLineupTitle: false,
        renderTitle: default_renderTitle,
        renderSaving: saving => <LineupCellSaving item={saving.resource} />,
        dataResolver: lineupId => StoreManager.getLineupAndSavings(lineupId),
        renderEmpty: (list: Lineup) => LineupHorizontal.defaultRenderEmpty()
    }

    constructor(props: Props) {
        super(props);
        this.updateTracker = new UpdateTracker(
            nextProps => this.makeRefObject(nextProps),
        );
    }

    render() {
        this.updateTracker.onRender(this.props);

        const {renderTitle, renderMenuButton, skipLineupTitle, lineupId, style, data, ...attributes} = this.props;

        let {lineup, savings} = this.props.dataResolver(lineupId);
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
                        this.renderEmptyCell(i, renderFirstAsPlus)
                    )
                )
            }</View>
        )
    }

    static renderEmptyCell(i: number, renderFirstAsPlus: boolean = false) {
        return (
            <EmptyCell key={`key-${i}`} style={
                [
                    {
                        marginRight: 10,
                        backgroundColor: `rgba(200,200,200,${0.2 * i})`,
                    },
                    i === 0 && {borderWidth: 0}
                ]
            }>
                {i === 0 && renderFirstAsPlus && this.renderPlus(Colors.greyishBrown)}
            </EmptyCell>
        )
    }

    static renderPlus(plusColor) {
        const size = '90%';
        const plusThickness = '3%'
        return <View style={{
            position: 'absolute',
            width: size,
            height: size,
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <View style={{
                width: plusThickness,
                height: size,
                backgroundColor: plusColor,
            }}/>
            <View style={{
                height: plusThickness,
                width: size,
                backgroundColor: plusColor,
                position: 'absolute',
            }}/>
        </View>;
    }

    makeRefObject(nextProps:Props) {
        // return null;
        const lineupId = _.get(nextProps, 'lineupId');
        if (!lineupId) return null;

        let getRefKeys = () => {
            let base = `data.lists.${lineupId}`;
            return [base, `${base}.meta`];
        };

        let result = getRefKeys().map(k=>_.get(nextProps, k));

        //TODO: deal with pendings
        let allPendings = _.values(_.get(nextProps, 'pending', {}));
        // //[[create_ask1, create_ask2, ...], [create_comment1, create_comment2, ...], ...]
        //
        let scopedPendings = [];
        _.reduce(allPendings, (res, pendingList) => {

            let filteredPendingList = _.filter(pendingList, pending => {
                const scope = _.get(pending, "options.scope");
                if (!scope) return false;
                return scope.lineupId === lineupId;
            });

            res.push(...filteredPendingList);
            return res;
        }, scopedPendings);
        result.push(...scopedPendings);

        return result;
    }

    shouldComponentUpdate(nextProps: Props, nextState: State) {
        return this.updateTracker.shouldComponentUpdate(nextProps);
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