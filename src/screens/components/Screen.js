// @flow
import {Component} from 'react';
import type {NavigableProps} from "../../types";
import {toUppercase} from "../../utils/StringUtils";
import * as Nav from "../Nav";
import {superConsole} from "../../global";


export type ScreenVisibility = 'unknown' | 'visible' | 'hidden';

export type ScreenState = {
    onScreen: boolean,
    dirty: boolean
}

export type ScreenProps = NavigableProps & {
    onScreen?: boolean, //when not a screen root, my parent screen can tell me I'm visible
    onClickClose?: () => void
}

export default class Screen<P, S> extends Component<P & ScreenProps,  S> {


    state = {onSreen: false, dirty: false};

    constructor(props:P) {
        super(props);
        let navigator = props.navigator;
        if (!navigator) throw "please provide navigator";
        navigator.addOnNavigatorEvent((event) => {
            //console.debug("home:onNavigatorEvent" + JSON.stringify(event));

            let id = event.id;


            if (event.type === "ScreenChangedEvent") {

                let method = 'component' + toUppercase(id);
                console.debug(`Screen ${this.constructor.name} visib event ${id}`);

                // $FlowFixMe
                if (this[method]) this[method]();

                const didAppear = id === 'didAppear';

                this.setState({onScreen: didAppear});

                if (didAppear && this.state.dirty) {
                    //screen dirty, re-rendering
                    superLog("screen dirty, re-rendering");
                    this.setState({dirty: false});
                }

            }

            if (event.type === 'NavBarButtonPress') { // this is the event type for button presses
                if (event.id === Nav.CLOSE_MODAL) { // this is the same id field from the static navigatorButtons definition
                    (this.props.onClickClose || navigator.dismissModal)();
                }
            }
        });
    }

    // askRenderOnVisible: boolean;

    shouldComponentUpdate(nextProps, nextState) {
        if (!ENABLE_PERF_OPTIM) return true;

        if (!this.isVisible()) {
            // this.askRenderOnVisible = true;
            superLog("screen: shouldComponentUpdate skipped");
            this.setState({dirty: true});
            return false;
        }
        return true;
    }


    isVisible() {
        return this.props.onScreen || this.state.onScreen;
    }

    getVisibility() : ScreenVisibility {
        return this.isVisible() ? 'visible' : 'hidden';
    }
}