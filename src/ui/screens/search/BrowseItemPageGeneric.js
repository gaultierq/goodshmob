// @flow

import type {Node} from 'react'
import React from 'react'
import {StyleSheet, Text, TextInput, View,} from 'react-native'
import type {SearchEngine, SearchItemCategoryType,} from "../../../helpers/SearchHelper"
import {__createAlgoliaSearcher, makeBrowseAlgoliaFilter2} from "../../../helpers/SearchHelper"
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view"
import SearchPage from "../searchpage"
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

export type BrowseItemsGenOptions = {
    algoliaFilter?: string
}

type SMS = {
    search: SearchEngine<BrowseItemsGenOptions>,
    searchOptions: BrowseItemsGenOptions,

}
type SMP = {
    category: SearchItemCategoryType,
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
                canSearch: searchOptions => Promise.resolve(true)
            }


        }
    }

    render() {
        return (
            <View>

                <SocialScopeSelector onScopeChange={scope => {
                    this.setState({
                        searchOptions: {
                            ...this.state.searchOptions,
                            algoliaFilter: makeBrowseAlgoliaFilter2(scope, this.props.category, this.getUser())
                        }
                    })}
                }/>

                <SearchPage
                    searchEngine={this.state.search}
                    renderItem={this.renderItem.bind(this)}
                    searchOptions={this.state.searchOptions}
                />
            </View>
        )
    }

    //factorize
    renderItem({item}: {item: Saving}) {

        let saving = item;

        let resource = saving.resource;

        //TODO: this is hack
        if (!resource) return null;

        return (
            <GTouchable onPress={() => seeActivityDetails(this.props.navigator, saving)}>
                <ItemCell item={resource}/>
            </GTouchable>
        )
    }

    getUser() {
        return buildData(this.props.data, "users", currentUserId())
    }
}