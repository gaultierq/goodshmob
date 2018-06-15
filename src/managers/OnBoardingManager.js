// @flow

import CurrentUser, {listenToUserChange} from "./CurrentUser";
import watch from 'redux-watch'
import EventBus from 'eventbusjs'
import Config from 'react-native-config'

const NEXT_STEP = 'NEXT_STEP';
const SET_STEP = 'SET_STEP';

export type OnBoardingStep = 'focus_add' | 'privacy' | 'noise' | 'private';


export const ON_BOARDING_STEP_CHANGED = 'ON_BOARDING_STEP_CHANGED';
const TIME_BETWEEN_TIPS_MS = Config.TIME_BETWEEN_TIPS_MS;
const ALL_STEPS: OnBoardingStep[] = ['focus_add', 'privacy', 'noise', 'private']

class _OnBoardingManager implements OnBoardingManager {
    id = Math.random();

    store: any;

    logger: GLogger

    constructor() {
    }

    init(store: any) {
        this.logger = rootlogger.createLogger('OnBoarding')
        this.store = store;

        //this should trigger th onboarding on user login
        listenToUserChange({
            onUser: user => {

                let {forceOnBoardingCycle, onBoardingOnEveryLogin} = this.store.getState().config;
                //step to set
                if (forceOnBoardingCycle || (onBoardingOnEveryLogin || true) && CurrentUser.loggedSince() < 5000) {
                    this.store.dispatch({type: SET_STEP, step: ALL_STEPS[0]});
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
        if (Date.now () - this.getLastTimeShown() > TIME_BETWEEN_TIPS_MS) {
            return this.store.getState().onBoarding.nextStep;
        } else {
            return null
        }
    }

    getLastTimeShown() {
        return this.store.getState().onBoarding.lastShown;
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
                    state = {...state, nextStep: nextStep(state.nextStep), lastShown: Date.now()};
                    break;
                case SET_STEP:
                    state = {...state, nextStep: action.step, lastShown: 0};
                    break;
            }
            return state;
        }
    }

    onDisplayed(step: OnBoardingStep): void {
        this.store.dispatch({type: NEXT_STEP, lastShown: Date.now()});
    }

    listenToStepChange(options: {callback: (step: ?OnBoardingStep) => void, triggerOnListen?:boolean}) {
        const {callback, triggerOnListen} = options;

        let triggering

        this.logger.debug('listening To Step Change')

        EventBus.addEventListener(ON_BOARDING_STEP_CHANGED, event => {
            this.logger.debug('on event', event)
            if (triggering) {
                this.logger.warn("looping");
                return;
            }
            const step : ?OnBoardingStep = this.getPendingStep();
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

    listenToStepChange(options: {callback: (step: ?OnBoardingStep) => void, triggerOnListen?:boolean}): void;

}



module.exports = new _OnBoardingManager();
