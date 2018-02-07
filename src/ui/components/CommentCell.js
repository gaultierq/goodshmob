// @flow
import React, {Component} from 'react';
import {ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import ApiAction from "../../helpers/ApiAction";
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import UserActivity from "../activity/components/UserActivity";
import {Avatar} from "../UIComponents";
import type {User} from "../../types";
import {styleMargin, stylePadding} from "../UIStyles";
import {timeSince} from "../../helpers/TimeUtils";
import {timeSinceActivity} from "../../helpers/DataUtils";
import {Colors} from "../colors";
import {SFP_TEXT_REGULAR} from "../fonts";
import { Col, Row, Grid } from "react-native-easy-grid";

type Props = {
    comment: Comment,
    user: User
};

type State = {
};

export default class CommentCell extends Component<Props, State> {

    render() {
        const {comment, user} = this.props;
        if (!comment||!user) {
            console.warn("invalid comment props: " + user + comment);
            return null;
        }
        return (
            <Grid>
                <Row style={{ }}>
                    <Col style={{ width: 28 }}>
                        <Avatar user={user} style={{dim: 24}}/>
                    </Col>
                    <Col>
                        <View style={{
                            padding: 6, backgroundColor: 'white', borderRadius: 4,
                            // borderWidth: StyleSheet.hairlineWidth,
                            borderColor: Colors.greyish
                        }}>

                            <Text style={{
                                fontSize: 14, lineHeight: 14,
                                fontFamily: SFP_TEXT_REGULAR, color: Colors.brownishGrey, }}>{comment.content}
                            </Text>
                        </View>
                    </Col>
                </Row>
                <Row>
                    <Col style={{ width: 28 }}/>
                    <Col>
                        <Text style={[styles.timeSince, {alignSelf: 'flex-start', ...styleMargin(0, 4)}]}>{timeSinceActivity(comment)}</Text>
                    </Col>
                </Row>
            </Grid>
        );
    }

}


const styles = StyleSheet.create({
    timeSince: {
        fontSize: 10,
        lineHeight: 10,
        color: Colors.greyish,
    },
});

