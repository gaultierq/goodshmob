/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { Navigation } from 'react-native-navigation';

import { registerScreens } from './app/screens';

registerScreens(); // this is where you register all of your app's screens


import Login from './app/components/Login';

// export default class goodshmob extends Component {
//   render() {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.welcome}>
//           Welcome to Goodsh'!
//         </Text>
//
//         <Login/>
//       </View>
//     );
//   }
// }
//
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F5FCFF',
//   },
//   welcome: {
//     fontSize: 20,
//     textAlign: 'center',
//     margin: 10,
//   },
//   instructions: {
//     textAlign: 'center',
//     color: '#333333',
//     marginBottom: 5,
//   },
// });
//
// AppRegistry.registerComponent('goodshmob', () => goodshmob);


// start the app
Navigation.startTabBasedApp({
    tabs: [
        {
            label: 'Login',
            screen: 'example.Login',
            icon: require('./app/img/profil.png'),
            //selectedIcon: require('../img/two_selected.png'), // iOS only
            title: 'Login screen'
        }
    ]
});