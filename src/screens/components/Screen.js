// @flow
import {Component} from 'react';
import type {NavigableProps} from "../../types";
import {toUppercase} from "../../utils/StringUtils";

export type ScreenState = {
    onScreen: boolean
}

export type ScreenProps = NavigableProps & {
    onScreen?: boolean //when not a screen root, my parent screen can tell me I'm visible
}

export default class Screen<P: ScreenProps, S> extends Component<P, S> {


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
                    console.debug('screen visib event' + ' ' + id);

                    // $FlowFixMe
                    if (this[method]) this[method]();

                    this.setState({onScreen});
                    break;
            }
        });
    }

    isVisible() {
        return this.props.onScreen || this.state.onScreen;
    }
}