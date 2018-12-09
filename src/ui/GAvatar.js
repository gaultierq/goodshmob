// @flow

import React, {Component} from 'react'
import {Image, LayoutAnimation, Platform, StyleSheet, Text, UIManager, View} from 'react-native'
import {AVATAR_BACKGROUNDS, Colors} from "./colors"
import type {Person} from "../types"
import {ViewStyle} from "../types"
import GImage from "./components/GImage"
import {firstLetter, hashCode, isId} from "../helpers/StringUtils"
import {SFP_TEXT_REGULAR} from "./fonts"
import {selectDimension} from "./UIStyles"
import {buildUserUrl, openLinkSafely} from "../managers/Links"
import GTouchable from "./GTouchable"

type Props = {
    person: Person,
    size: number,
    style?: ViewStyle,
    seeable?: boolean,
}
type State = {}

export class GAvatar extends Component<Props, State> {

    static defaultProps = {
        size: selectDimension({small: 34, normal: 36, big: 40})
    }
    static FACEBOOK_REGEX = /^https:\/\/graph\.facebook\.com\/[0-9]+\/picture$/

    render() {
        if (this.props.seeable) {

            const user = this.props.person
            if (!user) throw "null user"
            if (!isId(user.id)) throw "invalid user id:" + user.id

            let uri = buildUserUrl(user)
            return <GTouchable  onPress={() => openLinkSafely(uri)}>{this.renderInner()}</GTouchable>
        }
        return this.renderInner()
    }
    renderInner() {
        const {person, style, size, ...attributes} = this.props;

        let uri = null

        if (person) {
            uri = person.image

            if (_.isEmpty(uri)) {

                const colorId = hashCode(person.id) % AVATAR_BACKGROUNDS.length
                const color = AVATAR_BACKGROUNDS[colorId]

                const initials = firstLetter(person.firstName) + firstLetter(person.lastName)
                if (initials.length === 0) return null

                return <View style={[{
                    height: size,
                    width: size,
                    borderRadius: size / 2,
                    backgroundColor: color,
                    paddingLeft: size / 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                }, style]}>
                    <Text style={{
                        color: Colors.white,
                        fontFamily: SFP_TEXT_REGULAR,
                        fontSize: size / 2.3
                    }}>{initials.toUpperCase()}</Text>
                </View>
            }
        }

        let params
        if (uri) {
            // make facebook images not blury
            if (size >= 60 && uri.match(GAvatar.FACEBOOK_REGEX)) {
                uri += "?type=large"
            }
            params = {
                source: {uri},
                fallbackSource: require('../img2/default-avatar.png')
            }
        }
        else {
            params = {
                source: require('../img2/default-avatar.png')
            }

        }

        return (
            <GImage
                {...params}
                style={[{
                    height: size,
                    width: size,
                    borderRadius: size / 2,
                    borderWidth: StyleSheet.hairlineWidth,
                    borderColor: Colors.greyish,

                }, style]}
                {...attributes}
            />
        )
    }
}
