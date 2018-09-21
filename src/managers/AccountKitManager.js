// @flow

import RNAccountKit, {Color,} from 'react-native-facebook-account-kit'
import {Colors} from "../ui/colors"

export function configure() {

    RNAccountKit.configure({
        theme: {
            // Background
            backgroundColor: Color.hex(Colors.green),
            // Button
            buttonBackgroundColor: Color.hex(Colors.facebookBlue),
            buttonBorderColor: Color.hex(Colors.facebookBlue),
            buttonTextColor: Color.hex(Colors.white),
            // Button disabled
            buttonDisabledBackgroundColor: Color.hex(Colors.greyish),
            buttonDisabledBorderColor: Color.hex(Colors.greyish),
            buttonDisabledTextColor: Color.hex(Colors.white),
            // // Header
            headerBackgroundColor: Color.hex(Colors.green),
            headerButtonTextColor: Color.hex(Colors.white),
            headerTextColor: Color.hex(Colors.white),
            // Others
            iconColor: Color.hex(Colors.white),
            titleColor: Color.hex(Colors.white),
            textColor: Color.hex(Colors.white),
        }})
}
