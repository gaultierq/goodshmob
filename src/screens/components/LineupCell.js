// @flow

import React from 'react';
import type {Node} from 'react';
import {FlatList, Image, StyleSheet, Text, TouchableWithoutFeedback, TouchableOpacity, View} from 'react-native';
import * as UI from "../UIStyles";
import {assertUnique} from "../../utils/DataUtils";
import {isEmpty} from "lodash";
import type {List, Saving} from "../../types";

type Props = {
    onAddInLineupPressed?: Function,
    moreComponent?: Node,
    lineup: List,
    style?: *
};

type State = {
};

export default class LineupCell extends React.Component<Props, State> {


    render() {
        let lineup : List = this.props.lineup;
        let savings: Saving[] = lineup.savings;

        let style = this.props.style || styles.container;

        assertUnique(savings);

        let moreComponent = this.props.moreComponent;
        return (
            <View style={style}>
                <View style={{flexDirection: "row"}}>
                    <Text style={styles.lineupTitle}>{lineup.name}</Text>
                    {
                        moreComponent && <View style={{position: "absolute", right: 0}}>{moreComponent}</View>
                    }
                </View>
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
                        />
                }

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
            style={[{
                height: 60,
                width: 60,
                borderWidth: 0.3,
                borderColor: UI.Colors.grey1,
                margin: 8,
            }]}
        />
    }
}

const styles = StyleSheet.create({
    container: { paddingBottom: 5, backgroundColor: "white"},
    lineupTitle: {
        backgroundColor: 'transparent',
        ...UI.TEXT_LIST,
        fontSize: 15,
        fontFamily: 'Chivo',
        ...UI.SIDE_MARGINS(8),
        marginTop: 8,
    }
});