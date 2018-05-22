// @flow
import {Navigation} from 'react-native-navigation';
import {Configuration, Client} from 'bugsnag-react-native';
import type {User} from "../types";

// export const DEEPLINK_OPEN_SCREEN_IN_MODAL = 'DEEPLINK_OPEN_SCREEN_IN_MODAL';

class _BugsnagManager implements BugsnagManager {

    bugsnag;

    init(store: Store) {
        if (!__WITH_BUGSNAG__) return;
        console.info(`BugsnagManager:init`);
        const configuration = new Configuration()
        configuration.registerBeforeSendCallback((report, error) => {
            report.metadata = {redux: store.getState()}
            return true
        });

        this.bugsnag = new Client(configuration);




        console.error = (err) => {
            if (typeof err === 'string') {
                err = new Error(`Wrapped error: '${err}'`);
            }
            this.notify(err);
        }
    }

    setUser(user: User): void {
        if (!__WITH_BUGSNAG__) return;
        user = user || {}
        console.info(`BugsnagManager:setUser`, user);
        let {id, email, firstName, lastName} = user;
        this.bugsnag.setUser(id, firstName + " " + lastName, email);
    }

    clearUser(): void {
        if (!__WITH_BUGSNAG__) return;
        console.info("BugsnagManager:clearUser");
        this.bugsnag.clearUser();
    }

    notify(err: Error, attach?: (report:any)=>any): void {
        if (!__WITH_BUGSNAG__) return;
        console.warn(`BugsnagManager:notify`, err);
        this.bugsnag.notify(err,attach);
    }

}

export interface BugsnagManager {

    init(store: any): void;
    setUser(user: User): void;
    clearUser(): void;
    notify(err: Error): void;

}

module.exports = new _BugsnagManager();
