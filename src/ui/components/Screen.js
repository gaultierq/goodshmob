// @flow
import {Component} from 'react'
import type {NavigableProps, RNNNavigator} from "../../types"
import {toUppercase} from "../../helpers/StringUtils"
import * as Nav from "../Nav"
import {sendMessage} from "../../managers/Messenger"
import Config from "react-native-config"

export type ScreenVisibility = 'unknown' | 'visible' | 'hidden';

export type ScreenState = {
    screenVisibility?: ScreenVisibility,
    dirty?: boolean
}

export type ScreenProps = NavigableProps & {
    visibility?: ScreenVisibility,
    onClickClose?: () => void
}

export default class Screen<P, S> extends Component<P & ScreenProps,  S & ScreenState> {

    state: S & ScreenState = {screenVisibility: 'unknown', dirty: false}

    constructor(props: P & ScreenProps) {
        super(props);

        let navigator = props.navigator;
        if (!navigator) throw "please provide navigator";

        navigator.addOnNavigatorEvent((event) => {


            let id = event.id;


            if (event.type === "ScreenChangedEvent") {

                console.debug(`Screen ${this.constructor.name} visib event ${id}`);

                let screenVisibility: ScreenVisibility;
                switch (id) {
                    case 'didAppear':
                        screenVisibility = 'visible'
                        break;
                    case 'didDisappear':
                        screenVisibility = 'hidden'
                        break;
                    default: return
                }

                this.setState({screenVisibility}, () => {
                    let method = 'component' + toUppercase(id);
                    // $FlowFixMe
                    if (this[method]) this[method]();
                });

                // if (screenVisibility === 'visible' && this.state.dirty) {
                //     //screen dirty, re-rendering
                //     // superLog("screen dirty, re-rendering");
                //     this.setState({dirty: false});
                // }

            }

            if (event.type === 'NavBarButtonPress') { // this is the event type for button presses
                if (event.id === Nav.CLOSE_MODAL) { // this is the same id field from the static navigatorButtons definition
                    (this.props.onClickClose || navigator.dismissModal)();
                }
            }
        });
    }

    // askRenderOnVisible: boolean;

    shouldComponentUpdate(nextProps: P & ScreenProps, nextState: S & ScreenState) {
        if (!__ENABLE_PERF_OPTIM__) return true;

        if (!this.getVisible(nextProps, nextState)) {
            // this.askRenderOnVisible = true;
            // superLog(`[${this.constructor.name}]: shouldComponentUpdate skipped - ${JSON.stringify(this.state)}`);
            // if (!this.state.dirty) {
            //     this.setState({dirty: true});
            // }
            return false;
        }
        return true;
    }

    componentDidCatch(err: Error, info: any) {
        console.warn("componentDidCatch", err, info)

        if (Config.DEV_TOOLS === 'true') {
            sendMessage('rendering error', {timeout: 10000, action: {
                    title: 'post forceUpdate',
                    onPress: () => {
                        setTimeout(()=> this.forceUpdate(), 1000)
                    },
                }
            })
        }
        else {
            throw err
        }

    }


    isVisible(): boolean {
        return this.getVisible(this.props, this.state);
    }

    getVisible(props:P & ScreenProps, state:S & ScreenState) {
        return props && props.visibility === 'visible' || state && state.screenVisibility === 'visible';
    }


    //this is used, do not remove
    getVisibility() {
        return this.isVisible() ? 'visible' : 'hidden'
    }

//because when navigating back, a render may change the nav bar title. this is a flaw in wix nav
    setNavigatorTitle(navigator: RNNNavigator, {title, subtitle} : {title?: string, subtitle?: string}) {
        if (this.isVisible()) {
            navigator.setTitle({title});
            navigator.setSubTitle({subtitle});
        }
    }
}
