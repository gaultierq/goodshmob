// @flow

import React from 'react';
import {FlatList, Image, StyleSheet, Text, TouchableWithoutFeedback, View} from 'react-native';
import * as UI from "../UIStyles";
import {assertUnique} from "../../utils/DataUtils";
import {isEmpty} from "lodash";
import type {List, Saving} from "../../types";



type Props = {
    onAddInLineupPressed: Function,
    lineup: List
};

type State = {
};

export default class LineupCell extends React.Component<Props, State> {


    render() {
        let lineup : List = this.props.lineup;
        let savings: Saving[] = lineup.savings;

        assertUnique(savings);

        return (
            <View style={styles.container}>

                <Text style={styles.lineupTitle}>
                    {lineup.name}
                </Text>

                {
                    isEmpty(savings) ?
                        <Text style={{padding:8, ...UI.TEXT_LESS_IMPORTANT}}>This list is empty</Text> :
                        <FlatList
                            data={savings}
                            renderItem={this.renderItem.bind(this)}
                            keyExtractor={(item, index) => item.id}
                            horizontal={true}
                            ListHeaderComponent={
                                this.renderAddInLineup(lineup)
                            }
                        />}
            </View>
        )
    }

    renderAddInLineup(lineup:List) {
        return this.props.onAddInLineupPressed &&
            <TouchableWithoutFeedback onPress={() => this.props.onAddInLineupPressed(lineup)}>
                <Image
                    source={require('../../img/plus.png')} resizeMode="contain"
                    style={{
                        height: 30,
                        width: 30,
                        margin: 20
                    }}
                />
            </TouchableWithoutFeedback>;
    }

    renderItem({item}: {item: Saving}) {

        let image = item.resource ? item.resource.image : undefined;
        if (!image) {
            console.warn(`no image found for item=${JSON.stringify(item)}`);
        }
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

const styles = StyleSheet.create({
    container: {marginTop: 12, marginBottom: 12, paddingTop: 6, ...UI.CARD()},
    lineupTitle: {
        backgroundColor: 'transparent',
        ...UI.TEXT_LIST,
        ...UI.SIDE_MARGINS(12)
    }
});