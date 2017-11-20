// @flow

import React, {Component} from 'react';
import {
    ActivityIndicator,
    FlatList,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import {connect} from "react-redux";
import type {Id, List, NavigableProps, Saving, User} from "../types";
import AlgoliaSearchScreen from "./algoliasearch";
import ItemCell from "./components/ItemCell";
import LineupCell from "./components/LineupCell";
import {currentUserId} from "../CurrentUser";
import * as Nav from "./Nav";
import {createResultFromHit, createResultFromHit2} from "../utils/AlgoliaUtils";
import Button from 'apsl-react-native-button'
import * as Api from "../utils/Api";
import ApiAction from "../utils/ApiAction";
import * as UI from "./UIStyles";
import UserRowI from "../activity/components/UserRowI";
import * as _ from "lodash";

type Props = NavigableProps & {
    onClickClose?: () => void,
};

type State = {
    connect: {[Id]: number}
};

@connect()
export default class NetworkSearchScreen extends Component<Props, State> {

    state :State = {connect: {}};

    constructor(props) {
        super(props);
        props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    onNavigatorEvent(event) { // this is the onPress handler for the two buttons together
        if (event.type === 'NavBarButtonPress') { // this is the event type for button presses
            if (event.id === Nav.CANCEL) { // this is the same id field from the static navigatorButtons definition
                this.props.onClickClose();
            }
        }
    }

    render() {


        let renderItem = ({item})=> {

            let isLineup = item.type === 'lists';


            if (isLineup) {
                return (
                    <TouchableWithoutFeedback
                        onPress={this.onLineupPressed}>
                        <View>
                            <LineupCell
                                lineup={item}
                            />
                        </View>
                    </TouchableWithoutFeedback>
                )
            }
            else {
                let saving = item;

                let resource = saving.resource;

                //TODO: this is hack
                if (!resource) return null;

                return (
                    <ItemCell
                        item={resource}
                        onPressItem={()=>this.onSavingPressed(saving)}
                    />
                )
            }
        };

        let renderUser = ({item}) => {
            return (
                <UserRowI user={item}
                         navigator={this.props.navigator}
                         rightComponent={this.renderConnectButton(item)}
                          style={styles.userRow}
                />
            );
        };

        let categories = [
            {
                type: "savings",
                query: {
                    indexName: 'Saving_staging',
                    params: {
                        facets: "[\"list_name\"]",
                        //filters: 'user_id:' + currentUserId(),
                    }

                },
                tabName: "network_search_tabs.savings",
                parseResponse: createResultFromHit,
                renderItem,
            },
            {
                type: "users",
                query: {
                    indexName: 'User_staging',
                    params: {
                        //facets: "[\"list_name\"]",
                        //filters: 'user_id:' + currentUserId(),
                    }

                },
                tabName: "network_search_tabs.users",
                parseResponse: createResultFromHit2,
                renderItem: renderUser,
            },

        ];

        let navigator = this.props.navigator;
        return (
            <AlgoliaSearchScreen
                categories={categories}
                placeholder={"search_bar.network_placeholder"}
                navigator={navigator}
            />
        );
    }

    renderConnectButton(user: User) {
        let req = this.state.connect[user.id];

        let alreadyFriends = !!_.find(user.friends, (f)=>f.id === currentUserId());

        if (alreadyFriends) {
            return <Text style={{position: 'absolute', right: 12}}>amis</Text>
        }

        return (<Button
            isLoading={req === 1}
            isDisabled={req === 2}
            onPress={()=> this.connectWith(user)}
            style={[{position: 'absolute', right: 12}, styles.button]}
            disabledStyle={styles.disabledButton}
        >
            <Text>Se connecter</Text>
        </Button>);

    }

    connectWith(user: User) {
        if (this.state.connect[user.id] === 1) return;

        let setReq =  (number) => {
            this.setState({connect: {...this.state.connect, [user.id]: number}});
        };


        setReq(1);
        this.props.dispatch(actions.createFriendship(user.id)
            .disptachForAction2(CONNECT))
            .then(() => {
                setReq(2);
            }, err => {
                console.error(err);
                setReq(3);
            })

        ;

    }


    onSavingPressed(saving: Saving) {
        this.props.navigator.push({
            screen: 'goodsh.ActivityDetailScreen', // unique ID registered with Navigation.registerScreen
            title: "Details", // navigation bar title of the pushed screen (optional)
            titleImage: require('../img/screen_title_home.png'), // iOS only. navigation bar title image instead of the title text of the pushed screen (optional)
            passProps: {activityId: saving.id, activityType: saving.type}, // Object that will be passed as props to the pushed screen (optional)
        });
    }

    onLineupPressed(lineup: List) {
        this.props.navigator.push({
            screen: 'goodsh.SavingsScreen', // unique ID registered with Navigation.registerScreen
            passProps: {
                lineupId: lineup.id,
            },
        });
    }
}


const styles = StyleSheet.create({
    button: {
        padding: 8,
        height: 30,
    },
    disabledButton: {
        borderColor: UI.Colors.grey1,
    },
    userRow: {
        margin: 12
    }
});

export const CONNECT = new ApiAction("connect");

const actions = {
    createFriendship: (userId: string) => {
        return new Api.Call().withMethod('POST')
            .withRoute(`users/${userId}/friendships`)
            ;

    }
};
