// @flow

import type {Node} from 'react'
import React from 'react'
import {StyleSheet, Text, TextInput, View,} from 'react-native'
import type {SearchEngine, SearchItemCategoryType,} from "../../../helpers/SearchHelper"
import {__createAlgoliaSearcher, makeBrowseAlgoliaFilter2, renderItem} from "../../../helpers/SearchHelper"
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view"
import SearchMotor from "../searchMotor"
import ItemCell from "../../components/ItemCell"
import {currentUserId, logged} from "../../../managers/CurrentUser"
import {buildData} from "../../../helpers/DataUtils"
import {connect} from "react-redux"
import {AlgoliaClient, createResultFromHit} from "../../../helpers/AlgoliaUtils"
import Config from 'react-native-config'
import {seeActivityDetails} from "../../Nav"
import GTouchable from "../../GTouchable"
import {SocialScopeSelector} from "./socialscopeselector"
import type {Saving} from "../../../types"
import SearchListResults from "../searchListResults"

export type BrowseItemsGenOptions = {
    algoliaFilter?: string
}

type SMS = {
    search: SearchEngine<BrowseItemsGenOptions>,
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
export default class BrowseItemPageGeneric extends React.Component<SMP, SMS> {

    constructor(props: SMP) {
        super(props)

        let index = new Promise(resolve => {
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
        });


        this.state = {
            searchOptions: {
            },
            search: {
                search: __createAlgoliaSearcher({
                    index: index,
                    parseResponse: (hits) => createResultFromHit(hits, {}, true),
                }),
                missingSearchPermissions: searchOptions => null
            }


        }
    }

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
                    searchEngine={this.state.search}
                    renderResults={(state, onLoadMore)=> <SearchListResults searchState={state} onLoadMore={onLoadMore} renderItem={renderItem.bind(this)} />}
                    searchOptions={this.state.searchOptions}
                />
            </View>
        )
    }


    getUser() {
        return buildData(this.props.data, "users", currentUserId())
    }
}
