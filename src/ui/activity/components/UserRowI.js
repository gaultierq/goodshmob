// @flow

import type {Node} from 'react'
import React from 'react'


import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import type {TextStyle, User} from "../../../types"
import {ViewStyle} from "../../../types"
import {fullName} from "../../../helpers/StringUtils"
import {Avatar} from "../../UIComponents"
import PeopleRowI from "./PeopleRow"

type Props = {
    user: User,
    noImage?: boolean,
    children?: Node,
    rightComponent?: Node,
    small?: boolean,
    style?: ViewStyle,
    textStyle?: TextStyle,
}

type State = {
};

export default class UserRowI extends React.Component<Props, State> {

    // render() {
    //
    //     const {small, user, style, textStyle, noImage, rightComponent} = this.props;
    //
    //     let imageDim = small ? 20 : 30;
    //
    //     return <View style={[{flex:1, }, style, styles.userContainer]}>
    //         {
    //             !noImage && <Avatar user={user} size={imageDim} style={{marginRight: 8}}/>
    //         }
    //
    //         <View style={{flex:1}}>
    //             <View style={[styles.rightContainer]}>
    //                 <Text style={[styles.rightText, textStyle]}>
    //                     {fullName(user)}
    //                 </Text>
    //                 {rightComponent}
    //
    //             </View>
    //
    //             {this.props.children}
    //
    //         </View>
    //
    //     </View>
    // }

    render() {
        const {small, user, noImage, ...attr} = this.props
        let imageDim = small ? 20 : 30
        return (
            <PeopleRowI
                leftImage={!noImage && <Avatar user={user} size={imageDim} style={{marginRight: 8}}/>}
                leftText={fullName(this.props.user) }
                {...attr}
            />
        )
    }

}

// const styles = StyleSheet.create({
//     userContainer: {alignItems: 'center', flexDirection: 'row'},
//     rightContainer: {flexDirection: 'row'},
//     rightText: {alignSelf: 'center', fontSize: 13, color: Colors.black, fontFamily: SFP_TEXT_BOLD}
// });
