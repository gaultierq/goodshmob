// @flow
import React, {Component} from 'react';
import {ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import {Avatar} from "../UIComponents";
import type {User} from "../../types";
import {styleMargin, stylePadding} from "../UIStyles";
import {timeSinceActivity} from "../../helpers/DataUtils";
import {Colors} from "../colors";
import {SFP_TEXT_REGULAR} from "../fonts";
import {Col, Grid, Row} from "react-native-easy-grid";

type Props = {
    comment: Comment | Array<Comment>,
    user: User,
    skipTime?: boolean,
    rightDisplay?: boolean,
    textContainerStyle?: *
};

type State = {
};

export default class CommentCell extends Component<Props, State> {

    render() {
        const {comment, user, skipTime, textContainerStyle} = this.props;
        if (!comment||!user) {
            console.warn("invalid comment props: " + user + comment);
            return null;
        }
        const comments: Array<Comment> = _.isArray(comment) ? comment : [comment];

        const dimension = 32;
        const rightDisplay = this.props.rightDisplay;


        let borderStyle = (i, radius) => {

            const smallRadius = 4;
            let isFirst = i === 0;
            let isLast = i === comments.length - 1;
            if (rightDisplay) {
                return {
                    borderTopLeftRadius: radius,
                    borderTopRightRadius: isFirst ? radius : smallRadius,
                    borderBottomRightRadius: isLast ? radius : smallRadius,
                    borderBottomLeftRadius: radius,
                };
            }
            else {
                return {
                    borderTopLeftRadius: isFirst ? radius : smallRadius,
                    borderTopRightRadius: radius,
                    borderBottomRightRadius: radius,
                    borderBottomLeftRadius: isLast ? radius : smallRadius,
                };
            }

        };

        return (
            <Grid>
                <Row style={{ }}>
                    <Col style={{ width: dimension, justifyContent: 'flex-start'}}>
                        {!rightDisplay && <Avatar user={user} style={{dim: 24}}/>}
                    </Col>
                    <Col style={{ alignItems: rightDisplay ? 'flex-end': 'flex-start', }}>
                        {comments.map((comment: Comment, i) => <Row style={{marginTop: !!i ? 4 : 0}} key={comment.id}>
                            <View style={{flexDirection: "row"}}>
                                <View style={[{
                                    ...stylePadding(12, 4),
                                    backgroundColor: rightDisplay ? Colors.green : Colors.white,
                                    // borderRadius: 12,
                                    ...borderStyle(i, 12),
                                    borderColor: Colors.greyish,
                                }, textContainerStyle]}>

                                    <Text style={{
                                        fontSize: 13,
                                        // lineHeight: 20,
                                        // backgroundColor: 'red',
                                        fontFamily: SFP_TEXT_REGULAR,
                                        color: rightDisplay ? Colors.white : Colors.brownishGrey,
                                    }}>{comment.content}
                                    </Text>
                                </View>
                            </View>
                        </Row>)}
                    </Col>
                </Row>
                {!skipTime &&
                <Row>
                    <Col style={{width: dimension}}/>
                    <Col>
                        <Text
                            style={[styles.timeSince, {alignSelf: 'flex-start', ...styleMargin(4, 4)}]}>{timeSinceActivity(comment)}</Text>
                    </Col>
                </Row>
                }
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

