// @flow

import React, {Component} from 'react'
import {ActivityIndicator} from 'react-native'
import {Colors} from "./colors"
import Spinner from "react-native-spinkit"
import type {Color} from "../types"

type Props = {
    size: number,
    color?: Color,
}
type State = {}

export class Loader extends Component<Props, State> {

    static defaultProps = {
        color: Colors.grey3,
    }
    render() {
        return <Spinner style={{alignSelf: 'center'}} size={this.props.size} type={__IS_IOS__ ? "Arc" : "WanderingCubes"} color={this.props.color}/>
    }

    // render() {
    //     return <ActivityIndicator style={{width: this.props.size}}/>
    // }
}
