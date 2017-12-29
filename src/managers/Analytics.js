// @flow
import {ScreenVisibilityListener as RNNScreenVisibilityListener} from 'react-native-navigation';
var Fabric = require('react-native-fabric');
var { Answers } = Fabric;

import Config from 'react-native-config'

class _Analytics implements Analytics {
    id = Math.random();

    screenVisibilityListener: RNNScreenVisibilityListener;
    fabricInitialized: boolean;

    constructor() {
        this.screenVisibilityListener = new RNNScreenVisibilityListener({
            didAppear: ({screen, startTime, endTime, commandType}) => {
                console.log('screenVisibility', `Screen ${screen} displayed in ${endTime - startTime} millis after [${commandType}]`);
                this.screen(screen, {"displayedInMs": endTime - startTime});
            }
        });
    }

    init() {
        this.screenVisibilityListener.register();

        // let segmentIOWriteKey = Config.SEGMENT_API_KEY_IOS;
        // if (segmentIOWriteKey) {
        //     // let flushEverySecondsCount = 1;
        //     // RNSegmentIOAnalytics.setup(segmentIOWriteKey, flushEverySecondsCount);
        //     // this.segmentInitialized = true;
        // }
        this.fabricInitialized = true;
    }

    screen(screenName: string, param: any) {
        if (this.fabricInitialized) {
            // RNSegmentIOAnalytics.screen(screenName, param);
            console.log("DEBUGGGG");
            Answers.logCustom('Performed a custom event', { bigData: true });
        }

    }

    toString() {
        return "Analytics-" + this.id;
    }
}
export interface Analytics {

    init(): void;

    screen(screenName: string, param: any): void;
}

module.exports = new _Analytics();
