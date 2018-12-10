// @flow

import {Colors} from "../colors"
import OnBoardingManager from "../../managers/OnBoardingManager"
import {AppTour, AppTourSequence, AppTourView} from "../../../vendors/taptarget"


export class HomeOnBoardingHelper {


    appTourTargets = new Map();

    focusAddJob: ?number

    registerTapTarget(refName: string, ref: any, primaryText: string, secondaryText: string) {
        if (this.isShowing()) return
        this.appTourTargets.set(refName, {ref, primaryText, secondaryText});
    }

    clearTapTarget() {
        this.appTourTargets.clear()
    }

    createAppTourView(primaryText: string, secondaryText: string, ref) {
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

        return AppTourView.for(ref, params)
    }

    handleFocusAdd(isMounted: () => boolean) {
        if (this.isShowing()) return
        if (this.appTourTargets.size  === 0) return

        this.focusAddJob = setTimeout(() => {
            if (!isMounted()) return
            OnBoardingManager.onDisplayed('focus_add')


            let appTourSequence = new AppTourSequence();
            this.appTourTargets.forEach(({ref, primaryText, secondaryText}) => {
                if (!ref) throw "wtf1 where is my ref"
                appTourSequence.add(this.createAppTourView(primaryText, secondaryText, ref));
            });

            AppTour.ShowSequence(appTourSequence);


            //as we don't have a callback on when the tour is finished,
            // we are using a 10s timer, to go to the next onBoardingStep
            OnBoardingManager.postOnDismissed('focus_add', 10000)

        }, 100);
    }

    isShowing() {
        return this.focusAddJob
    }
}
