// @flow
import {Component} from 'react';
import type {NavigableProps} from "../../types";
import {toUppercase} from "../../utils/StringUtils";

export type ScreenState = {
    onScreen: boolean
}

export default class Screen<P: NavigableProps, S> extends Component<P, S> {


    state = {onSreen: false};

    constructor(props:P) {
        super(props);
        let navigator = props.navigator;
        if (!navigator) throw "please provide navigator";
        navigator.addOnNavigatorEvent((event) => {
            console.debug("home:onNavigatorEvent" + JSON.stringify(event));

            let id = event.id;
            let onScreen;

            switch (id) {
                case 'didDisappear':
                case 'didAppear':
                    onScreen = id === 'didAppear';
                case 'willAppear':
                case 'willDisappear':

                    let method = 'component' + toUppercase(id);
                    console.debug(this.toString() + ' ' + id);

                    // $FlowFixMe
                    if (this[method]) this[method]();

                    this.setState({onScreen});
                    break;
            }
        });
    }

    isVisible() {
        return this.state.onScreen;
    }
}