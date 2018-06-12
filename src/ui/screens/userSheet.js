// @flow
import React, {Component} from 'react';
import {CheckBox} from "react-native-elements";
import {connect} from "react-redux";
import {
    Alert,
    Clipboard,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Spinner from 'react-native-spinkit';

import {renderSimpleButton, stylePadding} from "../UIStyles";
import type {Id, RequestState} from "../../types";
import type {User} from "../../types";
import {currentUserId, logged} from "../../managers/CurrentUser"
import GTouchable from "../GTouchable";
import Sheet from "../components/sheet";
import _Messenger from "../../managers/Messenger"
import {Avatar, FullScreenLoader, Http404} from "../UIComponents";
import {Colors} from "../colors"
import * as Api from "../../managers/Api"
import ApiAction from "../../helpers/ApiAction"
import {buildData} from "../../helpers/DataUtils"
import {
    actions as userActions,
    actionTypes as userActionTypes
} from "../../redux/UserActions"

type Props = {
    user?: User,
    userId: Id
};


type State = {
    connect?: RequestState,
    disconnect?: RequestState,
    reqFetchUser?: RequestState,
};


@connect((state, ownProps) => ({
    data: state.data,
    pending: state.pending
}))
@logged
export default class UserSheet extends Component<Props, State> {
    state : State = {};

    static navigatorStyle = {
        navBarHidden: true,
        screenBackgroundColor: 'transparent',
        modalPresentationStyle: 'overFullScreen',
        tapBackgroundToDismiss: true
    };

    constructor(props) {
        super(props);
    }


    render() {

        let user = this.getUser() || this.props.user;

        let username = user.firstName + " " + user.lastName;
        let alreadyFriends = !!_.find(user.friends, (f)=>f.id === currentUserId());
        let remainingAction = alreadyFriends ? 'disconnect' : 'connect';
        let reqState = this.state[remainingAction];
        let ok = reqState === 'ok';

        let userLoaded = this.state.reqFetchUser === 'ok'

        return <KeyboardAvoidingView
            contentContainerStyle={{flex:1}}
            scrollEnabled={false}
            extraScrollHeight={20}
            keyboardShouldPersistTaps='always'
            style={{position: 'absolute', bottom:0, top: 0, left: 0, right: 0}}>
            <Sheet
                navigator={this.props.navigator}
                ref={ref => this._sheet = ref}
            >
                <View style={{height:400, padding: 15}}>

                    <View style={{flexDirection: 'row'}}>
                        <GTouchable onPress={()=>this._sheet && this._sheet.close()}>
                            <Image style={{width: 15, height: 15}} source={require('../../img2/closeXGrey.png')}/>
                        </GTouchable>
                    </View>
                    <View style={styles.avatarWrapper}>
                        <Avatar user={user} size={50} style={styles.avatar}/>
                        <Text style={styles.username}>{username}</Text>
                        <Text style={styles.city}>Paris, France</Text>
                    </View>

                    {!userLoaded && <View style={styles.loaderWrapper}>
                        <Spinner size={40} type={"9CubeGrid"} color={Colors.grey3}/>
                    </View>}

                    {userLoaded && <View>

                        <View style={styles.row}>
                            <View style={styles.column}>
                                <Text style={styles.title}>Goodsh</Text>
                                <Text style={styles.subtitle}>258</Text>
                            </View>
                            <View style={styles.column}>
                                <Text style={styles.title}>Goodsh</Text>
                                <Text style={styles.subtitle}>258</Text>
                            </View>
                            <View style={styles.column}>
                                <Text style={styles.title}>Goodsh</Text>
                                <Text style={styles.subtitle}>258</Text>
                            </View>

                        </View>

                        {renderSimpleButton(
                            i18n.t(`friends.` + (ok ? 'messages' : 'buttons') + `.${remainingAction}`),
                            alreadyFriends ? ()=> this.disconnectWith(user) : ()=> this.connectWith(user),
                            {loading: reqState === 'sending', disabled: ok, style: {borderColor: Colors.green, borderWidth: 0.5, width: 100, marginTop: 20, alignSelf: 'center'}, textStyle: {fontWeight: "normal", fontSize: 14, color: Colors.green}}
                        )}

                    </View>}


                </View>

            </Sheet>
        </KeyboardAvoidingView>
    }

    connectWith(user: User) {
        let action = actions.createFriendship(user.id).createActionDispatchee(CONNECT);
        Api.safeDispatchAction.call(
            this,
            this.props.dispatch,
            action,
            'connect'
        ).then(()=> {
                _Messenger.sendMessage(i18n.t("friends.messages.connect"));
            }
        );
    }

    disconnectWith(user: User) {
        Alert.alert(
            i18n.t("friends.alert.title"),
            i18n.t("friends.alert.label"),
            [
                {text: i18n.t("actions.cancel"), onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                {text: i18n.t("actions.ok"), onPress: () => {
                        let action = actions.deleteFriendship(user.id).createActionDispatchee(DISCONNECT);
                        Api.safeDispatchAction.call(
                            this,
                            this.props.dispatch,
                            action,
                            'disconnect'
                        ).then(()=> {
                                _Messenger.sendMessage(i18n.t("friends.messages.disconnect"));
                            }
                        );
                    }},
            ],
            { cancelable: true }
        )
    }


    componentDidMount() {
        Api.safeDispatchAction.call(
            this,
            this.props.dispatch,
            userActions.getUserAndTheirFriends(this.props.userId).createActionDispatchee(userActionTypes.GET_USER),
            'reqFetchUser'
        )
    }
    getUser() {
        return buildData(this.props.data, "users", this.props.userId);
    }



}

export const CONNECT = ApiAction.create("connect", "add a friend");
export const DISCONNECT = ApiAction.create("disconnect", "delete a friend");

const actions = {
    createFriendship: (userId: string) => {
        return new Api.Call().withMethod('POST')
            .withRoute(`users/${userId}/friendships`);

    },

    deleteFriendship: (userId: string) => {
        return new Api.Call().withMethod('DELETE')
            .withRoute(`users/${userId}/friendships`);

    }
};



const styles = StyleSheet.create({
    avatarWrapper: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    username: {
        fontSize: 20,
        marginTop: 5,

    },
    avatar: {
        marginBottom: 10,
    },
    city: {
        fontSize: 15,
        color: Colors.greyish
    },
    row: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',

    },
    column: {
        alignSelf: 'stretch',
        alignItems: 'center',
        flex: 1,
    },
    title: {
        fontSize: 20,
    },
    subtitle: {
        marginTop: 7,
        fontSize: 15,
        color: Colors.greyish
    },
    loaderWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
    }


});
