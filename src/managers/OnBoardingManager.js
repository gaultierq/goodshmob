// @flow

import {requestPermissionsForLoggedUser} from "./NotificationManager";
import {listenToUserChange} from "./CurrentUser";
import CurrentUser from "./CurrentUser";
import watch from 'redux-watch'
import EventBus from 'eventbusjs'

const NEXT_STEP = 'NEXT_STEP';
const SET_STEP = 'SET_STEP';

export type OnBoardingStep = 'focus_add' | 'notification' | 'privacy' | 'noise' | 'private';


export const ON_BOARDING_STEP_CHANGED = 'ON_BOARDING_STEP_CHANGED';

class _OnBoardingManager implements OnBoardingManager {
    id = Math.random();

    store: any;

    ALL_STEPS: OnBoardingStep[];

    constructor() {
    }

    init(store: any) {
        this.store = store;

        this.ALL_STEPS = ['focus_add'];
        if (__WITH_NOTIFICATIONS__ && __IS_IOS__) {
            this.ALL_STEPS.push('notification')
        }
        this.ALL_STEPS.push('privacy', 'noise', 'private')

        //TODO: let current user implement this, and warn everybody when something is changing
        // on user (now, or later):

        // on no_user (now, or later)

        //this should trigger th onboarding on user login
        listenToUserChange({
            onUser: user => {

                let {forceOnBoardingCycle, onBoardingOnEveryLogin} = this.store.getState().config;
                //step to set
                if (forceOnBoardingCycle || (onBoardingOnEveryLogin || true) && CurrentUser.loggedSince() < 5000) {
                    this.store.dispatch({type: SET_STEP, step: this.ALL_STEPS[0]});
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


        let w = watch(store.getState, 'onBoarding.nextStep');
        store.subscribe(w((newVal, oldVal, objectPath) => {
                console.info(`onBoarding: next step changed old=${oldVal}, new=${newVal}`);

                EventBus.dispatch(ON_BOARDING_STEP_CHANGED, {step: newVal});
            })
        );
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
                let i = this.ALL_STEPS.indexOf(current);
                if (i > -1) {
                    return _.nth(this.ALL_STEPS, ++i)
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

    listenToStepChange(options: {callback: (step?: ?OnBoardingStep) => void, triggerOnListen: ?boolean}) {
        const {callback, triggerOnListen} = options;
        let triggering;

        EventBus.addEventListener(ON_BOARDING_STEP_CHANGED, event => {
            if (triggering) {
                console.warn("looping");
                return;
            }
            const step: OnBoardingStep = event.target.step;
            callback(step);
        });

        if (triggerOnListen) {
            triggering = true;
            callback(this.getPendingStep());
            triggering = false;
        }
    }
}


export interface OnBoardingManager {

    init(store: any): void;

    getPendingStep(): ?OnBoardingStep;

    createReducer(): any;

    onDisplayed(step: OnBoardingStep): void;

    listenToStepChange(options: {callback: (step?: ?OnBoardingStep) => void, triggerOnListen: ?boolean}): void;

}



module.exports = new _OnBoardingManager();
