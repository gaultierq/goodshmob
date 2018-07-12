// @flow

import React from 'react'
import {connect} from "react-redux"
import {currentUserId, logged} from "../../managers/CurrentUser"
import type {NavigableProps, SearchToken} from "../../types"
import {makeAlgoliaSearchEngine} from "../../helpers/AlgoliaUtils"
import Screen from "../components/Screen"
import type {SearchCategory, SearchEngine} from "../../helpers/SearchHelper"
import {renderSavingOrLineup, SEARCH_CATEGORY_MY_LIST_OR_SAVINGS} from "../../helpers/SearchHelper"
import SearchScreen from "./search"
import {Colors} from "../colors"

type Props = NavigableProps & {
    token?:SearchToken,
};

type State = {
};

@connect()
@logged
export default class HomeSearchScreen extends Screen<Props, State> {

    static navigatorStyle = {
        navBarNoBorder: true,
        topBarElevationShadowEnabled: false
    };

    categories: Array<SearchCategory>
    search: SearchEngine

    constructor(props: Props) {
        super(props)
        this.categories = [
            SEARCH_CATEGORY_MY_LIST_OR_SAVINGS(currentUserId(), renderSavingOrLineup(props.navigator)),
        ]
        this.search = makeAlgoliaSearchEngine(this.categories, props.navigator);
    }

    render() {
        return (
            <SearchScreen
                searchEngine={this.search}
                categories={this.categories}
                navigator={this.props.navigator}
                placeholder={i18n.t('search.in_network')}
                style={{backgroundColor: Colors.white}}
                token={this.props.token}
            />
        )
    }
}
