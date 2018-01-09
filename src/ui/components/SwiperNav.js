// @flow

import React, {Component} from 'react';
import {View, Image, StyleSheet, Text, TextInput, TouchableOpacity} from 'react-native';
import {Colors} from "../colors";
import i18n from '../../i18n/i18n'
import {SFP_TEXT_BOLD, SFP_TEXT_MEDIUM} from "../fonts";

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
