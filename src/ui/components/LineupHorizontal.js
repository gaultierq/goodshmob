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
import {List} from "../../types"
import {logged} from "../../managers/CurrentUser"
import {CheckBox, SearchBar} from 'react-native-elements'
import {Navigation} from 'react-native-navigation';
import {displayActivityActions, seeActivityDetails, seeList} from "../Nav";
import {Colors} from "../colors";
import LineupTitle from "../components/LineupTitle";
import Feed from "../components/feed";
import LineupCellSaving from "../components/LineupCellSaving";

import GTouchable from "../GTouchable";
import Icon from 'react-native-vector-icons/FontAwesome';
import {UpdateTracker} from "../UpdateTracker";
import StoreManager from "../../managers/StoreManager";
// $FlowFixMe
type Props = {
    navigator: RNNNavigator,
    // lineup: List,
    lineupId: Id,
    renderMenuButton?: () => Node,
    skipLineupTitle: boolean,
    onPressEmptyLineup?: () => void,
    onSavingPressed?: ?(navigator: RNNNavigator, saving: Saving) => void,
    renderSaving: (saving:Saving) => Node,
    renderTitle: (lineup: Lineup) => Node,
    style?: *,
};

type State = {
};

@connect(state => ({
    data: state.data,
    pending: state.pending,
}))
@logged
export default class LineupHorizontal extends Component<Props, State> {

    updateTracker: UpdateTracker;

    static defaultProps = {
        skipLineupTitle: false,
        renderTitle: (lineup: Lineup) => <LineupTitle lineup={lineup}/>
    }

    constructor(props: Props) {
        super(props);
        this.updateTracker = new UpdateTracker(
            nextProps => this.makeRefObject(nextProps),
        );
    }

    render() {
        this.updateTracker.onRender(this.props);

        const {renderTitle, renderMenuButton, skipLineupTitle, lineupId} = this.props;

        let {lineup, savings} = StoreManager.getLineupAndSavings(lineupId);
        if (!lineup) return null;

        return (
            <View style={this.props.style}>
                {
                    !skipLineupTitle &&

                    <View style={{flexDirection:'row', paddingLeft: 15, paddingRight: 15}}>
                        {renderTitle(lineup)}
                        {renderMenuButton && renderMenuButton()}
                    </View>
                }
                {this.renderList(lineup, savings)}
            </View>
        )
    }

    renderList(list: Lineup, savings: Array<Saving>) {
        if (_.isEmpty(savings)) {
            return this.renderEmptyList(list)
        }

        return <Feed
            data={savings}
            renderItem={({item}) => this.props.renderSaving(item)}
            hasMore={false}
            horizontal={true}
            ItemSeparatorComponent={()=> <View style={{width: 10, height: 10}} />}
            contentContainerStyle={{paddingLeft: 15}}
            showsHorizontalScrollIndicator={false}
            // cannotFetch={!super.isVisible()}
        />
    }

    //TODO: move out of LineupHorizontal, as a prop
    renderEmptyList(list: List) {
        let result = [];
        //
        const onPressEmptyLineup = this.props.onPressEmptyLineup;
        for (let i = 0; i < 5; i++) {
            result.push(<View key={`key-${i}`} style={[
                LineupCellSaving.styles.cell,
                {
                    backgroundColor: Colors.grey3,
                    marginRight: 10,
                    opacity: 1 - (0.2 * i),
                    alignItems: 'center',
                    justifyContent:'center'
                }
            ]}>
                { i === 0 && onPressEmptyLineup && <Icon name="plus" size={45} color={Colors.dirtyWhite}/>}
            </View>);
        }
        return (<GTouchable
            disabled={!onPressEmptyLineup || list.pending}
            onPress={() => {
                onPressEmptyLineup && onPressEmptyLineup()
            }
            }>
            <View style={{flexDirection: 'row', paddingLeft: 15}}>{result}</View>
        </GTouchable>);
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
    navigator: RNNNavigator
}
export const LineupH1 = connect()((props: Props1) => {
    const {lineup, navigator, ...attr} = props;
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
            {...attr}
        />
    </GTouchable>
});
