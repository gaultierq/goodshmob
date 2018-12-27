// @flow
import React from 'react'
import {StyleSheet, Text, TextInput, View} from 'react-native'
import {CheckBox, SearchBar} from "react-native-elements"
import type {Props as LineupProps} from "./lineuplist"
import {LineupListScreen} from './lineuplist'
import AddLineupComponent from "../components/addlineup"
import {Colors} from "../colors"
import {currentUserId, logged} from "../../managers/CurrentUser"
import Screen from "../components/Screen"
import LineupHorizontal, {default_renderTitle} from "../components/LineupHorizontal"
import type {Id, Lineup, RequestState, Saving} from "../../types"
import {connect} from "react-redux"
import * as Api from "../../managers/Api"
import {buildData} from "../../helpers/DataUtils"
import {MOVE_SAVING} from "../activity/actionTypes"
import LineupCellSaving from "../components/LineupCellSaving"
import GTouchable from "../GTouchable"
import {FullScreenLoader} from "../UIComponents"

type Props = LineupProps & {
    // onListSelected: ()=>void
    savingId: Id
};

type State = {
    reqFetch?:RequestState,
    reqMove?:RequestState,
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

        let saving = this.obtainSaving(savingId);
        let displayLoader = (!this.isValid(saving) && this.state.reqFetch === 'sending') || this.state.reqMove === 'sending';


        return (
            <View style={{flex:1}}>

                <LineupListScreen
                    ListHeaderComponent={(
                        <AddLineupComponent
                            disableOffline={true}
                            navigator={this.props.navigator}
                            style={{backgroundColor: Colors.green, padding: 10, marginTop: 15, marginRight: 15, marginLeft: 8, borderRadius:8}}
                            styleText={{color: Colors.white, fontWeight: 'normal'}}/>
                    )}
                    {...otherProps}
                    userId={currentUserId()}
                    renderItem={(lineup: Lineup) => (
                        <GTouchable
                            onPress={() => this.moveSaving(saving, lineup)}
                            disabled={lineup.id === _.get(saving, 'target.id')}
                        >
                            <LineupHorizontal
                                lineup={lineup}
                                renderSaving={(saving: Saving) => {
                                    return <LineupCellSaving item={saving.resource} style={{
                                        borderWidth: saving.id === this.props.savingId ? 1 : 0,
                                        borderColor: 'black',
                                    }}/>
                                }

                                }
                            />
                        </GTouchable>
                    )
                    }
                    navigator={navigator}
                />
                {
                    displayLoader && <FullScreenLoader/>
                    // (<View style={{
                    //     flex:1,
                    //     width: "100%",
                    //     height: "100%",
                    //     alignItems: 'center',
                    //     justifyContent: 'center',
                    //     position: 'absolute',
                    //     zIndex: 1000,
                    //     backgroundColor: 'rgba(255, 255, 255, 0.65)'
                    // }}>
                    //     <Spinner
                    //         isVisible={true}
                    //         size={__DEVICE_WIDTH__ / 5}
                    //         type={"WanderingCubes"}
                    //         color={Colors.green}/>
                    // </View>)
                }
            </View>
        );
    }

    obtainSaving(savingId) {
        return buildData(this.props.data, 'savings', savingId);
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
        ).then(()=>{
            this.props.navigator.dismissModal();
        });
    }
}

export function moveSaving(saving: Saving, lineupId: Id) {
    if (!saving || !lineupId) throw "invalid params 3";

    const savingId = saving.id;
    const originalLineupId = saving.target.id;

    return new Api.Call()
        .withMethod('POST')
        .withRoute(`savings/${savingId}/move`)
        .addQuery({"list_id": lineupId})
        // .include(include)
        .createActionDispatchee(MOVE_SAVING, {savingId: savingId, originalLineupId, targetLineupId: lineupId});
}
