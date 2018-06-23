// @flow

import React from 'react'
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
    TouchableWithoutFeedback,
    View
} from 'react-native'
import {CheckBox} from 'react-native-elements'
import type {Id, Lineup, RNNNavigator, SearchToken} from "../../types"
import {LINEUP_PADDING, renderSimpleButton, STYLES} from "../UIStyles"
import Screen from "../components/Screen"
import * as Nav from "../Nav"
import {seeActivityDetails, seeList} from "../Nav"
import type {Props as LineupListProps} from './lineuplist'
import {LineupListScreen} from './lineuplist'
import {Navigation} from 'react-native-navigation'
import type {Visibility} from "./additem"
import type {FilterConfig} from "../components/feed"
import GSearchBar2 from "../components/GSearchBar2"
import {displayHomeSearch} from "../Nav"


type Props = LineupListProps & {
    userId: Id,
    navigator: RNNNavigator,
    listRef?: any => void | string
};

type State = {
    newLineupTitle?: string,
    newLineupPrivacy?: Visibility,
    filter?:string
};

export default class UserLineups extends Screen<Props, State> {


    cancelSearch: Function
    listRef: Node

    render() {

        const navigator = this.props.navigator;

        return (
            <View style={{flex:1}}>
                <View style={{flex:1}}>

                    <LineupListScreen
                        onLineupPressed={(lineup) => seeList(navigator, lineup)}
                        onSavingPressed={(saving) => seeActivityDetails(navigator, saving)}
                        scrollUpOnBack={super.isVisible() ? ()=>false : null}
                        visibility={'visible'}
                        // renderSectionHeader={({section}) => renderSectionHeader(section)}
                        renderSectionFooter={()=> <View style={{height: 25, width: "100%"}} />}
                        ItemSeparatorComponent={()=> <View style={{margin: 6}} />}
                        filter={this.filter()}
                        {...this.props}
                        listRef={ref => {
                            this.listRef = ref;
                            if (this.props.listRef) this.props.listRef(ref)
                        }
                        }
                        ListHeaderComponent={<View>{[this.renderFilter(), this.props.ListHeaderComponent]}</View>}
                    />
                    {/*{_.isEmpty(this.state.filter) && this.state.isFilterFocused && this.renderSearchOverlay()}*/}
                </View>
            </View>
        );
    }

    renderFilter() {
        // const paddingVertical = this.state.isFilterFocused ? 8 : 5;
        const paddingVertical = 5;
        let style = {
            // backgroundColor: NavStyles.navBarBackgroundColor,
            paddingTop: 12,
            paddingBottom: paddingVertical,
            paddingHorizontal: LINEUP_PADDING
            // elevation: 3,
            // borderBottomWidth: 1,
            // borderBottomColor: Colors.grey3
        };


        return (
            <View key={'searchbar_container'} style={[style]}>

                <GSearchBar2
                    value={this.state.filter}
                    onChangeText={filter => this.setState({filter})}
                    placeholder={i18n.t('search.in_feed')}
                    // onFocus={() => this.onFilterFocusChange(true)}
                    // onCancel={() => this.onFilterFocusChange(false)}
                    // textInputRef={r => this.filterNode = r}
                    // inputHeight={36}
                    cancelFunctionRef={f => this.cancelSearch = f}
                />
            </View>
        )
    }



    filter(): FilterConfig<Lineup> {

        return {
            token: this.state.filter, //used just to re-render the children. todo: find a better way
            placeholder: 'search.in_feed',
            emptyFilterResult: (searchToken: string) => (
                <View>
                    <Text style={STYLES.empty_message}>{i18n.t('lineups.filter.empty')}</Text>
                    {renderSimpleButton(i18n.t('lineups.filter.deepsearch'), () => displayHomeSearch(this.props.navigator, searchToken))}

                </View>
            ),
            applyFilter: (sections) => {
                const filter: string = this.state.filter;
                if (!filter) return sections;

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

                // applyFilter is called within a render => no call to refs
                setTimeout(()=> {
                    this.listRef && this.listRef.flashScrollIndicators()
                })

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


}
