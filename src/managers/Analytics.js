// @flow
import {ScreenVisibilityListener as RNNScreenVisibilityListener} from 'react-native-navigation';
let Answers;

class _Analytics implements Analytics {
    id = Math.random();

    screenVisibilityListener: RNNScreenVisibilityListener;
    fabricInitialized: boolean;

    constructor() {
        this.screenVisibilityListener = new RNNScreenVisibilityListener({
            didAppear: ({screen, startTime, endTime, commandType}) => {
                console.debug('screenVisibility', `Screen ${screen} displayed in ${endTime - startTime} millis after [${commandType}]`);
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
        if (__WITH_FABRIC__) {
            //initialized in  native code
            this.fabricInitialized = true;
            Answers = require('react-native-fabric');
        }
    }

    screen(screen: string, param: any) {
        if (this.fabricInitialized) {
            console.log("Analytics:screen" + screen);
            Answers.logCustom('display screen', { screen });
        }
    }

    // record logging on Answers
    logCustom(description: string, attributes: { [string]: any } = {}) {
        if (this.fabricInitialized) {
            console.log(`Analytics:logCustom, description: ${description}, attributes: ${JSON.stringify(attributes, null, 2)}`);
            Answers.logCustom(description, attributes);
        }
    }

    toString() {
        return "Analytics-" + this.id;
    }
}
export interface Analytics {

    init(): void;

    screen(screenName: string, param: any): void;

    // record logging on Answers
    logCustom(description: string, attributes: { [string]: any }): void;
}

module.exports = new _Analytics();
