import React from 'react'
import {Image, Linking, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native'
import {Colors} from "../colors"
import {SFP_TEXT_MEDIUM} from "../fonts"
import GTouchable from "../GTouchable"
import {ViewStyle} from "../../types"
import Icon from 'react-native-vector-icons/MaterialIcons'
import {Col, Grid, Row} from "react-native-easy-grid"
import type {Color, Url} from "../../types"
import OnBoardingManager from "../../managers/OnBoardingManager"
import {openLinkSafely} from "../UIStyles"

type Props = {
    text: string,
    title: string,
    button: string,
    style?: ViewStyle,
    onClickClose?: () => void,
    color: Color,
    link?: Url

}
type State = {}

const SPACING = 18
const LOGO_DIMENSION = 78
const RADIUS = 4;
const COLOR = Colors.greyishBrown;

export class Tip extends React.Component<Props, State> {

    static defaultProps = {
        color: Colors.blue
    }

    render() {
        const {style, onClickClose, button, title, text, materialIcon} = this.props;

        const mainColor = this.props.color

        return (
            <Grid style={[{
                borderRadius: RADIUS,
                backgroundColor: Colors.white,
                shadowColor: Colors.greyishBrown,
                shadowOffset: {width: 4, height: 4},
                shadowOpacity: 0.3,
                shadowRadius: 6,
            }, style]}>
                <Row style={{
                    padding: SPACING,
                    backgroundColor: mainColor,
                    borderTopLeftRadius: RADIUS,
                    borderTopRightRadius: RADIUS,
                    justifyContent: 'space-between',
                }}>
                    <Text style={{
                        color: Colors.white,
                        fontSize: 24,
                        // backgroundColor:'green',
                        fontFamily: SFP_TEXT_MEDIUM,
                    }}>{title}</Text>
                    <GTouchable onPress={onClickClose} style={{position: 'absolute', right: 10, top: 10}}>
                        <Image source={require('../../img2/closeXWhite.png')} resizeMode="contain" />
                    </GTouchable>
                </Row>
                <Row style={{
                    // backgroundColor: 'green',
                    padding: SPACING,
                }}>
                    <Col style={{
                        // backgroundColor: 'yellow',
                        paddingRight: SPACING / 2,
                        justifyContent: 'center',
                    }}>
                        <Text style={{
                            color: COLOR,
                            fontSize: 18,
                            lineHeight: 22,
                        }}>{text}</Text>
                    </Col>

                    <Col style={{
                        width: LOGO_DIMENSION,
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                        marginLeft: SPACING / 2,
                    }}>
                        <Icon
                            style={{
                            }}
                            name={materialIcon} size={LOGO_DIMENSION} color={Colors.brownishGrey}/>
                    </Col>

                </Row>
                <Row style={{
                    padding: SPACING,
                    // backgroundColor:'purple',
                    justifyContent: 'flex-end',
                }}>
                    <GTouchable onPress={() => {
                        if (this.props.link) {
                            openLinkSafely(this.props.link)
                        }
                        // TODO clean up
                        if (onClickClose) onClickClose()
                    }} style={{

                    }}>
                        <Text style={{
                            color: mainColor,
                            fontSize: 19,
                            lineHeight: 22,
                            marginVertical: 10,
                            fontFamily: SFP_TEXT_MEDIUM,

                        }}>{button}</Text>
                    </GTouchable>
                </Row>
            </Grid>
        )
    }
}


export type TipConfig = {
    type: string, //for statistics
    keys: any,
    materialIcon: string

}

export function renderTip(currentTip: TipConfig) {

    let {keys, ...attr} = currentTip;
    let res = {};
    ['title', 'text', 'button'].forEach(k=> {
        res[k] = i18n.t(`${keys}.${k}`)
    })
    return <Tip
        {...res}
        {...attr}
        style={{margin: 10}}
        onClickClose={() => {
            OnBoardingManager.postOnDismissed(currentTip.type)
        }}

    />;
}
