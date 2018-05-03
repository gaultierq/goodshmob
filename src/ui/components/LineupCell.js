// @flow

import type {Node} from 'react';
import React from 'react';
import {Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import * as UI from "../UIStyles";
import {stylePadding} from "../UIStyles";
import {assertUnique, buildData} from "../../helpers/DataUtils";
import {isEmpty} from "lodash";
import type {List, Saving} from "../../types";
import {Colors} from "../colors";
import LineupTitle from "./LineupTitle";
import LineupCellSaving from "./LineupCellSaving";
import {connect} from "react-redux";
import {logged} from "../../managers/CurrentUser"
import {isId} from "../../helpers/StringUtils";
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

@connect((state, ownProps) => ({
    data: state.data,
    pending: state.pending,
}))
@logged
export default class LineupCell extends React.Component<Props, State> {

    static displayName = "LineupCell";

    constructor() {
        super();
        this.state = {colors: _.sampleSize(UI.RandomColors, 5)};
    }

    render() {
        // let lineup : List = this.props.lineup;
        let lineup = buildData(this.props.data, 'lists', this.props.lineupId);
        if (!lineup) return;

        let savings: Saving[] = lineup.savings;

        assertUnique(savings);

        let {itemCount, padding, style} = this.props;
        if (!itemCount) {
            let pd = this.getPadding();
            itemCount = pd.n;
            padding = pd.padding;
        }

        let {titleChildren, titleChildrenBelow} = this.props;

        return (
            <View style={[
                {...stylePadding(padding, null, padding, padding)},
                {backgroundColor: isId(lineup.id) ? Colors.white : Colors.dirtyWhite}, style]}>

                <View style={{flexDirection: titleChildrenBelow ? 'column' : 'row'}}>
                    {<LineupTitle lineup={lineup} style={{marginVertical: 6,}}/>}

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
        return <View style={styles.lineupList}>{result}</View>;
    }

    renderItem({item, index}: {item: Saving}) {
        return <LineupCellSaving item={item}/>;
        // let image = item && item.resource && item.resource.image;
        // const dim = DIM;
        // const style = {
        //     height: dim,
        //     width: dim,
        //     borderColor: Colors.greyish,
        //     borderRadius: 4,
        // };
        //
        // if (image) {
        //     return <Image
        //         source={{uri: image}}
        //         resizeMode="contain"
        //         style={[style, {borderWidth: StyleSheet.hairlineWidth}]}
        //     />
        // }
        // else {
        //     return (
        //         <View style={[style, {opacity: 0.3, backgroundColor: Colors.grey3/*this.state.colors[index]*/}]}/>
        //     )
        // }
    }
}

const styles = StyleSheet.create({
    lineupList: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    lineupTitle: {
        fontSize: 16,
        marginTop: 4,
        marginBottom: 6,
    }
});
