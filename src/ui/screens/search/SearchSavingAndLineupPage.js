// @flow

import type {Node} from 'react'
import React from 'react'
import {StyleSheet, Text, TextInput, View,} from 'react-native'
import type {SearchEngine,} from "../../../helpers/SearchHelper"
import {
    __createAlgoliaSearcher,
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
                            'item_title',
                            'list_name'
                        ],
                        attributesForFaceting: ['user_id'],
                    }
                );
                resolve(index);
            });
        });


        this.state = {
            searchOptions: {
                algoliaFilter: `user_id:${currentUserId()}`,
                token: props.token
            },
            search: {
                search: __createAlgoliaSearcher({
                    index: index,
                    parseResponse: createResultFromHit,
                }),
                canSearch: searchOptions => Promise.resolve(!_.isEmpty(searchOptions.token))
            }
        }
    }

    render() {
        return (
            <View>
                <GSearchBar2
                    onChangeText={(token: string)  => {this.setState({searchOptions: {...this.state.searchOptions, token}})}}
                    value={this.state.searchOptions.token}
                    style={styles1.searchBar}
                    placeholder={i18n.t("search_bar.me_placeholder")}
                    autoFocus
                />
                <SearchMotor
                    searchEngine={this.state.search}
                    renderResults={(state, onLoadMore) => <SearchListResults searchState={state} onLoadMore={onLoadMore} renderItem={renderSavingOrLineup(this.props.navigator)} />}
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
