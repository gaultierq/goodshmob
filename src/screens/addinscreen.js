// @flow
import React, {Component} from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import {CheckBox, SearchBar} from "react-native-elements";
import * as UI from "./UIStyles";
import i18n from '../i18n/i18n'
import {screen as LineupListScreen} from './lineups';
import type {LineupProps} from "./lineups";

type Props = LineupProps & {
};

type State = {
    filter:? string,  //filter lists over this search token
};

class AddInScreen extends Component<Props, State> {

    state = {filter: null};

    render() {

        //const {} = this.props;

        return (
            <View style={[styles.container]}>
                <SearchBar
                    autoFocus
                    lightTheme
                    round
                    onChangeText={this.onSearchInputChange.bind(this)}
                    placeholder={i18n.t('lineups.search.placeholder')}
                    clearIcon={{color: '#86939e'}}
                    containerStyle={styles.searchContainer}
                    inputStyle={styles.searchInput}
                    autoCapitalize='none'
                    autoCorrect={false}
                />

                <LineupListScreen
                    filter={this.state.filter}
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
        backgroundColor: 'white',
        borderWidth: 0.5,
        borderColor: UI.Colors.grey1
    },
});




let screen = AddInScreen;

export {screen};
