// @flow

import React, {Component} from 'react';
import {StyleSheet} from 'react-native';

import {connect} from "react-redux";
import {MainBackground} from "./UIComponents";
import Immutable from 'seamless-immutable';
import * as Api from "../utils/Api";
import ActionButton from 'react-native-action-button';
import { screen as LineupList } from './lineups'

class HomeScreen extends Component {

    constructor(){
        super();
    }

    render() {
        return (
            <MainBackground>
                <LineupList/>

                <ActionButton
                    buttonColor="rgba(231,76,60,1)"
                    onPress={() => { this.navToSearch() }}
                />
            </MainBackground>
        );
    }

    navToSearch() {
        this.props.navigator.showModal({
            screen: 'goodsh.SearchScreen', // unique ID registered with Navigation.registerScreen
            title: "Ajouter un goodsh", // navigation bar title of the pushed screen (optional)
            passProps: {}, // Object that will be passed as props to the pushed screen (optional)
        });
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});

const mapStateToProps = (state, ownProps) => ({
});

const actiontypes = (() => {

    return {};
})();


const actions = (() => {
    return {
    };
})();

const reducer = (() => {
    const initialState = Immutable(Api.initialListState());

    return (state = initialState, action = {}) => {
        return state;
    }
})();

let screen = connect(mapStateToProps)(HomeScreen);

export {reducer, screen};