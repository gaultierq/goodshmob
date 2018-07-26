// @flow

import React from 'react'
import {connect} from "react-redux"
import {logged} from "../../managers/CurrentUser"
import type {NavigableProps, SearchToken} from "../../types"
import Screen from "../components/Screen"
import SearchSavingAndLineupPage from "./search/SearchSavingAndLineupPage"

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

    render() {
        return (
            <SearchSavingAndLineupPage
                navigator={this.props.navigator}
                token={this.props.token}
            />
        )
    }
}
