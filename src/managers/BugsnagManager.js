// @flow
import {Navigation} from 'react-native-navigation';
import User from "react-native-firebase/lib/modules/auth/User";
import {Client} from 'bugsnag-react-native';

// export const DEEPLINK_OPEN_SCREEN_IN_MODAL = 'DEEPLINK_OPEN_SCREEN_IN_MODAL';

class _BugsnagManager implements BugsnagManager {

    bugsnag;

    init() {
        if (!__WITH_BUGSNAG__) return;
        console.info(`BugsnagManager:init`);
        this.bugsnag = new Client();

        console.error = (err) => {
            if (typeof err === 'string') {
                err = new Error(`Wrapped error: '${err}'`);
            }
            this.notify(err);
        }
    }

    setUser(user: User): void {
        if (!__WITH_BUGSNAG__) return;
        console.info(`BugsnagManager:setUser: ${user}`);
        let {id, email, firstName, lastName} = user;
        this.bugsnag.setUser(id, firstName + " " + lastName, email);
    }

    clearUser(): void {
        if (!__WITH_BUGSNAG__) return;
        console.info("BugsnagManager:clearUser");
        this.bugsnag.clearUser();
    }

    notify(err: Error): void {
        if (!__WITH_BUGSNAG__) return;
        console.info(`BugsnagManager:notify: ${err}`);
        this.bugsnag.notify(err);
    }

}

export interface BugsnagManager {

    init(): void;
    setUser(user: User): void;
    clearUser(): void;
    notify(err: Error): void;

}

module.exports = new _BugsnagManager();
