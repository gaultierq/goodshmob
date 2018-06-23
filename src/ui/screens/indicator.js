// @flow

import type {Node} from 'react'
import React, {Component} from 'react'
import {Colors} from "../colors"
import Spinner from 'react-native-spinkit';

export type State = {}
export type Props = {
    size?: number
}

export default class GIndicator extends Component<Props, State> {

    static defaultProps = {
        size: 20
    }

    render() {

        return (
            <Spinner
                isVisible={true}
                size={this.props.size}
                type={"ChasingDots"}
                color={Colors.grey3}/>
        )
    }

}