// @flow

import type {Node} from 'react'
import React, {Component} from 'react'
import {FlatList, Keyboard, StyleSheet, Text, View} from "react-native"
import SearchListResults, {type Props as SearchListResultsProps} from "./searchListResults"
import {savingForGridRenderer2} from "../../helpers/GridHelper"


export type Props = SearchListResultsProps & {
    numColumns: number,
}

export type State = {}

export default class SavingsGrid extends Component<Props, State> {

    static defaultProps = {
        numColumns: 3
    }

    _savingForGridRenderer: any

    constructor(props: Props) {
        super(props)
        this._savingForGridRenderer = savingForGridRenderer2({width: __DEVICE_WIDTH__, columns: props.numColumns})
    }

    render() {

        const {numColumns, ...attr} = this.props

        return (
            <SearchListResults
                {...attr}
                numColumns={numColumns}
                renderItem={this._savingForGridRenderer}
            />
        )
    }
}

