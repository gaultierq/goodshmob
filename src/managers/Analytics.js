// @flow
import {ScreenVisibilityListener as RNNScreenVisibilityListener} from 'react-native-navigation';
import {Answers} from 'react-native-fabric';
import buildDebug from 'debug';

const debug = buildDebug('goodshopping:goodshmob:managers:Analytics')

class _Analytics implements Analytics {
    id = Math.random();

    screenVisibilityListener: RNNScreenVisibilityListener;
    fabricInitialized: boolean;

    constructor() {
        debug('constructor()');
        this.screenVisibilityListener = new RNNScreenVisibilityListener({
            didAppear: ({screen, startTime, endTime, commandType}) => {
                console.debug('screenVisibility', `Screen ${screen} displayed in ${endTime - startTime} millis after [${commandType}]`);
                this.screen(screen, {"displayedInMs": endTime - startTime});
            }
        });
    }

    init() {
        debug('init()');
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

    // log when screen changes
    screen(screen: string, param: any) {
        debug('screen()');
        debug(`screen: ${screen}`);
        if (this.fabricInitialized) {
            console.log("Analytics:screen" + screen);
            Answers.logCustom('display screen', { screen });
        }
    }

    // log when screen login to Facebook
    login(success: boolean) {
        debug('login()');
        debug(`success: ${success}`);
        Answers.logLogin(success);
    }

    // log when adding a goodsh
    addGoodsh() {
        debug('addGoodsh()');
        Answers.logCustom('add goodsh', {});
    }

    // log when adding a lineup
    addLineup() {
        debug('addLineup()');
        Answers.logCustom('add lineup', {});
    }

    // log when renaming a lineup
    renameLineup(name: string) {
        debug('renameLineup()');
        Answers.logCustom('rename lineup', { name });
    }

    // log when inviting a friend
    inviteFriend() {
        debug('inviteFriend()');
        Answers.logCustom('invite a friend', {});
    }

    // log when asking my network
    askMyNetwork() {
        debug('askMyNetwork()');
        Answers.logCustom('ask my network', {});
    }

    toString() {
        return "Analytics-" + this.id;
    }
}
export interface Analytics {

    init(): void;

    // log when screen changes
    screen(screenName: string, param: any): void;
    // log when login to Facebook
    login(success: boolean): void;
    // log when adding a goodsh
    addGoodsh(): void;
    // log when adding a lineup
    addLineup(): void;
    // log when renaming a lineup
    renameLineup(lineup: string): void;
    // log when inviting a friend
    inviteFriend(): void;
    // log when asking my network
    askMyNetwork(): void;

}

module.exports = new _Analytics();
