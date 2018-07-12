// @flow

import type {Node} from 'react'
import React from 'react'
import {connect} from "react-redux"
import {currentUserId, logged} from "../../managers/CurrentUser"
import type {NavigableProps, SearchToken} from "../../types"
import {makeAlgoliaSearchEngine} from "../../helpers/AlgoliaUtils"
import Screen from "../components/Screen"
import SearchScreen from "./search"
import {GoodshContext} from "../UIComponents"
import {Colors} from "../colors"
import type {SearchCategory, SearchEngine} from "../../helpers/SearchHelper"
import {
    renderSavingOrLineup,
    renderUser,
    SEARCH_CATEGORY_OTHERS_LIST_OR_SAVINGS,
    SEARCH_CATEGORY_USER
} from "../../helpers/SearchHelper"

type Props = NavigableProps & {
    token ?: SearchToken
};

type State = {
};

@connect()
@logged
export default class NetworkSearchScreen extends Screen<Props, State> {

    static navigatorStyle = {
        navBarNoBorder: true,
        topBarElevationShadowEnabled: false
    };

    categories: Array<SearchCategory>
    search: SearchEngine

    constructor(props: Props) {
        super(props)
        this.categories = [
            SEARCH_CATEGORY_OTHERS_LIST_OR_SAVINGS(currentUserId(), renderSavingOrLineup(props.navigator)),
            SEARCH_CATEGORY_USER(currentUserId(), renderUser(props.navigator)),
        ]
        this.search = makeAlgoliaSearchEngine(this.categories, props.navigator);
    }

    render() {
        return (
            <GoodshContext.Provider value={{userOwnResources: false}}>
                <SearchScreen
                    searchEngine={this.search}
                    categories={this.categories}
                    navigator={this.props.navigator}
                    placeholder={i18n.t('search.in_network')}
                    style={{backgroundColor: Colors.white}}
                    token={this.props.token}
                />
            </GoodshContext.Provider>
        )
    }

}

