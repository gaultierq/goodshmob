// @flow

import React, {Component} from 'react';
import {StyleSheet, View, Text, Image, Button, TouchableOpacity, TouchableHighlight, FlatList} from 'react-native';
import * as Model from "../../models/index"
import * as UI from "../UIStyles";
import {connect} from "react-redux";
import build from 'redux-object'

class LineupCell extends React.Component {

    props: {
        onAddInLineupPressed: Function
    };

    render() {
        let lineup : Model.List = this.getLineup();
        let savings: Model.Saving[] = lineup.savings;

        //let activity: Model.Activity = this.props.activity;
        let user: Model.User = lineup.user;
        let resource = lineup.resource;
        let image = resource ? resource.image : undefined;

        let target: Model.List = lineup.target;
        let cardMargin = 12;

        return (
            <View style={{}}>
                <Text style={Object.assign({backgroundColor: 'transparent'}, UI.SIDE_MARGINS(cardMargin))}>{lineup.name}</Text>

                <View style={Object.assign({marginTop: cardMargin, marginBottom: cardMargin}, UI.CARD(cardMargin))}>
                    <FlatList
                        data={savings}
                        renderItem={this.renderItem.bind(this)}
                        keyExtractor={(item, index) => item.id}
                        horizontal={true}
                        ListFooterComponent={
                            <TouchableHighlight onPress={this.props.onAddInLineupPressed}>
                                <Image
                                    source={require('../../img/plus.png')} resizeMode="contain"
                                    style={{
                                        height: 30,
                                        width: 30,
                                        margin: 20
                                    }}
                                />
                            </TouchableHighlight>
                        }

                    />
                </View>
            </View>
        )
    }

    getLineup() {
        return build(this.props.data, "lists", this.props.lineupId);
    }

    getSaving(savingId) {
        return build(this.props.data, "savings", savingId);
    }

    renderItem(item) {
        let it: Model.Saving = item.item;

        //eager: true doesnt work
        it = this.getSaving(it.id);

        let image = it.resource ? it.resource.image : undefined;

        return <Image
            source={{uri: image}}
            style={{
                height: 50,
                width: 50,
                margin: 10
            }}
        />
    }
}
const mapStateToProps = (state, ownProps) => ({
    lineup: state.lineup,
    data: state.data,
    request: state.request,
});

//TODO: disconnect
export default connect(mapStateToProps)(LineupCell);
