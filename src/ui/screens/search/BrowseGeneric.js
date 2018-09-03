// @flow

import type {Node} from 'react'
import React from 'react'
import {StyleSheet, Text, TextInput, View,} from 'react-native'
import type {SearchEngine, } from "../../../helpers/SearchHelper"
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
import type {ISearchMotor} from "../searchMotor"
import type {SearchItemCategoryType} from "../../../helpers/SearchConstants"
import {GoodshContext} from "../../UIComponents"

export type BrowseItemsGenOptions = {
    algoliaFilter?: string
}

type SMS = {
    searchOptions: BrowseItemsGenOptions,
    scope: string

}
type SMP = {
    category: SearchItemCategoryType,
    focused?: boolean,
    scope?: string,
}

@connect(state => ({
    data: state.data,
}))
@logged
export default class BrowseGeneric extends React.Component<SMP, SMS> {

    searchMotor: ISearchMotor<BrowseItemsGenOptions>

    constructor(props: SMP) {
        super(props)

        this.state = {
            searchOptions: {
                algoliaFilter: makeBrowseAlgoliaFilter2('me', this.props.category, this.getUser()),
            },
            scope: props.scope || 'me'
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

    render() {
        return (
            <View style={{flex: 1}}>

                <SocialScopeSelector
                    initialValue={this.props.scope}
                    onScopeChange={scope => {
                        this.setState({
                            searchOptions: {
                                ...this.state.searchOptions,
                                algoliaFilter: makeBrowseAlgoliaFilter2(scope, this.props.category, this.getUser())
                            },
                            scope,
                        })}
                    }/>

                <GoodshContext.Provider value={{userOwnResources: this.state.scope === 'me'}}>
                    <SearchMotor
                        ref={ref=>this.searchMotor = ref}
                        searchEngine={this.search}
                        renderResults={(state, onLoadMore)=> <SearchListResults searchState={state} onLoadMore={onLoadMore} renderItem={renderItem.bind(this)} />}
                        searchOptions={this.state.searchOptions}
                        canSearch={(searchOptions: BrowseItemsGenOptions) => !this.props.focused ? 'not_focused' : null}
                    />
                </GoodshContext.Provider>
            </View>
        )
    }

    componentDidUpdate(prevProps: SMP) {
        // for "don't search on 1st render" feature
        if (prevProps.focused !== this.props.focused) {
            //disapointing
            if (this.searchMotor) this.searchMotor.search(this.state.searchOptions, false)
        }
    }

    getUser() {
        return buildData(this.props.data, "users", currentUserId())
    }
}
