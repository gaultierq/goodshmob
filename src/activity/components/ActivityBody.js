// @flow
import React from 'react';
import {Image, Linking, Share, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View} from 'react-native';
import * as UI from "../../screens/UIStyles";
import {connect} from "react-redux";
import type {Activity} from "../../types"
import GoodshButton from "./GoodshButton";

type Props = {
    activity: Activity,
    onPressItem: (any) => void,
    noGoodshButton?: boolean
};

type State = {
};

@connect()
export default class ActivityBody extends React.Component<Props, State> {

    render() {
        const {activity, noGoodshButton} = this.props;
        let resource = activity.resource;

        let bgc = null;//{backgroundColor: activity.type === 'asks' ?  'red' : 'transparent'}
        return (
            <View>
                {/*Image And Button*/}
                <View style={[{alignItems: 'center',width: "100%"}, bgc]}>
                    {this.body()}

                    {!noGoodshButton && activity.type !== 'asks' && <GoodshButton activity={activity}/>}

                </View>

                {resource &&
                <View style={{padding: 15}}>
                    <Text style={{fontSize: 18, fontFamily: 'Chivo-Light',}}>{resource.title}</Text>
                    <Text style={UI.TEXT_LESS_IMPORTANT}>{resource.subtitle}</Text>

                    {__DEV__ && <Text style={UI.TEXT_LESS_IMPORTANT}>{activity.type + " " + activity.id}</Text>}
                </View>
                }

            </View>
        )
    }

    body() {

        const {activity} = this.props;
        let resource = activity.resource;
        let image = resource ? resource.image : undefined;
        let imageHeight = 250;
        if (activity.type === 'asks'){
            return <Text style={[{margin: 12, fontFamily: 'Chivo-Light', fontSize: 30}]}>{activity.content}</Text>;
        }
        return <View style={{
            flex:1,
            alignSelf: 'center',
            height: imageHeight + 15,
            width: "100%",
        }}>
            {!!image && <Image
                source={{uri: image}}
                resizeMode='contain'
                style={{
                    alignSelf: 'center',
                    height: imageHeight,
                    width: "100%",
                }}
            />
            }
        </View>
    }
}




