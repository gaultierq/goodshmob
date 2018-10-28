// @flow

import React, {Component} from 'react'
import {Image, LayoutAnimation, Platform, StyleSheet, Text, UIManager, View} from 'react-native'
import {AVATAR_BACKGROUNDS, Colors} from "./colors"
import type {Person} from "../types"
import {ViewStyle} from "../types"
import GImage from "./components/GImage"
import {firstLetter, hashCode} from "../helpers/StringUtils"
import {SFP_TEXT_REGULAR} from "./fonts"
import {selectDimension} from "./UIStyles"

type Props = {
    person: Person,
    size: number,
    style?: ViewStyle
}
type State = {}

export class GAvatar extends Component<Props, State> {


    static defaultProps = {
        size: selectDimension({small: 34, normal: 36, big: 40})
    }

    render() {
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
