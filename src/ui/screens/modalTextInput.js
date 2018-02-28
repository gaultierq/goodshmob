// @flow
import React, {Component} from 'react';
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
import {CheckBox} from "react-native-elements";
import {connect} from "react-redux";
import {logged} from "../../managers/CurrentUser"
import {Colors} from "../colors";
import Sheet from "../components/sheet";
import {SFP_TEXT_MEDIUM, SFP_TEXT_REGULAR} from "../fonts";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import GTouchable from "../GTouchable";
import {renderSimpleButton} from "../UIStyles";

type Props = {
    initialText: string,
    navigator: any,
    containerStyle?:? any,
    requestAction: string => Promise<*,*>
};

type State = {
    input: string,
    isRequesting?: boolean
};

const MAX_LENGTH = 500;

@connect()
@logged
export default class ModalTextInput extends Component<Props, State> {

    static navigatorStyle = {
        navBarHidden: true,
        screenBackgroundColor: 'transparent',
        modalPresentationStyle: 'overFullScreen',
        tapBackgroundToDismiss: true
    };

    _sheet;

    constructor(props) {
        super(props);
        this.state= {input: props.initialText || ''};
    }


    render() {
        const {containerStyle, ...attributes} = this.props;

        let input = this.state.input;
        let notEditable = !!this.state.isRequesting;
        let updatable =  this.state.input !== this.props.initialText;


        return (
            <KeyboardAvoidingView
                contentContainerStyle={{flex:1}}
                scrollEnabled={false}
                extraScrollHeight={20}
                keyboardShouldPersistTaps='always'
                style={{position: 'absolute', bottom:0, top: 0, left: 0, right: 0}}
            >
                <Sheet
                    navigator={this.props.navigator}
                    ref={ref => this._sheet = ref}
                >
                    <View style={{height: 600, padding: 15}}>

                        <View style={{flexDirection: 'row'}}>
                            <GTouchable onPress={()=>this._sheet && this._sheet.close()}>
                                <Image style={{width: 15, height: 15}} source={require('../../img2/closeXGrey.png')}/>
                            </GTouchable>
                            <Text style={{
                                fontSize: 18,
                                lineHeight: 18,
                                marginLeft: 20,
                                textAlign: 'center',
                                fontFamily: SFP_TEXT_MEDIUM,
                            }}>{i18n.t("actions.change_description")}</Text>
                        </View>
                        <TextInput
                            editable={!notEditable}
                            onSubmitEditing={this.submit.bind(this)}
                            value={input}
                            multiline={true}
                            numberOfLines={6}
                            maxLength={MAX_LENGTH}
                            blurOnSubmit
                            onChangeText={(input) => this.setState({input})}
                            placeholder={i18n.t("create_list_controller.add_description")}
                            autoFocus={true}
                            textAlignVertical={'top'}
                            style={[
                                {backgroundColor: 'transparent', marginVertical: 20},
                                styles.input,
                                (notEditable ? {color: "grey"} : {color: Colors.black}),
                            ]}
                            returnKeyType={'send'}
                            {...attributes}
                        />
                        <View style={{flexDirection: 'row'}}>
                            <View style={{flex: 1, alignItems: 'flex-end'}}>

                                {
                                    renderSimpleButton(
                                        i18n.t('actions.save'),
                                        () => this.submit(),
                                        {
                                            loading: this.state.isRequesting,
                                            style: {alignSelf: 'flex-end'},
                                            disabled: !updatable,
                                            textStyle: {fontSize: 14, color:Colors.grey}
                                        }
                                    )

                                }
                            </View>
                        </View>

                    </View>

                </Sheet>
            </KeyboardAvoidingView>
        );
    }


    onBeforeClose(proceed: ()=>void, interupt: ()=>void) {

        if (!_.isEmpty(this.state.input)) {

            Alert.alert(
                i18n.t('actions.cancel'),
                i18n.t('ask.cancel'),
                [
                    {text: i18n.t('actions.cancel'), onPress: () => {
                        console.log('Cancel Pressed');
                        interupt();

                    }, style: 'cancel'},
                    {text: i18n.t('actions.ok'), onPress: () => {
                        proceed();
                    }},
                ],
                { cancelable: true }
            )
        }
        else {
            proceed();
        }
    }


    submit() {

        if (this.state.isRequesting) return;
        this.setState({isRequesting: true});

        this.props.requestAction(this.state.input)
            // .catch(ex=> this.setState({isRequesting: false}))
            .then(()=> {
                this._sheet && this._sheet.close();
            }, ex=> this.setState({isRequesting: false}))
        ;
    }

}

const styles = StyleSheet.create({
    input:{
        fontSize: 18,
        lineHeight: 25,
        fontFamily: SFP_TEXT_REGULAR,
        borderColor: Colors.greyishBrown,

    },
    header:{
        fontSize: 16,
        color: Colors.white
    },
    disabledButton: {
        borderColor: Colors.greyishBrown,
    }
});
