//@flow

import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import {SearchBar, Button} from 'react-native-elements'
import {SEARCH_INPUT_PROPS, SEARCH_STYLES} from "./UIStyles";

export type Props = {
};

type State = {
};


export default class GSearchBar extends Component<Props, State>  {

    handleOnFocus = () => {
        console.log('GSearchBar:handleOnFocus()')
        console.log(this.search)
        // this.search.blur()
        // this.search.setState({clearIcon: true})
    }

    render() {
        const {...attr} = this.props;
        return (
            <SearchBar
                ref={search => this.search = search}
                platform="ios"
                containerStyle={SEARCH_STYLES.searchContainer}
                inputStyle={SEARCH_STYLES.searchInput}
                onFocus={this.handleOnFocus}
                {...SEARCH_INPUT_PROPS}
                {...attr}
            />

        );
    }

}
