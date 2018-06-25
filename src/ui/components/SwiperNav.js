// @flow

import React, {Component} from 'react'
import {Image, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native'
import {SFP_TEXT_MEDIUM} from "../fonts"



export default class SwiperNav extends Component<Props, State> {

    render() {
      const {dotColor, loveColor, eiffel} = this.props.color;
      const skipStyle = [{color: loveColor}, styles.header_link];
      const index = this.props.index;
      //
      if(index < 4) {
        return(
          <View style={styles.header}>
            <TouchableOpacity onPress={this.props.onPressSkip}>
              <Text style={skipStyle}>{i18n.t("actions.skip")}</Text>
            </TouchableOpacity>
          </View>
        )
      }
      // display if last swiper view
      // need to include the back arrow button
      return(
        <View></View>
      )
    }
}

const styles = StyleSheet.create({
  header : {
    position: 'absolute',
    right: 24,
    top: 47
  },
  header_link: {
    fontSize: 20,
    fontFamily: SFP_TEXT_MEDIUM,
    backgroundColor: 'transparent'
  },
});
