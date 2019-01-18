// @flow

import type {Node} from 'react'
import React from 'react'
import {
    Alert,
    BackHandler,
    Button,
    Dimensions,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'

import {connect} from "react-redux"
import type {Lineup, RNNNavigator} from "../../types"
import {LINEUP_SEP, STYLES} from "../UIStyles"
import {currentUserId, logged} from "../../managers/CurrentUser"
import {Navigation} from 'react-native-navigation'
import {seeList, startAddItem} from "../Nav"
import Screen from "../components/Screen"

import GTouchable from "../GTouchable"
import AddLineupComponent from "../components/addlineup"
import {defaultRenderEmpty, LineupH1, renderInnerPlus, renderLineupMenuButton} from "../components/LineupHorizontal"
import UserLineups from "./userLineups"
import {TipConfig} from "../components/Tip"
import {GLineupAction} from "../lineupRights"
import {Colors} from "../colors"
import {createCounter} from "../../helpers/DebugUtils"
import {EmptyCell} from "../components/LineupCellSaving"
import {renderSectionHeader2, TRANSPARENT_SPACER} from "../UIComponents"


type Props = {
    navigator: RNNNavigator
};

type State = {
    isActionButtonVisible?: boolean,
    filterFocused?: boolean,
    currentTip?:TipConfig
};
const logger = rootlogger.createLogger('MyGoodsh')
const counter = createCounter(logger)

@logged
@connect(state=>({
    config: state.config,
    onBoarding: state.onBoarding,
}))
export default class MyGoodsh extends Screen<Props, State> {

    _spacer = TRANSPARENT_SPACER(LINEUP_SEP)

    state = {
    }

    render() {
        const userId = currentUserId();
        const {navigator, dispatch, ...attributes}= this.props;
        counter('render')

        return (
            // $FlowFixMe
            <UserLineups
                displayName={"MyGoodsh"}
                feedId={"home list"}
                userId={userId}
                // hideFilter={true}
                navigator={navigator}
                ListEmptyComponent={<Text style={STYLES.empty_message}>{i18n.t('lineups.empty_screen')}</Text>}
                renderSectionHeader={({section}) => section.renderSectionHeader()}
                // sectionMaker={LINEUP_SECTIONS(this.props.navigator, this.props.dispatch)}
                sectionMaker={(lineups)=> {
                    const goodshbox = _.head(lineups);
                    let savingCount = _.get(goodshbox, `meta.savingsCount`, 0)
                    const showGoodshbox = _.get(goodshbox, 'savings.length', 0) > 0;

                    return _.compact([
                        showGoodshbox ? {
                            data: [goodshbox],
                            title: i18n.t("lineups.goodsh.title"),
                            subtitle: ` (${savingCount})`,
                            renderItem: ({item, index}) => (
                                <LineupH1
                                    lineup={item}
                                    navigator={navigator}
                                    skipLineupTitle={true}
                                    renderEmpty={this.renderEmptyLineup(navigator, item)}
                                />
                            ),
                            renderSectionHeader: () => <GTouchable onPress={() => seeList(navigator, goodshbox)}>{this.renderSectionHeader(
                                i18n.t("lineups.goodsh.title"),
                            )}</GTouchable>
                        } : false,
                        {
                            data: _.slice(lineups, 1),
                            title: i18n.t("lineups.mine.title"),
                            // renderSectionHeaderChildren:() => <AddLineupComponent navigator={this.props.navigator}/>,
                            renderItem: ({item, index})=> this.renderLineup(item, index, navigator, index > 0 ? null : this.props.targetRef),
                            renderSectionHeader: () => this.renderSectionHeader(
                                i18n.t("lineups.mine.title"),
                                <AddLineupComponent navigator={this.props.navigator} styleText={{color: Colors.greyish}}/>
                            )
                        },
                    ]);
                }}
                ItemSeparatorComponent={this._spacer}
                {...attributes}
            />

        );
    }

    renderSectionHeader(name: string, children?: Node) {
        return renderSectionHeader2(name, children)
    }

    renderLineup(item: Lineup, index: number, navigator: RNNNavigator, targetRef?: any) {
        if (!item) return null
        return (
            <LineupH1
                lineup={item} navigator={navigator}
                onPressEmptyLineup={() => startAddItem(navigator, item)}
                renderEmpty={this.renderEmptyLineup(navigator, item, targetRef)}
                renderMenuButton={(actions) => {
                    return renderLineupMenuButton(item, actions, navigator, this.props.dispatch)
                }}
                ListHeaderComponent={(
                    !item.pending && <GTouchable onPress={() => startAddItem(navigator, item)}>
                        <EmptyCell key={`key-${0}`} style={{marginRight: 10}}>
                            {renderInnerPlus(targetRef)}
                        </EmptyCell>
                    </GTouchable>)
                }
                style={[
                    // {paddingTop: 8, paddingBottom: 12},
                    {backgroundColor: index % 2 === 1 ? 'transparent' : 'rgba(255, 255, 255, 0.3)'},

                ]}
            />)
    }

    renderEmptyLineup(navigator: RNNNavigator, item: Lineup, targetRefFirstElement?: () => void) {
        return (list: Lineup) => (
            <GTouchable
                onPress={() => startAddItem(navigator, item)}
                deactivated={item.pending}
            >
                {
                    defaultRenderEmpty(true, targetRefFirstElement)
                }
            </GTouchable>
        );
    }
}

