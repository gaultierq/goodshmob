// @flow

import React from 'react';
import type {Node} from 'react';
import {Dimensions, FlatList, Image, StyleSheet, Text, TouchableWithoutFeedback, TouchableOpacity, View} from 'react-native';
import * as UI from "../UIStyles";
import {assertUnique, buildData} from "../../utils/DataUtils";
import {isEmpty} from "lodash";
import type {List, Saving} from "../../types";
//;

type Props = {

    lineup: List,
    style?: *,
    titleChildren?: Node,
};

type State = {
};

export default class LineupCell extends React.Component<Props, State> {


    render() {
        let lineup : List = this.props.lineup;
        let savings: Saving[] = lineup.savings;

        assertUnique(savings);

        const {width} = Dimensions.get('window');

        let w = 60;
        let n = Math.floor(width / w) + 1;

        let spaceLeft;
        let padding;

        do {
            n--;
            spaceLeft = width - n * w;
            padding = spaceLeft / (n + 2);
        } while (padding<w/5);

        console.log(`DEBUG: render LineupCell w=${w} n=${n} spaceLeft=${spaceLeft} padding=${padding}`);

        let savingCount = _.get(lineup, `meta.savings-count`, null);

        let {titleChildren} = this.props;
        let countString = savingCount  !== null ? ' (' + savingCount + ')' : '';

        return (
            <View style={[styles.container, {paddingLeft: padding, paddingRight: padding, paddingBottom: padding}]}>
                <View style={{flexDirection: "row"}}>
                    <Text style={styles.lineupTitle}>{lineup.name + countString}</Text>

                    {titleChildren}
                </View>
                {this.renderList(n, padding, savings)}
            </View>
        )
    }

    renderList(n:number, padding:  number, savings: List<Saving>) {
        let result = [];
        for (let i = 0; i < n; i++) {
            result.push(this.renderItem({item: _.nth(savings, i)}))
        }
        return <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>{result}</View>;
    }

    renderItem({item}: {item: Saving}) {

        let image = item && item.resource && item.resource.image;
        return (
            <View style={[{
                height: 60,
                width: 60,
                borderWidth: 0.5,
                borderColor: UI.Colors.grey2,
            }, !image && {backgroundColor: UI.Colors.grey4}]}>
                {
                    image && <Image
                        source={{uri: image}}
                        style={[{
                            height: 60,
                            width: 60,
                            borderWidth: 0.3,
                            borderColor: UI.Colors.grey1,

                        }]}
                    />
                }
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: 5,
        backgroundColor: "white",
        ...UI.CARD(0)
    },
    lineupTitle: {
        backgroundColor: 'transparent',
        ...UI.TEXT_LIST,
        fontSize: 18,
        fontFamily: 'Chivo',
        marginTop: 8,
        marginBottom: 8,
    }
});