// @flow
import React from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import {CheckBox, SearchBar} from "react-native-elements";
import type {Props as LineupProps} from "./lineuplist";
import {LineupListScreen} from './lineuplist';
import AddLineupComponent from "../components/addlineup";
import {Colors} from "../colors";
import LineupCell from "../components/LineupCell";
import GTouchable from "../GTouchable";
import {currentUserId} from "../../managers/CurrentUser";
import Screen from "../components/Screen";
import LineupHorizontal from "../components/LineupHorizontal";
import LineupCellSaving from "../components/LineupCellSaving";

type Props = LineupProps & {
    onListSelected: ()=>void
};

type State = {
    filter:? string,  //filter lists over this search token
};

export default class AddInScreen extends Screen<Props, State> {

    state = {filter: null};

    render() {

        const {navigator, onListSelected, ...otherProps} = this.props;

        return (
            <View style={[styles.container]}>

                <LineupListScreen
                    ListHeaderComponent={<AddLineupComponent disableOffline={true} navigator={this.props.navigator} style={{backgroundColor: Colors.green, padding: 10, marginTop: 15, marginRight: 15, marginLeft: 8, borderRadius:8}} styleText={{color: Colors.white, fontWeight: 'normal'}}/>}
                    {...otherProps}
                    userId={currentUserId()}
                    renderItem={lineup => (
                        <LineupHorizontal
                            lineupId={lineup.id}
                            navigator={this.props.navigator}
                            withLineupTitle={true}
                            onLineupPressed={(navigator, lineup) => onListSelected(lineup)}
                            renderSaving={saving => <LineupCellSaving item={saving.resource} />}
                        />
                    )
                    }
                    navigator={navigator}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchContainer: {
        backgroundColor: 'transparent',
    },
    searchInput: {
        backgroundColor: Colors.white,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.greyishBrown
    },
});
