// @flow

import React from 'react';
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
import ActionButton from 'react-native-action-button';
import {LineupListScreen} from './lineuplist'
import type {Id, RNNNavigator, Saving, SearchToken} from "../../types";
import {List} from "../../types"
import {BACKGROUND_COLOR, NavStyles, renderSimpleButton, STYLES} from "../UIStyles";
import {currentGoodshboxId, currentUserId} from "../../managers/CurrentUser"
import {CheckBox, SearchBar} from 'react-native-elements'
import {Navigation} from 'react-native-navigation';
import type {Visibility} from "./additem";
import * as Nav from "../Nav";
import {seeActivityDetails, seeList, startAddItem} from "../Nav";
import Screen from "../components/Screen";
import {Colors} from "../colors";
import {PROFILE_CLICKED} from "../components/MyAvatar";
import {SFP_TEXT_MEDIUM} from "../fonts";

import GTouchable from "../GTouchable";
import AddLineupComponent from "../components/addlineup";
import type {OnBoardingStep} from "../../managers/OnBoardingManager";
import OnBoardingManager from "../../managers/OnBoardingManager";
// $FlowFixMe
import LineupHorizontal from "../components/LineupHorizontal";


type Props = {
    userId: Id,
    navigator: RNNNavigator
};

type State = {
    newLineupTitle?: string,
    newLineupPrivacy?: Visibility,
    filter?: ?string
};

export default class UserLineups extends Screen<Props, State> {

    launchSearch(token?: SearchToken) {
        let navigator = this.props.navigator;

        navigator.showModal({
            screen: 'goodsh.HomeSearchScreen', // unique ID registered with Navigation.registerScreen
            animationType: 'none',
            backButtonHidden: true,
            passProps: {
                onClickClose: () => navigator.dismissModal({animationType: 'none'}),
                token
            },
            backButtonHidden: true,
            navigatorButtons: {
                leftButtons: [],
                rightButtons: [
                    {
                        id: Nav.CLOSE_MODAL,
                        title: i18n.t("actions.cancel")
                    }
                ],
            },
            //
            // navigatorButtons: Nav.CANCELABLE_SEARCH_MODAL(),
        });
    }


    render() {

        // if (onBoardingStep === 'no_spam') return <NoSpamDialog/>

        const navigator = this.props.navigator;

        return (

            <LineupListScreen

                onLineupPressed={(lineup) => seeList(navigator, lineup)}
                onSavingPressed={(saving) => seeActivityDetails(navigator, saving)}
                scrollUpOnBack={super.isVisible() ? ()=>false : null}

                cannotFetch={false}
                visible={true}

                renderSectionHeader={({section}) => this.renderSectionHeader(section)}
                renderSectionFooter={()=> <View style={{height: 25, width: "100%"}} />}
                ItemSeparatorComponent={()=> <View style={{margin: 6}} />}

                filter={this.filter()}

                {...this.props}
            />

        );
    }

    filter() {
        return {
            placeholder: 'search.in_feed',
            onSearch: (searchToken: string) => {
                this.launchSearch(searchToken);
            },
            emptyFilterResult: (searchToken: string) => (
                <View>
                    <Text style={STYLES.empty_message}>{i18n.t('lineups.filter.empty')}</Text>
                    {renderSimpleButton(i18n.t('lineups.filter.deepsearch'), () => this.launchSearch(searchToken))}
                </View>
            ),
            style: {
                backgroundColor: NavStyles.navBarBackgroundColor,
                paddingTop: 5,
                paddingBottom: 5,
                elevation: 3,
                paddingLeft: 9,
                paddingRight: 9,
                borderBottomWidth: 1,
                borderBottomColor: Colors.grey3
            },
            applyFilter: (sections, filter) => {
                let contains = (container, token) => {
                    if (!container || !token) return false;
                    return container.toLowerCase().indexOf(token.toLowerCase()) >= 0;
                };

                let filterSavings = savings => {
                    return _.filter(savings, saving => saving && saving.resource && contains(saving.resource.title, filter))
                };

                let filterLineup = lineups => {
                    let result = [];
                    _.forEach(lineups, lineup => {
                        if (contains(lineup.name, filter)) {
                            result.push(lineup);
                        }
                        else {
                            let savings = filterSavings(lineup.savings);
                            if (!_.isEmpty(savings)) {
                                result.push({...lineup, savings});
                            }
                        }
                    });
                    return result;
                };


                let result = [];
                sections.forEach(section => {

                    const filteredLineups = filterLineup(section.data);

                    if (!_.isEmpty(filteredLineups)) {
                        result.push({...section, data: filteredLineups});
                    }

                });
                return result;
            }
        };
    }

// render() {return <View style={{width: 50, height: 50, backgroundColor: BACKGROUND_COLOR}}/>}

    renderSectionHeader({title, subtitle, onPress, renderSectionHeaderChildren}) {
        return (<GTouchable
            disabled={!onPress}
            onPress={onPress}>
            <View style={{
                backgroundColor: BACKGROUND_COLOR,
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingLeft: 15,
                paddingRight: 15,
                paddingTop: 15,
                paddingBottom: 10,
            }}>
                <Text style={{
                    fontSize: 20,
                    fontFamily: SFP_TEXT_MEDIUM
                }}>
                    {title}
                    {subtitle && <Text style={{fontSize: 16, color: Colors.greyish}}>{subtitle}</Text>}
                </Text>
                {renderSectionHeaderChildren && renderSectionHeaderChildren()}
            </View>
        </GTouchable>);
    }

}
