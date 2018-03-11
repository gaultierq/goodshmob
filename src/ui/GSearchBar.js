//@flow

import React, {Component} from 'react';
import {StyleSheet} from 'react-native';
import {SearchBar} from 'react-native-elements'
import {NavStyles, SEARCH_STYLES} from "./UIStyles";
import {Colors, SEARCH_PLACEHOLDER_COLOR} from "./colors";

export type Props = {
};

type State = {
};


export default class GSearchBar extends Component<Props, State>  {


    render() {
        const {...attr} = this.props;
        return (
            <SearchBar
                // autoFocus
                lightTheme
                // onChangeText={this.onChangeText.bind(this)}
                // onSubmitEditing={this.submit.bind(this)}
                // onClearText={this.onClearText.bind(this)}
                // placeholder={this.state.placeholder}
                // value={this.state.input}
                // clearIcon={!!this.state.input && {color: '#86939e'}}
                placeholderTextColor={SEARCH_PLACEHOLDER_COLOR}
                containerStyle={SEARCH_STYLES.searchContainer}
                inputStyle={SEARCH_STYLES.searchInput}
                autoCapitalize='none'
                autoCorrect={false}
                returnKeyType={'search'}
                {...attr}
            />



        );
    }

}

