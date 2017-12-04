'use strict';
// @flow

import React, {Component} from 'react';

import {
    ActivityIndicator,
    Button,
    Image,
    ImageBackground,
    Linking,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import {connect} from 'react-redux';
import type {Id, RequestState} from "../types";
import {buildData, dataStateToProps} from "../utils/DataUtils";
import ApiAction from "../utils/ApiAction";
import * as Api from "../utils/Api";
import * as authActions from '../auth/actions'
import {currentUserId} from "../CurrentUser";

import * as UI from "./UIStyles";
import {renderLink, renderSimpleButton} from "./UIStyles";
import SmartInput from "./components/SmartInput";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

type Props = {
    // userId: Id,
    data: any
};

type State = {
    //user?: User
    feedback?: string,
    reqLogout?: RequestState
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

        return (

            <ImageBackground
                source={require('../img/welcome_screen.jpg')}
                style={{
                    flex: 1,
                    alignItems: 'center',
                }}
            >
                <KeyboardAwareScrollView
                    scrollEnabled={false}
                    contentContainerStyle={{flex: 1}}
                >
                    <View style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>

                        <Image style={{width: 200, marginBottom: 25}} source={require('../img/logo_goodsh.png')}
                               resizeMode="contain"/>

                        {this.renderUser(user)}

                        <Text style={{
                            fontFamily: 'Chivo',
                            marginBottom: 20,
                            fontSize: 17,
                            marginTop: 18
                            // fontWeight: 'bold'
                        }}>{i18n.t('profile_screen.title', {love: i18n.t('profile_screen.love')})}</Text>
                        <Text style={{fontSize: 15, textAlign: "center"}}>{i18n.t('profile_screen.subtitle')}</Text>


                        <SmartInput
                            containerStyle={{padding: 6}}
                            inputStyle={{fontSize: 17}}
                            inputContainerStyle={{padding: 4, borderRadius: 4, borderWidth: 1}}
                            execAction={(input: string) => this.sendFeedback(input)}
                            placeholder={"profile_screen.feedback_textfield.placeholder"}
                            multiline
                            height={100}
                        />



                        {renderSimpleButton("logout", this.logout.bind(this), {loading: this.state.reqLogout === 'sending'})}

                        {renderLink("Terms", "https://goodsh.it/terms")}

                    </View>
                </KeyboardAwareScrollView>
            </ImageBackground>

        );
    }

    renderUser(user) {
        return <View style={{
            flexDirection: 'row',
            alignItems: 'center',
        }}
        >
            {user && user.image && <Image source={{uri: user.image}}
                                          style={styles.userAvatar}
            />}
            {user && <Text style={styles.userName}>{user.firstName + " " + user.lastName}</Text>}

        </View>;
    }

    sendFeedback(input: string) {
        return new Promise((resolve, reject)=> {

            let url = `mailto:feedback@goodsh.it?subject=GOODSH' Feedback&body=${input}`;
            Linking.canOpenURL(url).then(supported => {
                if (supported) {
                    Linking.openURL(url);
                    resolve();
                } else {
                    let message = "Don't know how to open URI: " + url;
                    console.log(message);
                    reject(message);
                }
            });

            resolve();
        });
    }

    logout() {
        Api.safeExecBlock.call(
            this,
            () => {
                return authActions.logout(this.props.dispatch)
            },
            'reqLogout'
        );
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
