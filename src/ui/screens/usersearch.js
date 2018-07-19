// @flow

import React from 'react'
import type {NavigableProps} from "../../types"
import Screen from "../components/Screen"
import SearchUserPage from "./search/SearchUserPage"

type Props = NavigableProps & {
}

type State = {
}

export default class UserSearchScreen extends Screen<Props, State> {

    render() {
        return <SearchUserPage />
    }
}
