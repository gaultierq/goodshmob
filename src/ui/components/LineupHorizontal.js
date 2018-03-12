// @flow

import React, {Component} from 'react';
import {
    Alert,
    BackHandler,
    Button,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import {connect} from "react-redux";
import type {Id, RNNNavigator, Saving} from "../../types";
import {List} from "../../types"
import Snackbar from "react-native-snackbar"
import {stylePadding} from "../UIStyles";
import {currentGoodshboxId, logged} from "../../managers/CurrentUser"
import {CheckBox, SearchBar} from 'react-native-elements'
import {Navigation} from 'react-native-navigation';
import {LINEUP_DELETION} from "../lineup/actions";
import * as Nav from "../Nav";
import {startAddItem} from "../Nav";
import {Colors} from "../colors";
import LineupTitle from "../components/LineupTitle";
import Feed from "../components/feed";
import LineupCellSaving from "../components/LineupCellSaving";

import GTouchable from "../GTouchable";
import BottomSheet from 'react-native-bottomsheet';
import Icon from 'react-native-vector-icons/FontAwesome';
// $FlowFixMe
type Props = {
    navigator: RNNNavigator,
    list: List,
    withMenuButton: boolean,
    withLineupTitle: boolean,
};

type State = {
};


@connect()
@logged
export default class LineupHorizontal extends Component<Props, State> {

    render() {
        const {withMenuButton, withLineupTitle, list} = this.props;
        return (
            <View>
                {withLineupTitle && <GTouchable
                    onPress={() => this.seeLineup(list.id)}>

                    <View style={{flexDirection:'row', paddingLeft: 15, paddingRight: 15}}>
                        <LineupTitle lineup={list}/>
                        {withMenuButton && this.renderMenuButton(list, 15)}
                    </View>
                </GTouchable>}
                {this.renderList(list)}
            </View>

        )
    }

    renderList(list: List) {
        let savings = list.savings;
        if (_.isEmpty(savings)) {
            return this.renderEmptyList(list)
        }

        return <Feed
            data={savings}
            renderItem={({item}) => (
                <GTouchable onPress={()=>{this.onSavingPressed(item)}}>
                    <LineupCellSaving saving={item} style={{marginRight: 10}}/>
                </GTouchable>)
            }
            // fetchSrc={{
            //     callFactory: this.fetchInteractions.bind(this),
            //     useLinks: true,
            //     action: FETCH_INTERACTIONS,
            // }}
            hasMore={false}
            horizontal={true}
            // ItemSeparatorComponent={()=> <View style={{margin: 20}} />}
            contentContainerStyle={{paddingLeft: 15}}
            showsHorizontalScrollIndicator={false}
            // cannotFetch={!super.isVisible()}
        />
    }

    renderMenuButton(item, padding) {
        if (item.id === currentGoodshboxId()) return null;

        // console.log("paddings:" + stylePadding(padding, 12));
        let handler = () => {
            BottomSheet.showBottomSheetWithOptions({
                options: [i18n.t("actions.change_title"), i18n.t("actions.delete"), i18n.t("actions.cancel")],
                title: item.name,
                dark: true,
                destructiveButtonIndex: 1,
                cancelButtonIndex: 2,
            }, (value) => {
                switch (value) {
                    case 1:
                        this.deleteLineup(item);
                        break;
                    case 0:
                        this.changeTitle(item);
                        break;
                }
            });
        };
        return (<View style={{position: "absolute", right: 0, margin: 0}}>
            <GTouchable onPress={handler}>
                <View style={{...stylePadding(padding, 14)}}>
                    <Image
                        source={require('../../img2/moreDotsGrey.png')} resizeMode="contain"/>
                </View>
            </GTouchable>
        </View>);
    }



    onSavingPressed(saving: Saving) {
        this.props.navigator.showModal({
            screen: 'goodsh.ActivityDetailScreen',
            passProps: {activityId: saving.id, activityType: saving.type},
            // navigatorButtons: Nav.CANCELABLE_MODAL,
        });
    }

    seeLineup(id: Id) {
        this.props.navigator.showModal({
            screen: 'goodsh.LineupScreen', // unique ID registered with Navigation.registerScreen
            passProps: {
                lineupId: id,
            },
            navigatorButtons: Nav.CANCELABLE_MODAL,
        });
    }


    deleteLineup(lineup: List) {
        let delayMs = 3000;
        //deleteLineup(lineup.id, delayMs)
        const lineupId = lineup.id;
        return Alert.alert(
            i18n.t("alert.delete.title"),
            i18n.t("alert.delete.label"),
            [
                {text: i18n.t("actions.cancel"), onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                {text: i18n.t("actions.ok"), onPress: () => {
                    this.props.dispatch(LINEUP_DELETION.pending({lineupId}, {delayMs, lineupId}))
                        .then(pendingId => {
                            Snackbar.show({
                                    title: i18n.t("activity_item.buttons.deleted_list"),
                                    duration: Snackbar.LENGTH_LONG,
                                    action: {
                                        title: i18n.t("actions.undo"),
                                        color: 'green',
                                        onPress: () => {
                                            this.props.dispatch(LINEUP_DELETION.undo(pendingId))
                                        },
                                    },
                                }
                            );
                        });
                }
                },
            ],
            { cancelable: true }
        );
    }

    changeTitle(lineup: List) {
        let {id, name} = lineup;


        this.props.navigator.showModal({
            screen: 'goodsh.ChangeLineupName',
            animationType: 'none',
            passProps: {
                lineupId: id,
                initialLineupName: name
            }
        });
    }


    renderEmptyList(list: List) {
        let result = [];
        // first item render
        result.push(<View key={`key-${0}`} style={[
            LineupCellSaving.styles.cell,
            {
                backgroundColor: Colors.grey3,
                marginRight: 10,
                opacity: 1,
                alignItems: 'center',
                justifyContent:'center'
            }
        ]}>
            <Icon name="plus" size={45} color={Colors.dirtyWhite}/>
        </View>);
        //
        for (let i = 1; i < 5; i++) {
            result.push(<View key={`key-${i}`} style={[
                LineupCellSaving.styles.cell,
                {
                    backgroundColor: Colors.grey3,
                    marginRight: 10,
                    opacity: 1 - (0.2 * i)
                }
            ]}/>);
        }
        return (<GTouchable onPress={() => {
            startAddItem(this.props.navigator, list.id);
        }
        }>
            <View style={{flexDirection: 'row', paddingLeft: 15}}>{result}</View>
        </GTouchable>);
    }
}
