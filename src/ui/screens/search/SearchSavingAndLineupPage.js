// @flow

import type {Node} from 'react'
import React from 'react'
import {StyleSheet, Text, TextInput, View,} from 'react-native'
import type {SearchEngine,} from "../../../helpers/SearchHelper"
import {
    __createAlgoliaSearcher, FRIEND_FILTER_TYPE, makeBrowseAlgoliaFilter2, PERMISSION_EMPTY_INPUT,
    renderSaving,
    renderSavingOrLineup
} from "../../../helpers/SearchHelper"
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view"
import {LINEUP_PADDING, NAV_BACKGROUND_COLOR} from "../../UIStyles"
import GSearchBar2 from "../../components/GSearchBar2"
import SearchMotor from "../searchMotor"
import type {RNNNavigator} from "../../../types"
import {AlgoliaClient} from "./../../../helpers/AlgoliaUtils"
import Config from 'react-native-config'
import {currentUser, currentUserId} from "../../../managers/CurrentUser"
import {createResultFromHit} from "../../../helpers/AlgoliaUtils"
import SearchListResults from "../searchListResults"
import BlankSearch, {renderBlankIcon} from "../../components/BlankSearch"
import {GoodshContext} from "../../UIComponents"

export type SearchUserOptions = {
    token?: string,
    algoliaFilter?: string
}

type SUS = {
    searchOptions: SearchUserOptions,

}
type SUP = {
    navigator?: RNNNavigator,
    token?: string,
    scope: FRIEND_FILTER_TYPE,
}

export default class SearchSavingAndLineupPage extends React.Component<SUP, SUS> {


    static defaultProps = {
        token: '',
        scope: 'all',
    }

    search: SearchEngine<SearchUserOptions>

    constructor(props: SUP) {
        super(props)
        this.state = {
            searchOptions: {
                algoliaFilter: makeBrowseAlgoliaFilter2(this.props.scope, null, currentUser()),
                token: props.token
            },
        }

        let index = new Promise(resolve => {
            AlgoliaClient.createAlgoliaIndex(Config.ALGOLIA_SAVING_INDEX).then(index => {
                index.setSettings({
                        searchableAttributes: [
                            'item_title',
                            'list_name'
                        ],
                        attributesForFaceting: ['user_id'],
                    }
                );
                resolve(index);
            });
        });

        this.search = __createAlgoliaSearcher({
            index: index,
            parseResponse: createResultFromHit,
        })
    }

    render() {
        return (
            <View style={{flex: 1}}>
                <GSearchBar2
                    onChangeText={(token: string)  => {this.setState({searchOptions: {...this.state.searchOptions, token}})}}
                    value={this.state.searchOptions.token}
                    style={styles1.searchBar}
                    placeholder={this.props.scope === 'all' ? i18n.t("search_bar.network_placeholder") : i18n.t("search_bar.me_placeholder")}
                    autoFocus
                />

                <GoodshContext.Provider value={{userOwnResources: this.props.scope === 'me'}}>
                    <SearchMotor
                        searchEngine={this.search}
                        renderResults={(state, onLoadMore) => <SearchListResults searchState={state} onLoadMore={onLoadMore} renderItem={renderSavingOrLineup(this.props.navigator)} />}
                        searchOptions={this.state.searchOptions}
                        canSearch={this._canSearch}
                        renderMissingPermission={this._renderMissingPermission}
                    />
                </GoodshContext.Provider>
            </View>
        )
    }

    _renderMissingPermission = (searchOptions, missingSearchPermission): Node => {
        if (missingSearchPermission === PERMISSION_EMPTY_INPUT) {
            return <BlankSearch
                icon={renderBlankIcon('savings')}
                text={i18n.t("lineups.filter.deepsearch")}
            />
        }
        return <View/>
    }

    _canSearch = searchOptions => _.isEmpty(searchOptions.token) ? PERMISSION_EMPTY_INPUT : null
}


const styles1 = StyleSheet.create({
    searchBar: {
        paddingTop: 10,
        paddingBottom: 5,
        paddingHorizontal: LINEUP_PADDING,
        // backgroundColor: NAV_BACKGROUND_COLOR
    }
})
