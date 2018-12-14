// @flow

import React, {Component} from 'react'
import {Image, StyleSheet, Text, View} from 'react-native'
import {HEADER_STYLES, LINEUP_PADDING} from "../UIStyles"
import {SFP_TEXT_BOLD} from "../fonts"
import {Colors} from "../colors"
import type {Lineup, RNNNavigator} from "../../types"
import connect from "react-redux/es/connect/connect"
import {LINEUP_ACTIONS_SELECTOR, LINEUP_SELECTOR} from "../../helpers/Selectors"
import {createStructuredSelector} from "reselect"
import {GLineupAction, L_ADD_ITEM, L_FOLLOW, L_SHARE, L_UNFOLLOW} from "../lineupRights"
import {displayShareLineup} from "../Nav"
import {followLineupPending, unfollowLineupPending} from "./actions"
import GTouchable from "../GTouchable"
import rnTextSize, {type TSFontSpecs, type TSMeasureResult} from 'react-native-text-size'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'


const BACK_BUTTON_WIDTH = 40

const fontSpecs: TSFontSpecs = {
    fontFamily: SFP_TEXT_BOLD,
    fontSize: 40,
}
const logger = rootlogger.createLogger('LineupHeader')


type Props = {
    navigator: RNNNavigator,
    lineup: Lineup,
    actions?: GLineupAction[]
}
type State = {
    buttonsWidth?: number,
    backButtonWidth?: number,
    wordsWidth: TSMeasureResult[],
}

@connect(() => {
    const lineup = LINEUP_SELECTOR()
    const actions = LINEUP_ACTIONS_SELECTOR()
    return createStructuredSelector({lineup,actions})
})
export class LineupHeader extends Component<Props, State> {

    static defaultProps = {
    }

    state = {}


    async calculateWordsWidth(words: string[]) {
        if (this.state.wordsWidth) return
        logger.info("calculateWordsWidth")
        let results = await Promise.all(words.map(text => rnTextSize.measure({
                text,
                ...fontSpecs,
            }
            )
            )
        )
        this.setState({wordsWidth: results})
        logger.info("words dimensions:", results)
    }

    render() {
        let {lineup} = this.props

        if (!lineup.name) return null
        let words = this.getWords(lineup.name)

        this.calculateWordsWidth(words)
        if (!this.state.wordsWidth) return null

        let lines = this.getLines(words)

        return (
            <View
                style={{
                    // flexWrap: "wrap",
                    flex: 1,
                    paddingHorizontal: LINEUP_PADDING,
                }}>

                {lines.map((line, i) => this.renderLine(line, {first: i === 0, last: i === lines.length - 1}))}

            </View>
        )
    }

    getWords(name) {
        let curChar = null, currWord = null
        let words1 = []
        for (var i = 0; i < name.length; i++) {
            curChar = name.charAt(i)
            if (curChar === ' ') {
                if (currWord !== null) {
                    words1.push(currWord)
                    words1.push(' ')
                    currWord = null
                }
            }
            else {
                if (currWord === null) currWord = ''
                currWord += curChar
            }
        }
        if (currWord) words1.push(currWord)
        let words = words1
        return words
    }

