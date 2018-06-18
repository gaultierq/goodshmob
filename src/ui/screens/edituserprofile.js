// @flow
import React from 'react';
import {Platform, StyleSheet, Text, TextInput, View} from 'react-native';
import type {Props as LineupProps} from "./lineuplist";
import Screen from "../components/Screen";
import type {Id, RequestState, User} from "../../types";
import {renderSimpleButton} from "../UIStyles";
import * as Api from "../../managers/Api";
import {safeDispatchAction} from "../../managers/Api";
import ApiAction from "../../helpers/ApiAction";
import {connect} from "react-redux";
import {actions as userActions, actionTypes as userActionTypes} from "../../redux/UserActions";
import {buildData} from "../../helpers/DataUtils";
import {Avatar, FullScreenLoader} from "../UIComponents";
import {Colors} from "../colors"
import _Messenger from "../../managers/Messenger"
import Http404 from "./errors/404"

type Props = LineupProps & {
    userId: Id
};

type State = {
    reqSave?: RequestState,
    reqFetchUser?: RequestState,
    userId: Id,
    firstName: string,
    lastName: string,
    updated: boolean,
    user: any,
};

@connect(state => ({
    data: state.data,
}))
export default class EditUserProfileScreen extends Screen<Props, State> {

    state = {
        firstName: '',
        lastName: '',
        updated: false,
    }

    componentDidMount() {
        Api.safeDispatchAction.call(
            this,
            this.props.dispatch,
            userActions.getUser(this.props.userId).createActionDispatchee(userActionTypes.GET_USER),
            'reqFetchUser'
        )
            .then(() => {
                const user = this.getUser()
                if (user) {
                    this.setState({
                        firstName: user.firstName || '',
                        lastName: user.lastName || ''
                    })
                }
            })
    }


    render() {

        if (this.state.reqFetchUser !== 'ok') {
            if (this.state.reqFetchUser === 'sending') return <FullScreenLoader/>
            if (this.state.reqFetchUser === 'ko') return <Http404/>
            return null
        }

        const user = this.getUser()

        return (
            <View style={[styles.container]}>

                <View style={styles.headerWrapper}>
                    <Avatar user={user} />
                    <Text style={{marginTop: 10}}>
                        {i18n.t("form.description.user_name")}
                    </Text>
                </View>


                <TextInput
                    placeholder={i18n.t("form.label.first_name")}
                    onChangeText={firstName=> this.setState({updated: true, firstName})}
                    style={styles.input}
                    value={this.state.firstName}

                />
                <TextInput
                    placeholder={i18n.t("form.label.last_name")}
                    onChangeText={lastName=> this.setState({updated: true, lastName})}
                    style={styles.input}
                    value={this.state.lastName}
                />
                {this.hasChanged(user) &&
                renderSimpleButton(
                    i18n.t("actions.save"),
                    this.submit.bind(this),
                    {loading: this.state['reqSave'] === 'sending'}
                )
                }
            </View>
        );
    }

    hasChanged(user) {
        if (!user) {
            return false
        }

        return this.state.firstName != user.firstName ||
            this.state.lastName != user.lastName;
    }

    submit() {
        if (!(this.state.firstName.length > 0 &&
                this.state.lastName.length > 0)) {
            _Messenger.sendMessage(i18n.t('form.warning.fill_all_fields'));
            return
        }

        return safeDispatchAction.call(
            this,
            this.props.dispatch,
            this.saveUserDispatchee(),
            'reqSave'
        )
    }

    getUser() {
        return buildData(this.props.data, 'users', this.props.userId);
    }

    saveUserDispatchee() {
        let {firstName, lastName} = this.state
        return new Api.Call().withMethod('PATCH')
            .withRoute(`users/${this.props.userId}`)
            .withBody({user: {first_name: firstName, last_name: lastName}})
            .createActionDispatchee(PATCH_USER)
    }
}

const PATCH_USER = ApiAction.create("patch_user", "patch user");

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,

    },

    input: {
        backgroundColor: Colors.grey3,
        borderRadius: 4,
        fontSize: 25,
        height: 70,
        margin: 10,
        padding: 8,
    },
    headerWrapper: {
        alignItems: 'center',
        alignContent: 'center',
        marginBottom: 20,
    }
});
