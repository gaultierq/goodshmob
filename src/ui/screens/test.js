// @flow
import React, {Component} from 'react';
import {Clipboard, Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, User, View} from 'react-native';
import {CheckBox} from "react-native-elements";

import Modal from 'react-native-modal'
import GTouchable from "../GTouchable";


import {AppTour, AppTourSequence, AppTourView} from "../../../vendors/taptarget";


type Props = {
};

type State = {
};


export default class TestScreen extends Component<Props, State> {

    appTourTargets= [];

    state = {
    };


    componentDidMount() {
        setTimeout(() => {
            if (this.appTourTargets.length > 0) {
                let appTourSequence = new AppTourSequence();
                this.appTourTargets.forEach(appTourTarget => {
                    appTourSequence.add(appTourTarget);
                });

                AppTour.ShowSequence(appTourSequence);
            }

        });
    }


    render() {
        return null;
//         return (
// <<<<<<< HEAD

//             <View style={{ flex: 1 }}>
//                 <GTouchable onPress={this._showModal}>
//                     <Text>Show Modal</Text>
//                 </GTouchable>
//                 <Modal
//                     isVisible={this.state.isModalVisible}
//                     onBackdropPress={this._hideModal}
//                 >
//                     <View style={{ flex: 1, backgroundColor: 'white'}}>
//                         <Text>Hello!</Text>
//                     </View>
//                 </Modal>
// =======
//             <View style={{ flex: 1, backgroundColor: 'blue' }}>
//                 <View ref={ref=>{
//                     let appTourTarget = AppTourView.for(ref, {
//                         primaryText: 'This is a target button 1',
//                         secondaryText: 'We have the best targets, believe me'
//                     });
//                     this.appTourTargets.push(appTourTarget);
//                 }}
//                       style={{ width: 100, height: 100,backgroundColor: 'red' }}/>
// >>>>>>> focus
//             </View>
//         );
    }
}

