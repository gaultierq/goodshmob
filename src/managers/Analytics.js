// @flow
import {ScreenVisibilityListener as RNNScreenVisibilityListener} from 'react-native-navigation';
import {Answers} from 'react-native-fabric';

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
        }
    }

    screen(screen: string, param: any) {
        if (this.fabricInitialized) {
            console.log("Analytics:screen" + screen);
            Answers.logCustom('display screen', { screen });
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
