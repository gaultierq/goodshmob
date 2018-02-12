// @flow

import React, {Component} from 'react';
import {Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View,} from 'react-native';
import Snackbar from "react-native-snackbar"

import {CheckBox, SearchBar} from 'react-native-elements'
import {Navigation} from 'react-native-navigation';
import {Menu, MenuContext, MenuOption, MenuOptions, MenuTrigger} from 'react-native-popup-menu';
import type {Visibility} from "../screens/additem";
import SmartInput from "../components/SmartInput";
import {LINEUP_CREATION} from '../lineup/actions'
import {Colors} from "../colors";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import Sheet from "../components/sheet";
import {connect} from "react-redux";
import {SFP_TEXT_REGULAR} from "../fonts";
import GTouchable from "../GTouchable";

type Props = {
    disableOffline?: ?boolean,
    onFinished?:?()=>void
};

type State = {
    newLineupPrivacy?: Visibility,
};

@connect()
export default class AddLineupSheet extends Component<Props, State> {

    static navigatorStyle = {
        navBarHidden: true,
        screenBackgroundColor: 'transparent',
        modalPresentationStyle: 'overFullScreen',
        tapBackgroundToDismiss: true
    };

    _sheet;

    state = {};

    render() {
        return (<KeyboardAwareScrollView
            contentContainerStyle={{flex:1}}
            scrollEnabled={false}
            keyboardShouldPersistTaps='always'
            // style={{position: 'absolute', bottom:0, top: 0}}
        >
            <Sheet
                navigator={this.props.navigator}
                ref={ref => this._sheet = ref}
            >
                <View style={{height: 165, paddingTop: 7, paddingLeft: 7, paddingRight: 7, paddingBottom: 0, backgroundColor: Colors.white}}>

                    <View style={{flexDirection: 'row', padding: 8}}>
                        <GTouchable onPress={()=>this._sheet && this._sheet.close()}>
                            <Image source={require('../../img2/closeXGrey.png')}/>
                        </GTouchable>
                        <CheckBox
                            right
                            title={i18n.t("create_list_controller.unvisible")}
                            checkedTitle={i18n.t("create_list_controller.visible")}
                            iconRight
                            checkedIcon='unlock'
                            uncheckedIcon='unlock-alt'
                            size={16}
                            checkedColor={Colors.greyishBrown}
                            uncheckedColor={Colors.greyishBrown}
                            onPress={(newValue) => this.setState({newLineupPrivacy: !!this.state.newLineupPrivacy ? 0 : 1})}
                            checked={!this.state.newLineupPrivacy}
                            style={{backgroundColor: 'transparent', alignSelf: 'flex-end'}}
                            textStyle={{color: Colors.brownishGrey, fontSize: 14, fontFamily: SFP_TEXT_REGULAR, fontWeight: 'normal'}}
                            containerStyle={{ backgroundColor: "transparent", borderWidth: 0, marginRight:0, padding: 0, flex: 1}}
                        />
                    </View>

                    <View style={[styles.header, {flexDirection: 'column'}]}>
                        <SmartInput
                            execAction={(input: string) => this.createLineup(input)}
                            placeholder={"create_list_controller.placeholder"}
                            button={<Text>{i18n.t('actions.create')}</Text>}
                            returnKeyType={'go'}
                            inputContainerStyle={{borderWidth: 0}}
                            autoFocus={true}
                        />
                    </View>
                </View>
            </Sheet>
        </KeyboardAwareScrollView>);
    }


    createLineup(name: string) {
        let delayMs = 3000;
        return this.props.dispatch(LINEUP_CREATION[this.props.disableOffline ? 'exec' : 'pending']({listName: name}, {delayMs}))
            .then((pendingId)=> {
                const onFinished = this.props.onFinished;
                onFinished && onFinished();
                Snackbar.show({
                        title: i18n.t('create_list_controller.created'),
                        duration: Snackbar.LENGTH_LONG,
                        action: {
                            title: i18n.t('actions.undo'),
                            color: 'green',
                            onPress: () => {
                                this.props.dispatch(LINEUP_CREATION.undo(pendingId))
                            },
                        },
                    }
                );
            });
    }

}


const styles = StyleSheet.create({
    container: {
        // flex: 1,
    },
    header: {
        // flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        // padding: 10,
        // marginTop: 10,
        // marginBottom: 10,
    },
    headerText:{
        flex: 1,
        textAlignVertical: 'center',

        fontSize: 16,
    },
});
