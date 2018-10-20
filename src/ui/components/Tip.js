import React from 'react'
import {Image, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native'
import {Colors} from "../colors"
import {SFP_TEXT_MEDIUM} from "../fonts"
import GTouchable from "../GTouchable"
import {ViewStyle} from "../../types"
import Icon from 'react-native-vector-icons/MaterialIcons'
import {Col, Grid, Row} from "react-native-easy-grid"

type Props = {
    text: string,
    title: string,
    button: string,
    style?: ViewStyle,
    onClickClose?: () => void,

}
type State = {}

const SPACING = 18
const LOGO_DIMENSION = 78
const RADIUS = 4;
const COLOR = Colors.greyishBrown;

export class Tip extends React.Component<Props, State> {

    render() {
        const {style, onClickClose, button, title, text, materialIcon} = this.props;

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
                    backgroundColor: Colors.blue,
                    borderTopLeftRadius: RADIUS,
                    borderTopRightRadius: RADIUS,
                }}>
                    <Text style={{
                        color: Colors.white,
                        fontSize: 24,
                        // backgroundColor:'green',
                        fontFamily: SFP_TEXT_MEDIUM,

                    }}>{title}</Text>
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
                            // marginRight: 40,
                            // justifyContent: 'center',
                            // backgroundColor:'red',
                            // textAlign: 'center',
                            // fontFamily: SFP_TEXT_ITALIC,

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
                                // backgroundColor: 'purple'
                            }}
                            name={materialIcon} size={LOGO_DIMENSION} color={Colors.brownishGrey}/>
                    </Col>

                </Row>
                <Row style={{
                    padding: SPACING,
                    // backgroundColor:'purple',
                    justifyContent: 'flex-end',
                }}>
                    <GTouchable onPress={onClickClose} style={{
                        // marginTop: 30,
                        // backgroundColor:'purple',

                    }}>
                        <Text style={{
                            color: Colors.blue,
                            fontSize: 19,
                            lineHeight: 22,
                            // textAlign: 'center',
                            // backgroundColor:'green',
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
