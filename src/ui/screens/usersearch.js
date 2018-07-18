// @flow

import React from 'react'
import {connect} from "react-redux"
import {currentUserId, logged} from "../../managers/CurrentUser"
import type {NavigableProps, SearchToken} from "../../types"
import {makeAlgoliaSearchEngine} from "../../helpers/AlgoliaUtils"
import Screen from "../components/Screen"
import type {SearchCategory, SearchEngine} from "../../helpers/SearchHelper"
import {renderUser, SEARCH_CATEGORY_USER} from "../../helpers/SearchHelper"
import SearchScreen from "./search"
import {Colors} from "../colors"

type Props = NavigableProps & {
    token?: SearchToken,
};

type State = {
};

export default class UserSearchScreen extends Screen<Props, State> {


    categories: Array<SearchCategory>
    search: SearchEngine

    constructor(props: Props) {
        super(props)
        this.categories = [
            SEARCH_CATEGORY_USER(currentUserId(), renderUser(props.navigator)),
        ]
        this.search = makeAlgoliaSearchEngine(this.categories, props.navigator);
    }

    render() {
        return (
            <SearchScreen
                searchEngine={this.search}
                categories={this.categories}
                navigator={this.props.navigator}
                placeholder={i18n.t('search.in_users')}
                style={{backgroundColor: Colors.white}}
                token={this.props.token}
            />
        )
    }
}
