'use strict';
// @flow

import React, {Component} from 'react';

import {ActivityIndicator, Button, Image, ImageBackground, StyleSheet, Text, View} from 'react-native';
import {connect} from 'react-redux';
import type {Id, User} from "../types";
import {buildData, dataStateToProps} from "../utils/DataUtils";
import ApiAction from "../utils/ApiAction";
import * as Api from "../utils/Api";
import * as authActions from '../auth/actions'
import {currentUserId} from "../CurrentUser";

type Props = {
    // userId: Id,
    data: any
};

type State = {
    user?: User
};

class Profile extends Component<Props, State> {

    state = {user: null};


    constructor(props) {
        super(props);

    }

    componentWillMount() {
        // let {userId} = this.props;
        // if (!userId) throw "provide userId";

        let userId = currentUserId();

        if (!this.getUser(userId)) {
            this.props.dispatch(actions.getUser(userId).disptachForAction2(GET_USER)).then((data)=>{
                let user = this.getUser(userId);
                this.setState({user});
            });
        }
    }

    render() {
        let {user} = this.state;

        return (
            <ImageBackground
                source={require('../img/welcome_screen.jpg')}
                style={{
                    flex: 1,
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                }}
            >
                <View style={{
                    alignItems: 'center',
                }}>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}
                    >
                        {user && user.image && <Image source={{uri: user.image}}
                                                      style={styles.userAvatar}

                        />}
                        {user && <Text style={styles.userName}>{user.firstName + " " + user.lastName}</Text>}

                    </View>
                    <Button
                        title="logout"
                        onPress={this.logout.bind(this)}
                    />
                </View>
            </ImageBackground>
        );
    }

    logout() {
        this.props.dispatch(authActions.logout());
    }

    getUser(userId: Id) {
        const {data} = this.props;

        return buildData(data, "users", userId);
    }
}

const GET_USER = new ApiAction("get_user(profile)");

const actions = (() => {

    const include = "";

    return {
        getUser: (userId): Api.Call => new Api.Call()
            .withMethod('GET')
            .withRoute(`users/${userId}`)
            .addQuery({include}),

    };
})();


const styles = StyleSheet.create({
    userName: {
        fontSize: 20,
        fontFamily: 'Chivo',
        //color: UI.Colors.grey1,
        padding: 10,
    },
    userAvatar: {
        height: 50,
        width: 50,
        borderRadius: 25
    },
});



let screen = connect(dataStateToProps)(Profile);

export {screen};
