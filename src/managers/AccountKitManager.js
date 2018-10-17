// @flow

import RNAccountKit, {Color,} from 'react-native-facebook-account-kit'
import {Colors} from "../ui/colors"

export function configure() {

    RNAccountKit.configure({
        theme: {
            // Background
            backgroundColor: Color.hex(Colors.white),
            // Button
            buttonBackgroundColor: Color.hex(Colors.green),
            buttonBorderColor: Color.hex(Colors.green),
            buttonTextColor: Color.hex(Colors.white),
            // Button disabled
            buttonDisabledBackgroundColor: Color.hex(Colors.lightGreen),
            buttonDisabledBorderColor: Color.hex(Colors.lightGreen),
            buttonDisabledTextColor: Color.hex(Colors.white),
            // // Header
            headerBackgroundColor: Color.hex(Colors.white),
            headerButtonTextColor: Color.hex(Colors.black),
            headerTextColor: Color.hex(Colors.black),
            // Others
            iconColor: Color.hex(Colors.green),
            titleColor: Color.hex(Colors.black),
            textColor: Color.hex(Colors.black),
        }})
}
