// @flow

import React from 'react';
import {Button, FlatList, Image, StyleSheet, Text, TouchableWithoutFeedback, TouchableOpacity, View} from 'react-native';
import * as UI from "../UIStyles";


export default class ItemCell extends React.Component {


    props: {
        onPressItem: Function;
        displayDetails?: boolean
    };

    render() {
        let item = this.props.item;
        if (!item) throw new Error("expecting item");

        let resource = item;
        let image = resource ? resource.image : undefined;

        return (
            <TouchableWithoutFeedback
                onPress={this.props.onPressItem}>
                <View style={
                    { ...UI.CARD(8), ...UI.TP_MARGINS(8), padding: 8,
                        flex: 1,
                        flexDirection: 'row',
                        justifyContent: "flex-start"
                    }}>

                    { image && <Image
                        source={{uri: image}}
                        resizeMode='contain'
                        style={{
                            alignSelf: 'center',
                            height: 80,
                            width: 80,
                        }}
                    />
                    }
                    <View style={{flex:1, padding: 15}}>
                        <Text
                            style={styles.title}
                            numberOfLines={this.props.displayDetails ? 7 : 3}
                        >{resource.title}</Text>
                        <Text style={styles.subtitle}>{resource.subtitle}</Text>
                    </View>
                    <Image source={require('../../img/mini-g-number.png')} resizeMode="contain"
                           style={{
                               alignSelf: 'center',
                               width: 20,
                               height: 20,
                           }}
                    />
                </View>
            </TouchableWithoutFeedback>
        )
    }


}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    title: {fontSize: 18, fontFamily: 'Chivo-Light', },
    subtitle: {fontSize: 12, color: UI.Colors.grey2}

});