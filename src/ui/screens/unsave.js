// @flow
import React, {Component} from 'react';
import {FlatList, StyleSheet, Text, TextInput, View} from 'react-native';
import type {Id, RequestState, RNNNavigator, Save, Saving} from "../../types";
import {CheckBox} from "react-native-elements";
import Screen from "../components/Screen";
import {buildData} from "../../helpers/DataUtils";
import {connect} from "react-redux";
import {renderSimpleButton} from "../UIStyles";
import * as Api from "../../managers/Api";
import {unsave} from "../activity/actions";
import {sendMessage} from "../../managers/Messenger";
import {Colors} from "../colors"

type Props = {
    savingIds: [Id],
    navigator: RNNNavigator
};

type State = {
    request: {}
};

export default class UnsaveScreen extends Screen<Props, State> {

    state = {request: {}};


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
    request: RequestState,
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

    state = {request: 'idle'};

    componentWillMount() {

    }

    render() {

        const {savingId} = this.props;

        let saving = buildData(this.props.data, 'savings', savingId) || {id: savingId, type: 'savings'};
        let lineup = saving.target;

        //ItemPlaceholder
        if (!lineup) return null;


        const status = this.state.request;
        let enabled = status === 'idle' || status === 'ko';

        return (
            <View style={{flex: 1, flexDirection: 'row'}}>
                <Text style={{}}>{lineup && lineup.name}</Text>
                <View style={{ alignItems:'flex-end', justifyContent: 'center', paddingHorizontal: 10}}>
                    {renderSimpleButton(
                        // i18n.t("actions.logout"),
                        i18n.t(`unsave_screen.unsave_button.${status}`),
                        () => this.unsave(saving),
                        {
                            loading: status === 'sending',
                            style: {alignSelf: 'flex-start'},
                            disabled: !enabled,
                            textStyle: {fontWeight: "normal", fontSize: 14, color: Colors.grey}
                        }
                    )}
                </View>

            </View>

        );
    }


    unsave(saving: Saving) {
        let action = unsave(saving.id, saving.target.id);


        Api.safeDispatchAction.call(
            this,
            this.props.dispatch,
            action,
            'request'
        ).then(()=> {
                sendMessage(i18n.t("activity_action_bar.goodsh_deleted"));
            }
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
