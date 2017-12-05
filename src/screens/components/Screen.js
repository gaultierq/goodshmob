// @flow
import {Component} from 'react';
import type {NavigableProps} from "../../types";
import {toUppercase} from "../../utils/StringUtils";
import * as Nav from "../Nav";

export type ScreenState = {
    onScreen: boolean
}

export type ScreenProps = NavigableProps & {
    onScreen?: boolean, //when not a screen root, my parent screen can tell me I'm visible
    onClickClose?: () => void
}

export default class Screen<P, S> extends Component<P & ScreenProps,  S> {


    state = {onSreen: false};

    constructor(props:P) {
        super(props);
        let navigator = props.navigator;
        if (!navigator) throw "please provide navigator";
        navigator.addOnNavigatorEvent((event) => {
            //console.debug("home:onNavigatorEvent" + JSON.stringify(event));

            let id = event.id;
            let onScreen;

            switch (id) {
                case 'didDisappear':
                case 'didAppear':
                    onScreen = id === 'didAppear';
                case 'willAppear':
                case 'willDisappear':

                    let method = 'component' + toUppercase(id);
                    console.debug(`Screen ${this.constructor.name} visib event ${id}`);

                    // $FlowFixMe
                    if (this[method]) this[method]();

                    this.setState({onScreen});
                    break;
            }

            if (event.type === 'NavBarButtonPress') { // this is the event type for button presses
                if (event.id === Nav.CLOSE_MODAL) { // this is the same id field from the static navigatorButtons definition
                    (this.props.onClickClose || navigator.dismissModal)();
                }
            }
        });
    }

    isVisible() {
        return this.props.onScreen || this.state.onScreen;
    }
}