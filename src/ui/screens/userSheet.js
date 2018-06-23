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
import {Avatar, FullScreenLoader} from "../UIComponents";
import {Colors} from "../colors"
import * as Api from "../../managers/Api"
import ApiAction from "../../helpers/ApiAction"
import {buildData} from "../../helpers/DataUtils"
import {
    actions as userActions,
    actionTypes as userActionTypes, CONNECT, createFriendship, deleteFriendship, DISCONNECT
} from "../../redux/UserActions"
import {fullName} from "../../helpers/StringUtils"
import Http404 from "./errors/404"
import {SFP_TEXT_MEDIUM} from "../fonts"
import {canExecUserAction, getUserActions, U_CONNECT, U_DISCONNECT} from "../userRights"

type Props = {
    user?: User,
    userId: Id
};


type State = {
    connect?: RequestState,
    disconnect?: RequestState,
    reqFetchUser?: RequestState,
    reqConnect?: RequestState,
    reqDisconnect?: RequestState,
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


    componentDidMount() {
        Api.safeDispatchAction.call(
            this,
            this.props.dispatch,
            userActions.getUserAndTheirFriends(this.props.userId).createActionDispatchee(userActionTypes.GET_USER),
            'reqFetchUser'
        )
    }

    getUser() {
        return buildData(this.props.data, "users", this.props.userId) || this.props.user
    }


    render() {

        let user = this.getUser()

        return <KeyboardAvoidingView
            contentContainerStyle={{flex:1}}
            scrollEnabled={false}
            extratlHeight={20}
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

                    {this.renderBody(user)}

                </View>

            </Sheet>
        </KeyboardAvoidingView>
    }

    renderSpinner() {
        return (<View style={styles.loaderWrapper}><Spinner size={40} type={"9CubeGrid"} color={Colors.grey3}/></View>)
    }

    renderBody(user: User) {
        if (!user) {
            if (this.state.reqFetchUser === 'sending') return <FullScreenLoader/>
            if (this.state.reqFetchUser === 'ko') return <Http404/>
            console.warn('rendering hole')
            return null
        }
        return <View>

            <View style={styles.avatarWrapper}>
                <Avatar user={user} size={50} style={styles.avatar}/>
                <Text style={styles.username}>{fullName(user)}</Text>
                {/*<Text style={styles.city}>#Paris, France</Text>*/}
            </View>

            {this.renderInfos(user)}

            {
                canExecUserAction(U_CONNECT, user) && renderSimpleButton(
                    i18n.t(`friends.buttons.connect`),
                    () => this.connectWith(user),
                    {
                        loading: this.state.reqConnect === 'sending',
                        style: styles.connectButton,
                        textStyle: styles.connectText
                    }
                )
            }
            {
                canExecUserAction(U_DISCONNECT, user) && renderSimpleButton(
                    i18n.t(`friends.buttons.disconnect`),
                    () => this.disconnectWith(user),
                    {
                        loading: this.state.reqDisconnect === 'sending',
                        style: styles.connectButton,
                        textStyle: styles.connectText
                    }
                )
            }

        </View>
    }

    renderInfos(user: User) {
        let {savingsCount, lineupsCount, friendsCount} = user.meta || {}

        return <View style={styles.row}>
            <View style={styles.column}>
                <Text style={styles.title}>{i18n.t("user_sheet.goodsh_count")}</Text>
                <Text style={styles.subtitle}>{savingsCount}</Text>
            </View>
            <View style={styles.column}>
                <Text style={styles.title}>{i18n.t("user_sheet.lineup_count")}</Text>
                <Text style={styles.subtitle}>{lineupsCount}</Text>
            </View>
            <View style={styles.column}>
                <Text style={styles.title}>{i18n.t("user_sheet.friend_count")}</Text>
                <Text style={styles.subtitle}>{friendsCount}</Text>
            </View>
        </View>
    }

    connectWith(user: User) {
        let action = createFriendship(user.id).createActionDispatchee(CONNECT);

        Api.safeDispatchAction.call(
            this,
            this.props.dispatch,
            action,
            'reqConnect'
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
                        let action = deleteFriendship(user.id).createActionDispatchee(DISCONNECT);
                        Api.safeDispatchAction.call(
                            this,
                            this.props.dispatch,
                            action,
                            'reqDisconnect'
                        ).then(()=> {
                                _Messenger.sendMessage(i18n.t("friends.messages.disconnect"));
                            }
                        );
                    }},
            ],
            { cancelable: true }
        )
    }
}


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
    },
    connectButton: {
        borderColor: Colors.green,
        borderWidth: 1,
        width: 100,
        marginTop: 20,
        alignSelf: 'center'
    },
    connectText: {
        fontFamily: SFP_TEXT_MEDIUM, fontSize: 14, color: Colors.green
    },




});
