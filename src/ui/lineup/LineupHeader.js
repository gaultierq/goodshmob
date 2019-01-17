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
import Feather from 'react-native-vector-icons/Feather'
import {HomeOnBoardingHelper} from "../screens/HomeOnBoardingHelper"
import OnBoardingManager from "../../managers/OnBoardingManager"


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
}

@connect(() => {
    const lineup = LINEUP_SELECTOR()
    const actions = LINEUP_ACTIONS_SELECTOR()
    return createStructuredSelector({
        lineup,
        actions,
        onBoarding: (state, props) => state.onBoarding

    })
})
export class LineupHeader extends Component<Props, State> {

    static wordsWidthCache = {}

    state = {}
    onBoardingHelper = new HomeOnBoardingHelper()
    _mount: boolean = false
    componentDidMount() {
        let info = OnBoardingManager.getInfoToDisplay(this.props.onBoarding, {group: "full_focus", persistBeforeDisplay: true})
        if (_.get(info, 'type') === 'focus_contribute') {
            setTimeout(() => {
                this.onBoardingHelper.handleFocusContribute(() => this._mounted)
            }, 1000)
        }

        this._mounted = true
    }

    componentWillUnmount() {
        this._mounted = false
        this.onBoardingHelper.clearTapTarget()
    }

    render() {
        let {lineup} = this.props

        let name = _.get(lineup, 'name')
        let words = this.getWords(name)

        let wordsWidth = this.obtainWordsWidth(words)
        if (!wordsWidth ) {
            logger.debug("returning null while calculating words width")
            return null
        }

        let lines = this.getLines(words, wordsWidth)

        return (
            <View
                style={{
                    // flexWrap: "wrap",
                    flex: 1,
                    paddingHorizontal: LINEUP_PADDING,
                    minHeight: 48,
                    // backgroundColor: 'blue',
                }}>

                {lines.map((line, i) => this.renderLine(line, {first: i === 0, last: i === lines.length - 1}))}

            </View>
        )
    }

    obtainWordsWidth(words: string[]) {
        let results = Array(words.length)
        let missing = []
        for (let i = 0; i < words.length; i++) {
            let w = words[i]
            const cache = LineupHeader.wordsWidthCache[w]
            if (cache) {
                results[i] = cache
            }
            else {
                const job = this.calcWordWidth(w).then(width => {
                    logger.info(`'${w}' dimensions:`, width)
                    LineupHeader.wordsWidthCache[w] = width
                })
                missing.push(job)
            }
        }
        if (_.isEmpty(missing)) {
            return results
        }
        else {
            Promise.all(missing).then(() => {this.forceUpdate()})
            return null
        }


        // logger.info("words dimensions:", results)
    }

    async calcWordWidth(text: string) {
        return rnTextSize.measure({
                text,
                ...fontSpecs,
            }
        )
    }

    getWords(name) {
        if (!name) return []
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

    getLines(words, wordsWidth) {
        const baseWidth = __DEVICE_WIDTH__ - 2 * LINEUP_PADDING
        const backButtonWidth = (this.state.backButtonWidth || BACK_BUTTON_WIDTH) + LINEUP_PADDING
        const actionButtonWidth = this.state.buttonsWidth || 60
        const availableWidth = (isFirst = false, isLast = false) => baseWidth - isFirst * backButtonWidth - isLast * actionButtonWidth

        let lines = []

        // 1st pass, we forget about the trailing buttons
        let currLine = null, curLineW = 0

        for (let i = 0; i < words.length; i++) {
            let availWidth = availableWidth(lines.length === 0, false)
            let w = words[i]
            let ww = wordsWidth[i].width
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
        if (curLineW > availableWidth(lines.length <= 1,true)) {
            //currLine is already set
            lines.pop()

            //we need to cut currLine into 2
            for (let i = words.length; i-- > 0;) {
                let w = words[i]
                let ww = wordsWidth[i].width
                if (curLineW < availableWidth(lines.length <= 1,true)) {
                    //finish
                    lines.push(currLine.substr(0, currLine.length - cut))
                    lines.push(currLine.substr(currLine.length - cut))
                    break

                }
                else {
                    curLineW -= ww
                    cut += w.length

                    //hack for single line long word
                    if (words.length === 1) {
                        cut = currLine.length / 2
                        lines.push(currLine.substr(0, currLine.length - cut))
                        lines.push(currLine.substr(currLine.length - cut))
                    }
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
                button = <Text
                    ref={ref => this.onBoardingHelper.registerTapTarget(
                        'contribute', ref, i18n.t("focus_contribute_title"),
                        i18n.t("focus_contribute_text"), Colors.orange)}
                    onPress={()=>{
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

                        {__IS_IOS__ && <Feather name={'share'} size={24} color={Colors.grey}/>}
                        {!__IS_IOS__ && <MaterialIcons name={'share'} size={24} color={Colors.grey}/>}

                    </GTouchable>)
            }
        }
        return (
            <View style={{flexDirection: 'row'}}>
                {button}
                {shareB}
            </View>
        )
        // return [button, shareB]
    }
}
const styles = HEADER_STYLES
