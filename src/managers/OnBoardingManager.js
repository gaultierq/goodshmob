// @flow
import type {Node} from 'react';

const NEXT_STEP = 'NEXT_STEP';
const SET_STEP = 'SET_STEP';

const ALL_STEPS = ['no_spam', 'focus_add', 'notification'];

class _OnBoardingManager implements OnBoardingManager {
    id = Math.random();

    store: any;

    constructor() {
    }

    init(store: any) {
        this.store = store;

        let {forceOnBoardingCycle} = this.store.getState().config;
        if (forceOnBoardingCycle) {
            setTimeout(()=> {
                this.store.dispatch({type: SET_STEP, step: 'no_spam'});
            }, 2000)
        }
    }

    getPendingStep(): ?OnBoardingStep {
        return this.store.getState().onBoarding.nextStep;
    }

    toString() {
        return "OnBoardingManager-" + this.id;
    }


    createReducer() {
        return (state: any = {}, action: any) => {
            switch (action.type) {
                case NEXT_STEP:
                    state = {...state, nextStep: this.nextStep(state.nextStep)};
                    break;
                case SET_STEP:
                    state = {...state, nextStep: action.step};
                    break;
            }
            return state;
        }
    }

    nextStep(current: OnBoardingStep) {
        let i = ALL_STEPS.indexOf(current);
        if (i > -1) {
            return _.nth(ALL_STEPS, ++i)
        }
        return null;
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


export type OnBoardingStep = 'no_spam' | 'focus_add' | 'notification';





module.exports = new _OnBoardingManager();
