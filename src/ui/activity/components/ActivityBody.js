// @flow
import React from 'react';
import {Image, Linking, Share, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View} from 'react-native';
import * as UI from "../../UIStyles";
import {connect} from "react-redux";
import type {Activity} from "../../../types"
import GoodshButton from "./GoodshButton";
import Button from 'apsl-react-native-button'
import {Colors} from "../../colors";
import ActionRights from "../../rights";

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

                    {/*{!noGoodshButton && activity.type !== 'asks' && <GoodshButton activity={activity}/>}*/}

                </View>

                {resource &&
                <View style={{flex:1, padding: 15, flexDirection: 'row'}}>
                    <View style={{flex:1}}>
                        <Text style={{fontSize: 18, fontFamily: 'Chivo-Light',}}>{resource.title}</Text>
                        <Text style={UI.TEXT_LESS_IMPORTANT}>{resource.subtitle}</Text>


                        {__IS_LOCAL__ &&
                        <Text style={UI.TEXT_LESS_IMPORTANT}>{activity.type + " " + activity.id}</Text>}
                    </View>
                    {this.renderBuyButton(activity)}
                </View>
                }

            </View>
        )
    }

    renderBuyButton(activity:Activity) {
        return new ActionRights(activity).canBuy() && <Button
            onPress={() => {
                this.execBuy(activity)
            }}
            style={[{height: 33, borderRadius: 4, backgroundColor: Colors.blue, borderWidth: 0}]}
        >
            <Text style={[UI.SIDE_MARGINS(10), {color: Colors.white, fontFamily: "Chivo", fontSize: 16}]}>
                #Buy
            </Text>
        </Button>;
    }


    execBuy(activity: Activity) {
        let url = _.get(activity, 'resource.url');
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                console.log("Don't know how to open URI: " + url);
            }
        });
    }

    body() {

        const {activity} = this.props;
        let resource = activity.resource;
        let image = resource ? resource.image : undefined;
        let imageHeight = 250;
        if (activity.type === 'asks'){

            let content = activity.content;
            if (__IS_LOCAL__) content += ` (id=${activity.id.substr(0, 5)})`;
            return <Text style={[{margin: 12, fontFamily: 'Chivo-Light', fontSize: 30}]}>{content}</Text>;
        }
        // image = null;
        return <View style={{
            flex:1,
            alignSelf: 'center',
            height: imageHeight + 15,
            width: "100%",
        }}>
            <Image
                source={image ? {uri: image} : require('../../../img/goodsh_placeholder.png')}
                resizeMode={image ? 'contain' : 'cover'}
                style={{
                    alignSelf: 'center',
                    height: imageHeight,
                    width: "100%",
                }}
                defaultSource={{}}
            />
        </View>
    }
}




