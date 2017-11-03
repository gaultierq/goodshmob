// @flow
import React from 'react';
import {Image, Linking, Share, StyleSheet, Text, TouchableWithoutFeedback, TouchableOpacity, View} from 'react-native';
import * as UI from "../../screens/UIStyles";
import {connect} from "react-redux";
import type {Activity} from "../../types"
import GoodshButton from "./GoodshButton";

type Props = {
    activity: Activity,
    onPressItem: (any) => void
};

type State = {
};

class ActivityBody extends React.Component<Props, State> {

    props: {
        activity: Activity,
        onPressItem: (any) => void,
        noGoodshButton?: boolean
    };

    render() {
        const {activity, noGoodshButton} = this.props;
        let resource = activity.resource;
        let image = resource ? resource.image : undefined;
        let imageHeight = 250;

        return (
            <View>
                {/*Image And Button*/}
                <View style={{alignItems: 'center',}}>
                    <TouchableWithoutFeedback
                        onPress={this.props.onPressItem}
                        style={{
                            alignSelf: 'center',
                            height: imageHeight+15,
                            width: "100%",
                        }}>
                        <Image
                            source={{uri: image}}
                            resizeMode='contain'
                            style={{
                                alignSelf: 'center',
                                height: imageHeight,
                                width: "100%",
                            }}
                        />
                    </TouchableWithoutFeedback>

                    {!noGoodshButton && <GoodshButton activity={activity}/>}

                </View>


                <View style={{padding: 15}}>
                    <Text style={{fontSize: 18, fontFamily: 'Chivo-Light',}}>{resource.title}</Text>
                    <Text style={UI.TEXT_LESS_IMPORTANT}>{resource.subtitle}</Text>
                </View>

            </View>
        )
    }

}

const mapStateToProps = (state, ownProps) => ({
    data: state.data,
});

export default connect(mapStateToProps)(ActivityBody);


