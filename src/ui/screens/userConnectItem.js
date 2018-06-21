// @flow

import React, {Component} from 'react';
import {
    ActivityIndicator,
    FlatList,
    Platform,
    RefreshControl,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Alert
} from 'react-native';
import {connect} from "react-redux";
import {currentUserId, logged} from "../../managers/CurrentUser"
import type {NavigableProps, RequestState, User} from "../../types";
import * as Api from "../../managers/Api";
import ApiAction from "../../helpers/ApiAction";
import {renderSimpleButton, stylePadding} from "../UIStyles";
import UserRowI from "../activity/components/UserRowI";
import {Colors} from "../colors";
import _Messenger from "../../managers/Messenger";
import GTouchable from "../GTouchable"
import {displayLineupActionMenu} from "../Nav"


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
                    <GTouchable onPress={() => this.openUserSheet(user)}>
                        <View style={{padding: 12}}>
                            <Image source={require('../../img2/moreDotsGrey.png')} resizeMode="contain"/>
                        </View>
                    </GTouchable>

                }</View>
            </View>
        )
    }

    openUserSheet(user: User) {
        openUserSheet(this.props.navigator, user)
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