    getLines(words) {
        let widths = {
            first: __DEVICE_WIDTH__ - 2 * LINEUP_PADDING - (this.state.backButtonWidth || BACK_BUTTON_WIDTH) - LINEUP_PADDING,
            middle: __DEVICE_WIDTH__ - 2 * LINEUP_PADDING,
            last: __DEVICE_WIDTH__ - 2 * LINEUP_PADDING - (this.state.buttonsWidth || 60)
        }

        let lines = []

        // 1st pass, we forget about the trailing buttons
        let currLine = null, curLineW = 0

        for (let i = 0; i < words.length; i++) {
            let availWidth = lines.length === 0 ? widths.first : widths.middle
            let w = words[i]
            let ww = this.state.wordsWidth[i].width
            if (curLineW + ww < availWidth) {
                if (currLine === null) currLine = ''
                currLine += w
                curLineW += ww
            }
            else {
                //not enough space
                if (currLine !== null) {
                    lines.push(currLine)
                }
                else {
                    //word too long

                }
                currLine = w
                curLineW = ww
            }
        }
        if (currLine) lines.push(currLine)

        //2nd pass: including the trailing buttons
        let cut = 0
        if (curLineW > widths.last) {
            lines.pop()
            //need to cut it
            for (let i = words.length; i-- > 0;) {
                let w = words[i]
                let ww = this.state.wordsWidth[i].width
                if (curLineW < widths.last) {
                    //finish
                    lines.push(currLine.substr(0, currLine.length - cut))
                    lines.push(currLine.substr(currLine.length - cut))
                    break

                }
                else {
                    curLineW -= ww
                    cut += w.length
                }
            }
        }
        return lines
    }

    renderBackButton() {

        return (
            <GTouchable
                onLayout={e => this.setState({  backButtonWidth: _.get(e, 'nativeEvent.layout.width') })}
                onPress={() => this.props.navigator.dismissModal()}
                style={{
                    // paddingVertical: LINEUP_PADDING,
                    paddingRight: LINEUP_PADDING
                }}>
                <Image source={require('../../img2/backArrowBlack.png')}
                       style={{
                           width: BACK_BUTTON_WIDTH,
                       }}
                />
            </GTouchable>
        )
    }

    renderLine(line: string, {first, last}: {first: boolean, last: boolean}) {
        const lol = [fontSpecs, {

            color: Colors.black,
            // backgroundColor: 'green',
        }]
        return (
            <View
                key={`line-${line}`}
                style={{
                    flex: 1,
                    flexDirection: 'row',
                    // justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                {first && this.renderBackButton()}
                <Text style={lol}>{line}</Text>
                {last && <View onLayout={e => this.setState({  buttonsWidth: _.get(e, 'nativeEvent.layout.width') })} style={{
                    // flex: 1,
                    height: '100%',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    marginBottom: 18,
                    // backgroundColor: 'purple',
                }}>{this.renderButtons()}</View>}
            </View>
        )
    }

    renderButtons() {
        let {lineup, actions} = this.props
        let button, shareB
        if (actions) {
            if (actions.indexOf(L_FOLLOW) >= 0) {
                button = <Text onPress={()=>{
                    followLineupPending(this.props.dispatch, lineup)
                }} style={[styles.button_dim, styles.button, styles.button_active]}>{i18n.t('actions.follow')}</Text>
            }
            else if (actions.indexOf(L_UNFOLLOW) >= 0) {
                button = <Text onPress={()=>{
                    unfollowLineupPending(this.props.dispatch, lineup)
                }} style={[styles.button_dim, styles.button, styles.button_inactive]}>{i18n.t('actions.followed')}</Text>
            }
            else if (actions.indexOf(L_ADD_ITEM) >= 0) {
                // button = <Text onPress={()=>{
                //     startAddItem(this.props.navigator, lineup.id)
                // }} style={[styles.button_dim, styles.button, styles.button_inactive]}>{i18n.t('actions.add')}</Text>
            }

            if (actions.indexOf(L_SHARE) >= 0) {
                shareB = (
                    <GTouchable
                        onPress={()=>{
                            displayShareLineup({
                                navigator: this.props.navigator,
                                lineup: this.props.lineup,
                            })
                        }}
                        style={{
                            alignItems: 'center',
                            marginLeft: LINEUP_PADDING / 2,
                        }}
                    >
                        <MaterialIcons style={{}} name={__IS_IOS__ ? 'share' : 'share'} size={24} color={Colors.grey}/>

                    </GTouchable>)
            }
        }
        return [button, shareB]
    }
}
const styles = HEADER_STYLES
