// @flow

import {Colors} from "../colors"
import OnBoardingManager from "../../managers/OnBoardingManager"
import {AppTour, AppTourSequence, AppTourView} from "../../../vendors/taptarget"
import type {Color} from "../../types"


export class HomeOnBoardingHelper {


    appTourTargets = new Map();

    focusJob: ?number

    registerTapTarget(refName: string, ref: any, primaryText: string, secondaryText: string, backgroundColor: Color) {
        if (this.isShowing()) return
        this.appTourTargets.set(refName, {ref, primaryText, secondaryText, backgroundColor});
    }

    clearTapTarget() {
        this.appTourTargets.clear()
    }

    createAppTourView(primaryText: string, secondaryText: string, backgroundColor: Color, ref: any) {
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
        this.focus(isMounted, 'focus_add')
    }

    handleFocusContribute(isMounted: () => boolean) {
        this.focus(isMounted, 'focus_contribute')
    }

    focus(isMounted, stepName) {
        if (!this.isShowing() && this.appTourTargets.size !== 0) {
            this.focusJob = setTimeout(() => {
                if (!isMounted()) return

                OnBoardingManager.onDisplayed(stepName)


                let appTourSequence = new AppTourSequence()
                this.appTourTargets.forEach(({ref, primaryText, secondaryText, backgroundColor}) => {
                    if (!ref) throw "wtf1 where is my ref"
                    appTourSequence.add(this.createAppTourView(primaryText, secondaryText, backgroundColor, ref))
                })

                if (__IS_IOS__) {
                    AppTour.ShowSequence(appTourSequence)
                }
                else {
                    // temp hack to avoid a crash on android.
                    // was working before, needs more investigations
                }


                //as we don't have a callback on when the tour is finished,
                // we are using a 10s timer, to go to the next onBoardingStep
                OnBoardingManager.postOnDismissed(stepName, 10000)

            }, 100)
        }
    }

    isShowing() {
        return this.focusJob
    }
}
