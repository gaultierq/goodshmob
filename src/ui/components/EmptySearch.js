// @flow
import React, {Component} from 'react';
import {ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {currentUser, currentUserId, logged} from "../../managers/CurrentUser";
import {Navigation} from 'react-native-navigation';
import {connect} from "react-redux";
import {currentUserFilter} from "../../redux/selectors";
import type {Color, Id} from "../../types";
import {SFP_TEXT_MEDIUM} from "../fonts"
import {Colors} from "../colors"

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';

type Props = {
    categ: String,
};

type State = {
};

@logged
@connect((state, props)=>({
    currentUser: currentUserFilter(state, {userId: currentUserId()})
}))
export default class EmptySearch extends Component<Props, State> {

    render() {

        const color = Colors.brownishGrey;
        return (
            <View style={{
                flex:1,
                alignItems:'center',
                alignSelf: 'center',
                justifyContent:'center',

            }}>
                {
                    this.renderBlankIcon(this.props.categ, 50, color)
                }
                <Text style={{
                    textAlign: 'center',
                    fontSize: 17,
                    margin: 15,
                    fontFamily: SFP_TEXT_MEDIUM,
                    color: color

                }}>{i18n.t("search_item_screen.placeholder." + this.props.categ)}</Text>
            </View>
        )

    }

    renderBlankIcon(category: SearchItemCategoryType, size: number, color: Color) {

        switch (category) {
            case 'places':
                return <MaterialIcons name="restaurant" size={size} color={color}/>;
            case 'musics':
                return <MaterialIcons name="library-music" size={size} color={color}/>;
            case 'consumer_goods':
                return <SimpleLineIcons name="present" size={size} color={color}/>;
            case 'movies':
                return <MaterialIcons name="movie" size={size} color={color}/>;
            case 'users':
                return <MaterialIcons name="face" size={size} color={color}/>;
            case 'savings':
                return <MaterialIcons name="list" size={size} color={color}/>;
        }
    }
}
