// @flow
import React, {Component} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {connect} from "react-redux";
import {MainBackground} from "./UIComponents";
import Immutable from 'seamless-immutable';
import * as Api from "../utils/Api";
import Feed from "./components/feed";
import type {Activity} from "../types";
import ApiAction from "../utils/ApiAction";
import {sanitizeActivityType} from "../utils/DataUtils";

class CommentsScreen extends Component {

    props : {
        activity: Activity,
    };

    render() {

        return (
            <MainBackground>
                <View style={styles.container}>
                    <Feed
                        data={this.props.comments.list}
                        renderItem={this.renderItem.bind(this)}
                        fetchSrc={{
                            callFactory:()=>actions.loadComments(this.props.activity),
                            action:actionTypes.LOAD_COMMENTS
                        }}
                        hasMore={false}
                    />

                </View>
            </MainBackground>
        );
    }

    renderItem(item) {
        return <Text>{item.id}</Text>;
    }


}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});

const mapStateToProps = (state, ownProps) => ({
    comments: state.comments,
    data: state.data,
});


const actionTypes = (() => {

    const LOAD_COMMENTS = new ApiAction("load_comments");

    return {LOAD_COMMENTS};
})();


const actions = (() => {
    return {

        loadComments: (activity: Activity) => {

            let activityType = sanitizeActivityType(activity.type);

            return new Api.Call()
                .withMethod('GET')
                .withRoute(`${activityType}/${activity.id}/comments`);
        }
    };
})();

const reducer = (() => {
    const initialState = Immutable(Api.initialListState());

    return (state = initialState, action = {}) => {
        let desc = {fetchFirst: actionTypes.LOAD_COMMENTS};
        return Api.reduceList(state, action, desc);
    }
})();

let screen = connect(mapStateToProps)(CommentsScreen);

export {reducer, screen, actions};
