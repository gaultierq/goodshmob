// @flow
import React from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import {CheckBox, SearchBar} from "react-native-elements";
import type {Props as LineupProps} from "./lineuplist";
import {LineupListScreen} from './lineuplist';
import AddLineupComponent from "../components/addlineup";
import {Colors} from "../colors";
import {currentUserId, logged} from "../../managers/CurrentUser";
import Screen from "../components/Screen";
import LineupHorizontal from "../components/LineupHorizontal";
import type {Id, Lineup, RequestState, Saving} from "../../types";
import {connect} from "react-redux";
import * as Api from "../../managers/Api";
import ApiAction from "../../helpers/ApiAction";
import {buildData} from "../../helpers/DataUtils";
import Spinner from 'react-native-spinkit';
import {MOVE_SAVING} from "../activity/actionTypes";

type Props = LineupProps & {
    // onListSelected: ()=>void
    savingId: Id
};

type State = {
    reqFetch?: ?RequestState,
    reqMove?: ?RequestState,
    // filter:? string,  //filter lists over this search token
};



@logged
@connect((state, ownProps) => ({
    data: state.data,
}))
export default class MoveInScreen extends Screen<Props, State> {


    render() {
        //TODO: handle saving retrieval
        const {navigator, savingId, ...otherProps} = this.props;

        let saving = buildData(this.props.data, 'savings', savingId);
        let displayLoader = (!this.isValid(saving) && this.state.reqFetch === 'sending') || this.state.reqMove === 'sending';

        return (
            <View style={{flex:1}}>

                <LineupListScreen
                    ListHeaderComponent={(<AddLineupComponent
                            disableOffline={true}
                            navigator={this.props.navigator}
                            style={{backgroundColor: Colors.green, padding: 10, marginTop: 15, marginRight: 15, marginLeft: 8, borderRadius:8}}
                            styleText={{color: Colors.white, fontWeight: 'normal'}}/>
                    )}

                    {...otherProps}
                    userId={currentUserId()}
                    renderItem={lineup => (
                        <LineupHorizontal
                            lineupId={lineup.id}
                            navigator={this.props.navigator}
                            withLineupTitle={true}
                            onSavingPressed={null}
                            onLineupPressed={(navigator, lineup) => this.moveSaving(saving, lineup)}
                        />
                    )
                    }
                    navigator={navigator}
                />
                {
                    displayLoader && (<View style={{flex: 1,
                        width: "100%", height: "100%", position: 'absolute', alignItems: 'center',
                        opacity: 0.5, backgroundColor: 'white'}}>
                        <Spinner
                            isVisible={true}
                            size={30}
                            type={"ThreeBounce"}
                            color={Colors.black}
                        />
                    </View>)
                }
            </View>
        );
    }

    isValid(saving: Saving) {
        return saving && saving.id && saving.target && saving.target.id
    }

    moveSaving(saving: Saving, lineup: Lineup) {

        Api.safeDispatchAction.call(
            this,
            this.props.dispatch,
            moveSaving(saving, lineup.id),
            'reqMove'
        )
    }
}



export function moveSaving(saving: Saving, lineupId: Id) {
    if (!saving || !lineupId) throw "invalid params";

    const savingId = saving.id;
    const originalLineupId = saving.target.id;

    return new Api.Call()
        .withMethod('POST')
        .withRoute(`savings/${savingId}/move`)
        .addQuery({"list_id": lineupId})
        // .include(include)
        .disptachForAction2(MOVE_SAVING, {savingId: savingId, originalLineupId, targetLineupId: lineupId});
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
