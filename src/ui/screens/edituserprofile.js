// @flow
import React from 'react';
import {Platform, StyleSheet, Text, TextInput, View} from 'react-native';
import {CheckBox, SearchBar} from "react-native-elements";
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
import {FullScreenLoader, Http404} from "../UIComponents";

type Props = LineupProps & {
    userId: Id
};

type State = {
    reqSave?: RequestState,
    reqFetchUser?: RequestState,
    userId: Id,
    firstName: string,
    lastName: string,
};

@connect(state => ({
    data: state.data,
}))
export default class EditUserProfileScreen extends Screen<Props, State> {


    componentDidMount() {
        Api.safeDispatchAction.call(
            this,
            this.props.dispatch,
            userActions.getUser(this.props.userId).createActionDispatchee(userActionTypes.GET_USER),
            'reqFetchUser'
        )
    }


    render() {

        const user = this.getUser()

        if (!user) {
            if (this.state.reqFetchUser === 'sending') return <FullScreenLoader/>
            if (this.state.reqFetchUser === 'ko') return <Http404/>
            return null
        }
        return (
            <View style={[styles.container]}>

                <TextInput
                    placeholder={'#first name'}
                    onChangeText={firstName=> this.setState({firstName})}
                    value={this.state.firstName || user.firstName}
                />
                <TextInput
                    placeholder={'#last name'}
                    onChangeText={lastName=> this.setState({lastName})}
                    value={this.state.lastName || user.lastName }
                />
                {
                    renderSimpleButton(
                        "save",
                        ()=> safeDispatchAction.call(
                            this,
                            this.props.dispatch,
                            this.saveUserDispatchee(),
                            'reqSave'
                        ),
                        {loading: this.state['reqSave'] === 'sending'}
                    )
                }
            </View>
        );
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
    },
});
