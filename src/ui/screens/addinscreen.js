// @flow
import React, {Component} from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import {CheckBox, SearchBar} from "react-native-elements";
import type {Props as LineupProps} from "./lineuplist";
import {LineupListScreen} from './lineuplist';
import AddLineupComponent from "../components/addlineup";
import {Colors} from "../colors";

type Props = LineupProps & {
};

type State = {
    filter:? string,  //filter lists over this search token
};

class AddInScreen extends Component<Props, State> {

    state = {filter: null};

    render() {

        return (
            <View style={[styles.container]}>

                <LineupListScreen
                    ListHeaderComponent={<AddLineupComponent navigator={this.props.navigator}/>}
                    {...this.props}
                />
            </View>
        );
    }

    onSearchInputChange(filter:string) {
        this.setState({filter});
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchContainer: {
        backgroundColor: 'transparent',
    },
    searchInput: {
        backgroundColor: Colors.white,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.greyishBrown
    },
});




let screen = AddInScreen;

export {screen};
