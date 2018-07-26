// @flow

import type {Node} from 'react'
import React from 'react'
import {StyleSheet, Text, TextInput, View,} from 'react-native'
import type {SearchEngine, SearchItemCategoryType,} from "../../../helpers/SearchHelper"
import {__createAlgoliaSearcher, makeBrowseAlgoliaFilter2, renderItem} from "../../../helpers/SearchHelper"
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view"
import SearchMotor from "../searchMotor"
import {currentUserId, logged} from "../../../managers/CurrentUser"
import {buildData} from "../../../helpers/DataUtils"
import {connect} from "react-redux"
import {AlgoliaClient, createResultFromHit} from "../../../helpers/AlgoliaUtils"
import Config from 'react-native-config'
import {SocialScopeSelector} from "./socialscopeselector"
import SearchListResults from "../searchListResults"

export type BrowseItemsGenOptions = {
    algoliaFilter?: string
}

type SMS = {
    searchOptions: BrowseItemsGenOptions,

}
type SMP = {
    category: SearchItemCategoryType,
    data: any
}

@connect(state => ({
    data: state.data,
}))
@logged
export default class BrowseGeneric extends React.Component<SMP, SMS> {

    constructor(props: SMP) {
        super(props)

        this.state = {
            searchOptions: {
                algoliaFilter: makeBrowseAlgoliaFilter2('me', this.props.category, this.getUser())
            },
        }
    }

    _index = new Promise(resolve => {
        AlgoliaClient.createAlgoliaIndex(Config.ALGOLIA_SAVING_INDEX).then(index => {
            index.setSettings({
                    searchableAttributes: [
                        'item_title',
                        'list_name'
                    ],
                    attributeForDistinct: 'item_id',
                    distinct: true,
                    attributesForFaceting: ['user_id', 'type'],
                }
            );
            resolve(index);
        });
    })

    search: SearchEngine<BrowseItemsGenOptions> = __createAlgoliaSearcher({
        index: this._index,
        parseResponse: (hits) => createResultFromHit(hits, {}, true),
    })


    _missingSearchPermissions = (searchOptions: BrowseItemsGenOptions) => null

    render() {
        return (
            <View style={{flex: 1}}>

                <SocialScopeSelector onScopeChange={scope => {
                    this.setState({
                        searchOptions: {
                            ...this.state.searchOptions,
                            algoliaFilter: makeBrowseAlgoliaFilter2(scope, this.props.category, this.getUser())
                        }
                    })}
                }/>

                <SearchMotor
                    searchEngine={this.search}
                    renderResults={(state, onLoadMore)=> <SearchListResults searchState={state} onLoadMore={onLoadMore} renderItem={renderItem.bind(this)} />}
                    searchOptions={this.state.searchOptions}
                    missingSearchPermissions={this._missingSearchPermissions}
                />
            </View>
        )
    }


    getUser() {
        return buildData(this.props.data, "users", currentUserId())
    }
}
