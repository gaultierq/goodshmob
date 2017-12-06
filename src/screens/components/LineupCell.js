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
    titleChildrenBelow?: boolean,
};

type State = {
    colors: Array<string>
};

export default class LineupCell extends React.Component<Props, State> {

    static displayName = "LineupCell";

    constructor() {
        super();
        this.state = {colors: _.sampleSize(UI.RandomColors, 5)};
    }

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

        //console.log(`DEBUG: render LineupCell w=${w} n=${n} spaceLeft=${spaceLeft} padding=${padding}`);

        let savingCount = _.get(lineup, `meta.savings-count`, null);

        let {titleChildren, titleChildrenBelow} = this.props;
        let countString = savingCount  !== null ? ' (' + savingCount + ')' : '';

        let title = lineup.name + countString;
        if (__IS_LOCAL__) {
            title += ` id=(#${lineup.id.substr(0, 5)})`;
        }
        return (
            <View style={[styles.container, {paddingLeft: padding, paddingRight: padding, paddingBottom: padding}]}>
                <View style={{flexDirection: titleChildrenBelow ? 'column' : 'row'}}>
                    <Text style={[styles.lineupTitle]}>{title}</Text>

                    {titleChildren}
                </View>
                {this.renderList(n, padding, savings)}
            </View>
        )
    }

    renderList(n:number, padding:  number, savings: List<Saving>) {
        let result = [];
        for (let i = 0; i < n; i++) {
            result.push(this.renderItem({item: _.nth(savings, i), index: i}))
        }
        return <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>{result}</View>;
    }

    shouldComponentUpdate(nextProps: Props, nextState: State) {
        if (!ENABLE_PERF_OPTIM) return true;
        let act = this.readLineup(nextProps);

        if (act === this.lastRenderedActivity) {
            superLog('ActivityCell render saved');
            return false;
        }
        return true;
    }

    readLineup(nextProps) {
        return _.get(nextProps, `data.${nextProps.activityType}.${nextProps.activityId}`);
    }


    renderItem({item, index}: {item: Saving}) {

        let image = item && item.resource && item.resource.image;
        return (
            <View style={[{
                height: 60,
                width: 60,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: UI.Colors.grey2,
            }, !image && {opacity: 0.3, backgroundColor: this.state.colors[index]}]}>
                {
                    image && <Image
                        source={{uri: image}}
                        style={[{
                            height: 60,
                            width: 60,
                            borderWidth: StyleSheet.hairlineWidth,
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