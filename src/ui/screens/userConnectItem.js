// @flow

import React, {Component} from 'react'
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native'
import {connect} from "react-redux"
import {logged} from "../../managers/CurrentUser"
import type {NavigableProps, RequestState, User} from "../../types"
import UserRowI from "../activity/components/UserRowI"
import {Colors} from "../colors"
import GTouchable from "../GTouchable"
import {openUserSheet} from "../Nav"


type Props = NavigableProps & {
    user: User
};

type State = {
    connect?: RequestState,
    disconnect?: RequestState,
};

@connect()
@logged
export default class UserConnectItem extends Component<Props, State> {

    state : State = {};

    render() {
        let user = this.props.user;
        return (
            <View style={{flex: 1, flexDirection: 'row'}}>
                <UserRowI user={user}
                    navigator={this.props.navigator}
                    //rightComponent={this.renderConnectButton(item)}
                    style={styles.userRow}
                />
                <View style={{ alignItems:'flex-end', justifyContent: 'center', paddingHorizontal: 10}}>{
                    <GTouchable onPress={() => openUserSheet(this.props.navigator, user)}>
                        <View style={{padding: 12}}>
                            <Image source={require('../../img2/moreDotsGrey.png')} resizeMode="contain"/>
                        </View>
                    </GTouchable>

                }</View>
            </View>
        )
    }

}


const styles = StyleSheet.create({
    button: {
        padding: 8,
        height: 30,
    },
    disabledButton: {
        borderColor: Colors.greyishBrown,
    },
    userRow: {
        margin: 12
    }
});

