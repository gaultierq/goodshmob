// @flow

import React, {Component} from 'react';
import {
    Alert,
    BackHandler,
    Button,
    Dimensions,
    Image,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import {CheckBox, SearchBar} from 'react-native-elements'
import {Navigation} from 'react-native-navigation';
import {Colors} from "../colors";
import {SFP_TEXT_MEDIUM} from "../fonts";
import PopupDialog, {DialogButton, DialogTitle, ScaleAnimation,} from 'react-native-popup-dialog';
import OnBoardingManager from "../../managers/OnBoardingManager";
import Markdown from "react-native-showdown";


type Props = {
};

type State = {
};


export default class NoSpamDialog extends Component<Props, State> {

    scaleAnimationDialog;

    render() {
        return (<PopupDialog
                ref={(popupDialog) => {
                    this.scaleAnimationDialog = popupDialog;
                    if (this.scaleAnimationDialog && !this.timeout) {
                        this.timeout = setTimeout(()=>{this.scaleAnimationDialog.show()}, 100);
                    }
                }}
                dialogAnimation={new ScaleAnimation()}

                dialogTitle={
                    <DialogTitle
                        titleAlign={'center'}
                        title={i18n.t('no_spam.dialog_title')}
                        titleTextStyle={{color: Colors.grey, fontFamily: SFP_TEXT_MEDIUM, fontSize: 20}}
                    />}
                onDismissed={() => {
                    OnBoardingManager.onDisplayed('no_spam')
                }}
                actions={[
                    <DialogButton
                        text={i18n.t('no_spam.dialog_button')}
                        align={"right"}
                        onPress={() => {
                            this.scaleAnimationDialog.dismiss();
                        }}
                        key="button-1"
                    />,
                ]}
                width={0.8}
                height={400}
            >


                <View style={{flex:1, paddingRight: 15}}>
                    <Markdown style={{color:Colors.greyishBrown}} body={i18n.t('no_spam.dialog_body')}/>
                </View>



            </PopupDialog>
        );
        // return null;
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dialogContentView: {
        // padding: 20,
        // paddingBottom: 0,
    },
});