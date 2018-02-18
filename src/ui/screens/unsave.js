// @flow
import React, {Component} from 'react';
import {ActivityIndicator, FlatList, StyleSheet, Text, TextInput, View} from 'react-native';
import type {Id, ItemType, RequestState, RNNNavigator, Save} from "../../types";
import {CheckBox} from "react-native-elements";
import Screen from "../components/Screen";
import {buildData} from "../../helpers/DataUtils";
import {connect} from "react-redux";
import {renderSimpleButton} from "../UIStyles";
import * as Api from "../../managers/Api";
import {fetchActivity} from "../activity/actions";
import {Colors} from "../colors"
import {doUnsave, fetchItemCall, SAVING_CREATION, SAVING_DELETION} from "../lineup/actions";
import {FETCH_ITEM, SAVE_ITEM} from "../lineup/actionTypes";
import {mergeItemsAndPendings} from "../../helpers/ModelUtils";
import {UNSAVE} from "../activity/actionTypes";
import StoreManager from "../../managers/StoreManager";

type Props = {
    itemId: Id,
    itemType: ItemType,
    navigator: RNNNavigator
};

type State = {
    fetch:? RequestState
};

type SavingForDeletion = {id: Id, lineupId: Id, pending?: boolean};

@connect(state => ({
    data: state.data,
    pending: state.pending
}))
export default class UnsaveScreen extends Screen<Props, State> {


    componentDidMount() {
        if (!this.getItem()) {
            Api.safeDispatchAction.call(
                this,
                this.props.dispatch,
                fetchItemCall(this.props.itemId).disptachForAction2(FETCH_ITEM),
                'fetch'
            )
        }

    }

    render() {

        const {itemId, itemType} = this.props;

        let savings = StoreManager.getMySavingsForItem(itemId, itemType,);

        return (
            <View style={[styles.container]}>
                <FlatList
                    data={savings}
                    renderItem={({item}) => this.renderItem(item)}
                    keyExtractor={id => id}
                />

            </View>
        );
    }

    getItem() {
        return buildData(this.props.data, this.props.itemType, this.props.itemId);
    }

    renderItem(saving: SavingForDeletion) {
        return (<UnsaveSavingCell saving={saving} />);
    }

}

type State2 = {
    delete: RequestState,
    fetch: RequestState,
};

type Props2 = {
    saving: SavingForDeletion
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
        const saving = this.props.saving;
        if (!saving.pending && !this.getLineupBySavingId(saving.id)) {
            Api.safeDispatchAction.call(
                this,
                this.props.dispatch,
                fetchActivity(saving.id, 'savings', {include: 'target'}),
                'fetch'
            )
        }
    }

    render() {

        const {saving} = this.props;
        let {id, lineupId, pending} = saving;
        let lineup;
        if (pending) {
            lineup = buildData(this.props.data, 'lists', lineupId)
        }
        else {
            lineup = _.get(buildData(this.props.data, 'savings', id), 'target');
        }


        lineupId = lineup && lineup.id;

        const deleteStatus = this.state.delete;
        let enabled = (deleteStatus === 'idle' || deleteStatus === 'ko') && lineupId;

        return (
            <View style={{flex: 1, flexDirection: 'row'}}>
                <View style={{flex: 1, justifyContent: 'center',}}>
                    <Text style={{color: pending ? Colors.greying : Colors.black}}>{lineup && lineup.name}</Text>
                    {this.state.fetch === 'sending' && <ActivityIndicator
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
                            textStyle: {fontWeight: "normal", fontSize: 14, color:Colors.grey}
                        }
                    )}
                </View>
            </View>

        );
    }


    getLineupBySavingId(savingId: Id) {
        return _.get(buildData(this.props.data, 'savings', savingId), 'target');
    }

    unsave(lineupId: Id) {
        const {saving} = this.props;
        this.props.dispatch(doUnsave(saving.pending, saving.id, lineupId));
    }

}


const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        flex: 1,
    },
});
