// @flow
import React, {Component} from 'react';
import {ActivityIndicator, FlatList, StyleSheet, Text, TextInput, View} from 'react-native';
import type {Id, RequestState, RNNNavigator, Save, Saving} from "../../types";
import {CheckBox} from "react-native-elements";
import Screen from "../components/Screen";
import {buildData} from "../../helpers/DataUtils";
import {connect} from "react-redux";
import {renderSimpleButton} from "../UIStyles";
import * as Api from "../../managers/Api";
import {fetchActivity, unsave} from "../activity/actions";
import {sendMessage} from "../../managers/Messenger";
import {Colors} from "../colors"

type Props = {
    savingIds: [Id],
    navigator: RNNNavigator
};

type State = {
};

export default class UnsaveScreen extends Screen<Props, State> {



    render() {
        const {savingIds} = this.props;

        return (

            <View style={[styles.container]}>
                <FlatList
                    data={savingIds}
                    renderItem={({item}) => this.renderItem(item)}
                    keyExtractor={id => id}
                />

            </View>
        );
    }

    renderItem(savingId: Id) {
        return (<UnsaveSavingCell savingId={savingId} />);
    }

}

type State2 = {
    delete: RequestState,
    fetch: RequestState,
};

type Props2 = {
    savingId: Id
};

//@logged
@connect(state => ({
    data: state.data,
    pending: state.pending
}))
class UnsaveSavingCell extends Component<Props2, State2> {

    state = {delete: 'idle', fetch: 'idle'};

    // TODO:
    // this behavior could be generalized. ListCell should be able to fetch their own data if missing. But
    // it should not be the default behavior, and also, these Cells should be dumb component, and delegate the data
    // retrieval to some manager.
    componentDidMount() {
        if (!this.getLineup()) {
            Api.safeDispatchAction.call(
                this,
                this.props.dispatch,
                fetchActivity(this.props.savingId, 'savings', {include: 'target'}),
                'fetch'
            )
        }

    }

    render() {

        const {savingId} = this.props;

        let lineup = this.getLineup(savingId);

        let lineupId = lineup && lineup.id;

        const deleteStatus = this.state.delete;
        let enabled = (deleteStatus === 'idle' || deleteStatus === 'ko') && lineupId;

        return (
            <View style={{flex: 1, flexDirection: 'row'}}>
                <View style={{flex: 1, justifyContent: 'center',}}>
                    <Text style={{}}>{lineup && lineup.name}</Text>
                    {!lineup && <ActivityIndicator
                        animating={true}
                        size="small"
                        style={{margin: 0}}
                    />}
                </View>
                <View style={{ alignItems:'flex-end', justifyContent: 'center', paddingHorizontal: 10}}>
                    {renderSimpleButton(
                        // i18n.t("actions.logout"),
                        i18n.t(`unsave_screen.unsave_button.${deleteStatus}`),
                        lineupId && (() => this.unsave(lineupId)),
                        {
                            loading: deleteStatus === 'sending',
                            style: {alignSelf: 'flex-start'},
                            disabled: !enabled,
                            textStyle: {fontWeight: "normal", fontSize: 14, color: Colors.grey}
                        }
                    )}
                </View>
            </View>

        );
    }


    getLineup(savingId) {
        let saving = buildData(this.props.data, 'savings', savingId) || {id: savingId, type: 'savings'};
        let lineup = saving.target;
        return lineup;
    }

    unsave(lineupId: Id) {
        let action = unsave(this.props.savingId, lineupId);


        Api.safeDispatchAction.call(
            this,
            this.props.dispatch,
            action,
            'delete'
        ).then(()=> {
                sendMessage(i18n.t("activity_action_bar.goodsh_deleted"));
            }
        );
    }
}


const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        flex: 1,
    },
});
