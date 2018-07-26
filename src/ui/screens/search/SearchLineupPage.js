// @flow

import type {Node} from 'react'
import React from 'react'
import {StyleSheet, Text, TextInput, View,} from 'react-native'
import type {SearchEngine,} from "../../../helpers/SearchHelper"
import {
    __createAlgoliaSearcher, PERMISSION_EMPTY_INPUT,
    renderItem,
    renderSavingOrLineup
} from "../../../helpers/SearchHelper"
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view"
import {LINEUP_PADDING, NAV_BACKGROUND_COLOR} from "../../UIStyles"
import GSearchBar2 from "../../components/GSearchBar2"
import SearchMotor from "../searchMotor"
import type {RNNNavigator} from "../../../types"
import {AlgoliaClient} from "./../../../helpers/AlgoliaUtils"
import Config from 'react-native-config'
import {currentUserId} from "../../../managers/CurrentUser"
import {createResultFromHit} from "../../../helpers/AlgoliaUtils"
import SearchListResults from "../searchListResults"
import BlankSearch, {renderBlankIcon} from "../../components/BlankSearch"
import {renderLineupFromOtherPeople} from "../../../ui/UIComponents"

export type SearchUserOptions = {
    token: string
}

type SUS = {
    search: SearchEngine<SearchUserOptions>,
    searchOptions: SearchUserOptions,

}
type SUP = {
    navigator?: RNNNavigator,
    token: string
}

export default class SearchSavingAndLineupPage extends React.Component<SUP, SUS> {


    static defaultProps = {token: ''}

    constructor(props: SUP) {
        super(props)


        let index = new Promise(resolve => {
            AlgoliaClient.createAlgoliaIndex(Config.ALGOLIA_SAVING_INDEX).then(index => {
                index.setSettings({
                        searchableAttributes: [
                            'list_name'
                        ],
                        attributesForFaceting: ['user_id', 'type'],
                    attributeForDistinct: 'list_name',
                    distinct: 1
                    }
                );
                resolve(index);
            });
        });


        this.state = {
            searchOptions: {
                algoliaFilter: `type:List AND (NOT user_id:${currentUserId()})`,
                token: props.token
            },
            search: {
                search: __createAlgoliaSearcher({
                    index: index,
                    parseResponse: createResultFromHit,
                }),
                missingSearchPermissions: searchOptions => _.isEmpty(searchOptions.token) ? PERMISSION_EMPTY_INPUT : null,
                renderMissingPermission: (searchOptions, missingSearchPermission): Node => {
                    if (missingSearchPermission === PERMISSION_EMPTY_INPUT) {
                        return <BlankSearch
                            icon={renderBlankIcon('savings')}
                            text={i18n.t("lineups.filter.lineup_search")}
                        />
                    }
                    return <View/>
                }
            }
        }
    }

    render() {
        return (
            <View style={{flex: 1}}>
                <GSearchBar2
                    onChangeText={(token: string)  => {this.setState({searchOptions: {...this.state.searchOptions, token}})}}
                    value={this.state.searchOptions.token}
                    style={styles1.searchBar}
                    placeholder={i18n.t("search_bar.lineup_placeholder")}
                    autoFocus
                />
                <SearchMotor
                    searchEngine={this.state.search}
                    renderResults={(state, onLoadMore) => <SearchListResults searchState={state} onLoadMore={onLoadMore} renderItem={({item}) => renderLineupFromOtherPeople(this.props.navigator, item)} />}
                    searchOptions={this.state.searchOptions}
                />
            </View>
        )
    }
}


const styles1 = StyleSheet.create({
    searchBar: {
        paddingTop: 10,
        paddingBottom: 5,
        paddingHorizontal: LINEUP_PADDING, backgroundColor: NAV_BACKGROUND_COLOR
    }
})
