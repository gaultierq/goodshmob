// @flow

import React from 'react'
import type {NavigableProps} from "../../types"
import Screen from "../components/Screen"
import SearchLineupPage from "./search/SearchLineupPage"

type Props = NavigableProps & {
}

type State = {
}

export default class LineupSearchScreen extends Screen<Props, State> {

    render() {
        return <SearchLineupPage navigator={this.props.navigator}/>
    }
}
