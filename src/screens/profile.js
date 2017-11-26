'use strict';
// @flow

import React, {Component} from 'react';

import {ActivityIndicator, Button, Image, ImageBackground, StyleSheet, Text, View, TextInput} from 'react-native';
import {connect} from 'react-redux';
import type {Id, User} from "../types";
import {buildData, dataStateToProps} from "../utils/DataUtils";
import ApiAction from "../utils/ApiAction";
import * as Api from "../utils/Api";
import * as authActions from '../auth/actions'
import {currentUserId} from "../CurrentUser";
import i18n from '../i18n/i18n'
import * as UI from "./UIStyles";
import {renderSimpleLink} from "./UIStyles";
import {renderLink} from "./UIStyles";
import {renderSimpleButton} from "./UIStyles";

type Props = {
    // userId: Id,
    data: any
};

type State = {
    //user?: User
    feedback?: string
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
            this.props.dispatch(actions.getUser(userId).disptachForAction2(GET_USER)).then(({data})=>{
                //let user = this.getUser(userId);
                //this.setState({user});
            });
        }
    }

    render() {
        let user = this.getUser(currentUserId());

        let notEditable = false;

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


                {/*user*/}
                <View style={{
                    alignItems: 'center',
                }}>

                    <Image style={{marginBottom: 20}} source={require('../img/goodsh.png')}/>
                    <Text style={{fontFamily: 'Chivo', marginBottom: 20, fontSize: 14, fontWeight: 'bold'}}>{i18n.t('profile_screen.title', {love: i18n.t('profile_screen.love')})}</Text>
                    <Text style={{fontSize: 14, textAlign: "center"}}>{i18n.t('profile_screen.subtitle')}</Text>


                    <TextInput
                        editable={!notEditable}
                        onSubmitEditing={this.createFeedback.bind(this)}
                        value={this.state.feedback}
                        multiline
                        onChangeText={(feedback) => this.setState({feedback})}
                        placeholder={i18n.t('profile_screen.feedback_textfield.placeholder')}
                        style={[
                            styles.input,
                            (notEditable ? {color: "grey"} : {color: "black"}),
                            {margin: 20}
                        ]}
                    />

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

                    {renderSimpleButton("logout", this.logout.bind(this))}

                    {renderLink("Terms", "https://goodsh.it/terms")}

                </View>
            </ImageBackground>
        );
    }


    createFeedback() {

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
        getUser: (userId: Id) => new Api.Call()
            .withMethod('GET')
            .withRoute(`users/${userId}`)
            .addQuery({include}),

    };
})();


const styles = StyleSheet.create({
    input:{
        height: 100,
        width: "80%",
        fontFamily: 'Chivo',
        fontSize: 14,
        borderWidth: 0.5,
        borderRadius: 5,
        borderColor: UI.Colors.grey1,

    },
    userName: {
        fontSize: 20,
        fontFamily: 'Chivo',
        //color: UI.Colors.grey1,
        padding: 10,
    },
    userAvatar: {
        height: 30,
        width: 30,
        borderRadius: 15
    },
});



let screen = connect(dataStateToProps)(Profile);

export {screen};
