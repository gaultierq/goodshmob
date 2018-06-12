// @flow
import React from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import {CheckBox} from "react-native-elements";
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
import type {Lineup} from "../../types";
import LineupTitle2 from "../components/LineupTitle2";

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
                    ListHeaderComponent={<AddLineupComponent disableOffline={true} onListCreated={(lineup)=>onListSelected(lineup)} navigator={this.props.navigator} style={{backgroundColor: Colors.green, padding: 10, marginTop: 15, marginRight: 15, marginLeft: 8, borderRadius:8}} styleText={{color: Colors.white, fontWeight: 'normal'}}/>}
                    {...otherProps}
                    userId={currentUserId()}
                    renderItem={lineup => (
                        <GTouchable onPress={()=>onListSelected(lineup)}>
                            <LineupHorizontal
                                lineupId={lineup.id}
                                renderSaving={saving => <LineupCellSaving item={saving.resource} />}
                                renderTitle={(lineup: Lineup) => (
                                    //<:LineupTitle lineup={lineup} style={{marginVertical: 6,}}/>
                                    <LineupTitle2
                                        lineupId={lineup.id}
                                        dataResolver={id => lineup}
                                        skipAuthor={true}
                                    />
                                )}

                            />
                        </GTouchable>
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
