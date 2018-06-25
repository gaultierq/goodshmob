// @flow

import {Colors} from "../colors"
import OnBoardingManager from "../../managers/OnBoardingManager"
import {AppTour, AppTourSequence, AppTourView} from "../../../vendors/taptarget"


export class HomeOnBoardingHelper {


    appTourTargets = new Map();

    focusAddJob: ?number

    registerTapTarget(ref: any, primaryText: string, secondaryText: string) {

        if (!this.appTourTargets.has(ref)) {
            let params = {
                titleTextSize: "24",
                descriptionTextSize: "18"
            }
            if (__IS_IOS__) {
                params = {
                    ...params,
                    primaryText,
                    secondaryText,
                    targetHolderColor: Colors.blue,
                    targetTintColor: Colors.white,
                    primaryTextColor: Colors.white,
                }
            }
            else {
                params = {
                    ...params,
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
        if (this.appTourTargets.size  === 0) return

        this.focusAddJob = setTimeout(() => {
            OnBoardingManager.onDisplayed('focus_add')

            let appTourSequence = new AppTourSequence();
            this.appTourTargets.forEach((appTourTarget, view) => {
                appTourSequence.add(appTourTarget);
            });

            AppTour.ShowSequence(appTourSequence);


            //as we don't have a callback on when the tour is finished,
            // we are using a 10s timer, to go to the next onBoardingStep
            OnBoardingManager.postOnDismissed('focus_add', 10000)

        }, 100);
    }
}