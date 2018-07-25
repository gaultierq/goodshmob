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
import {BACKGROUND_COLOR, LINEUP_PADDING, STYLES} from "../UIStyles"
import {currentGoodshboxId, currentUserId, logged} from "../../managers/CurrentUser"
import {Navigation} from 'react-native-navigation'
import {displayLineupActionMenu, displayShareLineup, seeList, startAddItem} from "../Nav"
import Screen from "../components/Screen"

import GTouchable from "../GTouchable"
import AddLineupComponent from "../components/addlineup"
import LineupHorizontal, {LineupH1} from "../components/LineupHorizontal"
import UserLineups from "./userLineups"
import {TipConfig} from "../components/Tip"
import LineupTitle2 from "../components/LineupTitle2"
import {SFP_TEXT_MEDIUM} from "../fonts"
import {LINEUP_SECTIONS} from "../UIComponents"
import {L_SHARE} from "../lineupRights"
import {Colors} from "../colors"


type Props = {
    navigator: RNNNavigator
};

type State = {
    isActionButtonVisible?: boolean,
    filterFocused?: boolean,
    currentTip?:TipConfig
};


@logged
@connect(state=>({
    config: state.config,
    onBoarding: state.onBoarding,
}))
export default class MyGoodsh extends Screen<Props, State> {


    state = {
    }

    render() {
        const userId = currentUserId();
        const {navigator, dispatch, ...attributes}= this.props;

        return (
            // $FlowFixMe
            <UserLineups
                contentOffset={{x: 0, y: 50}}
                displayName={"MyGoodsh"}
                feedId={"home list"}
                userId={userId}
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
                            onPress: () => seeList(navigator, goodshbox),
                            renderItem: ({item, index}) => (
                                <LineupH1
                                    lineup={item}
                                    navigator={navigator}
                                    skipLineupTitle={true}
                                    renderEmpty={this.renderEmptyLineup(navigator, item)}
                                />
                            ),
                            renderSectionHeader: () => this.renderSectionHeader(
                                i18n.t("lineups.goodsh.title"),
                            )
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

                {...attributes}
            />

        );
    }

    renderSectionHeader(name: string, children?: Node) {
        return (
            <View style={{
                flexDirection: 'row',
                backgroundColor: BACKGROUND_COLOR,
                paddingHorizontal: LINEUP_PADDING,
                paddingVertical: 8
            }}>
                <Text style={{
                    fontSize: 24,
                    fontFamily: SFP_TEXT_MEDIUM,
                    // color: Colors.brownishGrey,
                }}>{name}</Text>
                {children}
            </View>
        );
    }

    renderLineup(item: Lineup, index: number, navigator: RNNNavigator, targetRef?: any) {
        return (
            <LineupH1
                lineup={item} navigator={navigator}
                withMenuButton={true}
                onPressEmptyLineup={() => startAddItem(navigator, item)}
                renderEmpty={this.renderEmptyLineup(navigator, item, targetRef)}
                renderMenuButton={() => {
                    return this.renderMenuButton(item)
                }}
                renderTitle={(lineup: Lineup) => (
                    <LineupTitle2
                        lineupId={lineup.id}
                        dataResolver={id => lineup}
                        style={{
                            marginBottom: 10,
                            paddingRight: 30,
                            // backgroundColor: 'blue',
                        }}
                    />
                )}
                ListHeaderComponent={(
                    <GTouchable onPress={() => startAddItem(navigator, item)}>
                        {LineupHorizontal.renderPlus({style:{marginRight: 10}}, targetRef)}
                    </GTouchable>)
                }
                style={[
                    {paddingTop: 8, paddingBottom: 12},
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
                    LineupHorizontal.defaultRenderEmpty(true, targetRefFirstElement)
                }
            </GTouchable>
        );
    }

    renderMenuButton(item: Lineup) {
        //TODO: use right manager
        if (!item || item.id === currentGoodshboxId()) return null;

        return (
            <View style={{
                flex:0,
                flexDirection: 'row',
                // backgroundColor: 'red',
                height: 36,
                alignItems: 'center',
            }}>
                <GTouchable
                    style={{
                        paddingHorizontal: 8,
                        // backgroundColor: 'yellow',
                        paddingVertical: 16,
                    }}
                    onPress={() => {
                        displayShareLineup({
                            navigator: this.props.navigator,
                            lineup: item
                        })
                    }}>
                    <Image source={require('../../img2/share-arrow.png')} resizeMode="contain"/>
                </GTouchable>
                <GTouchable style={{
                    paddingLeft: 0,
                    // backgroundColor: 'green',
                    paddingVertical: 16,
                }} onPress={() => displayLineupActionMenu(this.props.navigator, this.props.dispatch, item, a => a !== L_SHARE)}>
                    <Image source={require('../../img2/sidedots.png')} resizeMode="contain"/>
                </GTouchable>
            </View>
        );
    }
}
