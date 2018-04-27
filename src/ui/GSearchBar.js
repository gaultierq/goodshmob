//@flow

import React, {Component} from 'react';
import {StyleSheet} from 'react-native';
import {SearchBar} from 'react-native-elements'
import {SEARCH_INPUT_PROPS, SEARCH_STYLES} from "./UIStyles";

export type Props = {
};

type State = {
};


export default class GSearchBar extends Component<Props, State>  {


    render() {
        const {inputStyle, containerStyle, ...attr} = this.props;
        return (
            <SearchBar
                containerStyle={[SEARCH_STYLES.searchContainer, containerStyle]}
                inputStyle={[SEARCH_STYLES.searchInput, inputStyle]}
                {...SEARCH_INPUT_PROPS}
                {...attr}
            />



        );
    }

}

