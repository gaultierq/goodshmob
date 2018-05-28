// @flow

import {Colors} from "../colors";
import type {OnBoardingStep} from "../../managers/OnBoardingManager";
import OnBoardingManager from "../../managers/OnBoardingManager";
import {TipConfig} from "../components/Tip";
import {AppTour, AppTourSequence, AppTourView} from "../../../vendors/taptarget";


//TODO: move tips
const TIP_PRIVACY: TipConfig = {
    type: 'visibility',
    keys: 'tips.visibility',
    materialIcon: 'lock',
}
const TIP_NOISE: TipConfig = {
    type: 'noise',
    keys: 'tips.noise',
    materialIcon: 'notifications-off',
}
const TIP_FULL_PRIVATE: TipConfig = {
    type: 'full_private',
    keys: 'tips.full_private',
    materialIcon: 'lock',
}


export class HomeOnBoardingHelper {


    appTourTargets = new Map();

    focusAddJob: ?number

    registerTapTarget(ref: any, primaryText: string, secondaryText: string) {

        if (!this.appTourTargets.has(ref)) {
            let params;
            if (__IS_IOS__) {
                params = {
                    primaryText,
                    secondaryText,
                    targetHolderColor: Colors.blue,
                    targetTintColor: Colors.white,
                    primaryTextColor: Colors.white,
                }
            }
            else {
                params = {
                    title: primaryText,
                    description: secondaryText,
                    //defined in android/app/src/main/res/values/colors.xml
                    outerCircleColor: 'outerCircleColorPrimary',
                    targetCircleColor: 'outerCircleColorSecondary',
                }
            }

            let appTourTarget = AppTourView.for(ref, params);
            this.appTourTargets.set(ref, appTourTarget);
        }
    }

    handleFocusAdd() {
        if (this.focusAddJob) return
        if (OnBoardingManager.getPendingStep() !== 'focus_add') return
        if (this.appTourTargets.size  === 0) return


        this.focusAddJob = setTimeout(() => {
            let appTourSequence = new AppTourSequence();
            this.appTourTargets.forEach((appTourTarget, view) => {
                appTourSequence.add(appTourTarget);
            });

            AppTour.ShowSequence(appTourSequence);


            //as we don't have a callback on when the tour is finished,
            // we are using a 10s timer, to go to the next onBoardingStep
            this.focusAddJob = setTimeout(() => {
                OnBoardingManager.onDisplayed('focus_add')
            }, 10000);

        }, 2000);
    }


    listenTipChange(onTip: TipConfig => void) {
        //if a new onBoarding step is broadcasted, then display it
        OnBoardingManager.listenToStepChange({
            triggerOnListen: true,
            callback: (step: ?OnBoardingStep) => {
                let newTip = null;
                switch (step) {
                    case 'privacy':
                        newTip = TIP_PRIVACY;
                        break
                    case 'noise':
                        newTip = TIP_NOISE;
                        break
                    case 'private':
                        newTip = TIP_FULL_PRIVATE;
                        break
                }
                onTip(newTip)

            }
        })

    }

}