// @flow

import type {Node} from 'react';
import React from 'react';
import {Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import * as UI from "../UIStyles";
import {stylePadding} from "../UIStyles";
import {assertUnique} from "../../helpers/DataUtils";
import {isEmpty} from "lodash";
import type {List, Saving} from "../../types";
import {Colors} from "../colors";
import {SFP_TEXT_MEDIUM} from "../fonts";
//;

type Props = {
    lineup: List,
    style?: *,
    titleChildren?: Node,
    titleChildrenBelow?: boolean,
    itemCount?: number,
    padding?: number,
};

type State = {
    colors: Array<string>
};


const DIM = 60;

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

        let {itemCount, padding} = this.props;
        if (!itemCount) {
            let pd = this.getPadding();
            itemCount = pd.n;
            padding = pd.padding;
        }

        //console.log(`DEBUG: render LineupCell w=${w} n=${n} spaceLeft=${spaceLeft} padding=${padding}`);

        let savingCount = _.get(lineup, `meta.savings-count`, null);

        let {titleChildren, titleChildrenBelow} = this.props;
        let countString = savingCount  !== null ? ' (' + savingCount + ')' : '';

        let title = lineup.name;
        // if (__IS_LOCAL__) {
            // title += ` id=(#${lineup.id.substr(0, 5)})`;
        // }
        return (
            <View style={[
                styles.container,
                {...stylePadding(padding, null, padding, padding)},
                {backgroundColor: lineup.id.startsWith('pending') ? Colors.dirtyWhite : Colors.white}]}>

                <View style={{flexDirection: titleChildrenBelow ? 'column' : 'row'}}>
                    <Text style={[styles.lineupTitle, {}]}>
                        {title}
                        <Text
                            style={{color: Colors.greyish}}
                        >
                            {countString}
                            {__IS_LOCAL__ && <Text
                                style={{color: Colors.grey3}}
                            >{` id=(#${lineup.id.substr(0, 5)})`}</Text>}
                        </Text>

                    </Text>

                    {titleChildren}
                </View>
                {this.renderList(itemCount, padding, savings)}
            </View>
        )
    }

    getPadding() {
        const {width} = Dimensions.get('window');



        let w = DIM;
        let n = Math.floor(width / w) + 1;

        let spaceLeft;
        let padding;

        do {
            n--;
            spaceLeft = width - n * w;
            padding = spaceLeft / (n + 2);
        } while (padding < w / 5);
        return {n, padding};
    }

    renderList(n:number, padding:  number, savings: List<Saving>) {
        let result = [];
        for (let i = 0; i < n; i++) {
            result.push(this.renderItem({item: _.nth(savings, i), index: i}))
        }
        return <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>{result}</View>;
    }

    // shouldComponentUpdate(nextProps: Props, nextState: State) {
    //     if (!ENABLE_PERF_OPTIM) return true;
    //     let act = this.readLineup(nextProps);
    //
    //     if (act === this.lastRenderedActivity) {
    //         superLog('ActivityCell render saved');
    //         return false;
    //     }
    //     return true;
    // }

    // readLineup(nextProps) {
    //     return _.get(nextProps, `data.${nextProps.activityType}.${nextProps.activityId}`);
    // }

    renderItem({item, index}: {item: Saving}) {

        let image = item && item.resource && item.resource.image;
        const dim = DIM;
        const style = {
            height: dim,
            width: dim,
            borderColor: Colors.greyish,
            borderRadius: 4,
        };

        if (image) {
            return <Image
                source={{uri: image}}
                resizeMode="contain"
                style={[style, {borderWidth: StyleSheet.hairlineWidth}]}
            />
        }
        else {
            return (
                <View style={[style, {opacity: 0.3, backgroundColor: Colors.grey3/*this.state.colors[index]*/}]}/>
            )
        }

    }
}

const styles = StyleSheet.create({
    container: {
    },
    lineupTitle: {
        fontSize: 16,
        marginTop: 4,
        marginBottom: 6,
    }
});