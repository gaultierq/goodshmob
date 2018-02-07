// @flow
import React, {Component} from 'react';
import {ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import {Avatar} from "../UIComponents";
import type {User} from "../../types";
import {styleMargin} from "../UIStyles";
import {timeSinceActivity} from "../../helpers/DataUtils";
import {Colors} from "../colors";
import {SFP_TEXT_REGULAR} from "../fonts";
import {Col, Grid, Row} from "react-native-easy-grid";

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
                    <Col style={{ width: 28, justifyContent: 'center'}}>
                        <Avatar user={user} style={{dim: 24}}/>
                    </Col>
                    <Col>
                        <View style={{
                            padding: 4,
                            backgroundColor: 'white',
                            borderRadius: 6,
                            // borderWidth: StyleSheet.hairlineWidth,
                            borderColor: Colors.greyish
                        }}>

                            <Text style={{
                                fontSize: 13,
                                // lineHeight: 20,
                                fontFamily: SFP_TEXT_REGULAR, color: Colors.brownishGrey, }}>{comment.content}
                            </Text>
                        </View>
                    </Col>
                </Row>
                <Row>
                    <Col style={{ width: 28 }}/>
                    <Col>
                        <Text style={[styles.timeSince, {alignSelf: 'flex-start', ...styleMargin(4, 4)}]}>{timeSinceActivity(comment)}</Text>
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

