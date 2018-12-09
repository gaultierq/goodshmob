// @flow

import React, {Component} from 'react'
import {ActivityIndicator} from 'react-native'
import {Colors} from "./colors"
import {selectDimension} from "./UIStyles"
import Spinner from "react-native-spinkit"

type Props = {
    size: number,
}
type State = {}

export class Loader extends Component<Props, State> {

    static defaultProps = {
        size: selectDimension({small: 34, normal: 36, big: 40})
    }
    render() {
        return <Spinner style={{alignSelf: 'center'}} size={this.props.size} type={__IS_IOS__ ? "Arc" : "WanderingCubes"} color={Colors.grey3}/>
    }

    // render() {
    //     return <ActivityIndicator style={{width: this.props.size}}/>
    // }
}
