// @flow

import React from 'react';
import {View, Text, Image, TouchableHighlight, FlatList} from 'react-native';
import * as Model from "../../models/index"
import * as UI from "../UIStyles";
import {assertUnique} from "../../utils/DataUtils";
import List from "../../models/List";

export default class LineupCell extends React.Component {

    props: {
        onAddInLineupPressed: Function,
        lineup: Object
    };

    render() {
        let lineup : Model.List = this.props.lineup;
        let savings: Model.Saving[] = lineup.savings;

        let cardMargin = 12;


        assertUnique(savings);

        return (
            <View style={{}}>
                <Text style={Object.assign({backgroundColor: 'transparent'}, UI.SIDE_MARGINS(cardMargin))}>{lineup.name}</Text>

                <View style={Object.assign({marginTop: cardMargin, marginBottom: cardMargin}, UI.CARD(cardMargin))}>
                    <FlatList
                        data={savings}
                        renderItem={this.renderItem.bind(this)}
                        keyExtractor={(item, index) => item.id}
                        horizontal={true}
                        ListHeaderComponent={
                            this.renderAddInLineup(lineup)
                        }
                    />
                </View>
            </View>
        )
    }

    renderAddInLineup(lineup:List) {
        return this.props.onAddInLineupPressed &&
            <TouchableHighlight onPress={() => this.props.onAddInLineupPressed(lineup)}>
                <Image
                    source={require('../../img/plus.png')} resizeMode="contain"
                    style={{
                        height: 30,
                        width: 30,
                        margin: 20
                    }}
                />
            </TouchableHighlight>;
    }

    renderItem(item) {
        let it: Model.Saving = item.item;

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