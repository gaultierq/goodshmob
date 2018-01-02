// @flow
import type {Node} from 'react';
import React from 'react';
import {Button, FlatList, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import * as UI from "../UIStyles";
import type {Item} from "../../types";
import {Colors} from "../colors";


type Props = {
    item: Item,
    displayDetails?: boolean,
    children?: Node
};

type State = {
};

export default class ItemCell extends React.Component<Props, State> {


    render() {
        let item = this.props.item;
        if (!item) throw new Error("expecting item");

        let resource = item;
        let image = resource ? resource.image : undefined;

        return (
            <View style={
                {padding: 8, flex: 1,}}>
                <View style={
                    {
                        flexDirection: 'row',
                        justifyContent: "flex-start",
                        alignItems: 'center'
                    }}>


                    { image && <Image
                        source={{uri: image}}
                        resizeMode='cover'
                        style={[{
                            alignSelf: 'center',
                            height: 80,
                            width: 80,
                        }, UI.STYLES.lightBorder]}
                    />
                    }
                    <View style={{flex:1, padding: 15}}>
                        <Text
                            style={styles.title}
                            numberOfLines={this.props.displayDetails ? 7 : 3}
                        >{resource.title}</Text>
                        <Text style={styles.subtitle}>{resource.subtitle}</Text>
                    </View>
                </View>
                {this.props.children}
            </View>
        )
    }


}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    title: {fontSize: 18, },
    subtitle: {fontSize: 12, color: Colors.greyish}

});