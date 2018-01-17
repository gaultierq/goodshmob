// @flow

import {requestPermissionsForLoggedUser} from "./notification";
import {listenToUserChange} from "./CurrentUser";
import CurrentUser from "./CurrentUser";
import type {User} from "../types";

const NEXT_STEP = 'NEXT_STEP';
const SET_STEP = 'SET_STEP';

export type OnBoardingStep = 'no_spam' | 'focus_add' | 'notification';

const ALL_STEPS = ['no_spam', /*'focus_add', */];

class _OnBoardingManager implements OnBoardingManager {
    id = Math.random();

    store: any;

    constructor() {
    }

    init(store: any) {
        this.store = store;

        //TODO: let current user implement this, and warn everybody when something is changing
        // on user (now, or later):

        // on no_user (now, or later)

        //this should trigger th onboarding on user login
        listenToUserChange({
            onUser: user => {

                let {forceOnBoardingCycle, onBoardingOnEveryLogin} = this.store.getState().config;
                //step to set
                if (forceOnBoardingCycle || (onBoardingOnEveryLogin || true) && CurrentUser.loggedSince() < 5000) {
                    this.store.dispatch({type: SET_STEP, step: 'no_spam'});
                }
                //getPendingStep must be ok after init

                if (this.getPendingStep() === null) {
                    requestPermissionsForLoggedUser();
                }
                else {
                    let unsubscribe = this.store.subscribe(() => {
                        if (!this.getPendingStep()) {
                            requestPermissionsForLoggedUser();
                            unsubscribe();
                        }
                    });
                }

            }, triggerOnListen: true});
    }


    testCondition(user: User) {
        return true;
    }

    getPendingStep(): ?OnBoardingStep {
        return this.store.getState().onBoarding.nextStep;
    }

    toString() {
        return "OnBoardingManager-" + this.id;
    }

    createReducer() {
        return (state: any = {}, action: any) => {

            let nextStep = (current: OnBoardingStep) => {
                let i = ALL_STEPS.indexOf(current);
                if (i > -1) {
                    return _.nth(ALL_STEPS, ++i)
                }
                return null;
            };

            switch (action.type) {
                case NEXT_STEP:
                    state = {...state, nextStep: nextStep(state.nextStep)};
                    break;
                case SET_STEP:
                    state = {...state, nextStep: action.step};
                    break;
            }
            return state;
        }
    }

    onDisplayed(step: OnBoardingStep): void {
        this.store.dispatch({type: NEXT_STEP});
    }
}


export interface OnBoardingManager {

    init(store: any): void;

    getPendingStep(): ?OnBoardingStep;

    createReducer(): any;

    onDisplayed(step: OnBoardingStep): void;

}



module.exports = new _OnBoardingManager();
