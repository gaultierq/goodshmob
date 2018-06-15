// @flow
import React, {type Node} from 'react';
import {
    Animated,
    Easing,
    Image,
    Linking,
    Share,
    StyleSheet,
    Text,
    TouchableHighlight,
    TouchableOpacity,
    View
} from 'react-native';
import * as UI from "../../UIStyles";
import {connect} from "react-redux";
import {logged} from "../../../managers/CurrentUser"
import type {Activity} from "../../../types"
import {ACTIVITY_CELL_BACKGROUND, Colors} from "../../colors";
import {SFP_TEXT_ITALIC} from "../../fonts";
import GImage from '../../components/GImage'

import {firstName} from "../../../helpers/StringUtils";
import Carousel from 'react-native-looped-carousel';


type Props = {
    activity: Activity,
    showAllImages?: boolean,
    liked: boolean,
    bodyStyle?: *,
    rightComponent?: Node
};

type State = {
    width?: number,
};

@connect()
@logged
export default class ActivityBody extends React.Component<Props, State> {

    static defaultProps = {
        showAllImages: false
    };

    componentWillReceiveProps(nextProps: Props) {
        if (nextProps.liked && !this.props.liked) {
            this.showYeah();
        }
    }

    state = {}

    render() {

        const {activity, bodyStyle} = this.props;

        if (activity.type === 'asks') throw "Illegal"
        let resource = activity.resource;

        return (
            <View onLayout={this._onLayoutDidChange}>
                {/*Image And Button*/}
                {this.renderImage()}

                {resource && (
                    <View style={[styles.body, bodyStyle]}>
                        <View style={styles.bodyInner}>
                            <View style={styles.flex1}>
                                <Text style={[styles.title]} numberOfLines={2}>{resource.title}</Text>
                                <Text style={[styles.subtitle]}>{resource.subtitle}</Text>
                                {__DEBUG_SHOW_IDS__ && <Text style={UI.TEXT_LESS_IMPORTANT}>{activity.type + " " + activity.id}</Text>}
                            </View>
                            {this.props.rightComponent}
                        </View>
                        {/*{this.renderDescription(activity)}*/}
                    </View>
                )}
            </View>
        )
    }

    _onLayoutDidChange = e => {
        const layout = e.nativeEvent.layout;
        this.setState({  width: layout.width });
    };

    renderImage() {

        const {activity} = this.props;

        let resource = activity.resource;
        let images = _.get(resource, 'images', [])

        // When resource is a book, to show cover first
        if (images && resource.provider === 'Amazon') {
            images.unshift(resource.image)
            images = _.uniq(images)
        }

        // For when resource is a Spotify song
        if (images && images.length === 0) {
            images = [resource.image]
        }

        let imageHeight = 288;

        const resize = images && (
            resource.type === 'CreativeWork'
            || resource.type === 'TvShow'
            || resource.type === 'Movie'
        )? 'contain' : 'cover';

        const opacity = this.animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1]
        });

        return <View style={[styles.imageContainer,{height: imageHeight,}]}>

            {/*<BoxShadow setting={shadowOpt}>*/}

            {this.props.showAllImages && <Carousel
                delay={4000}
                style={styles.imageContainer}
                autoplay
                swipe={this.props.showAllImages}
                bullets={false}>
                {images.map((image, i) => {
                    return <GImage
                        source={image ? {uri: image} : require('../../../img/goodsh_placeholder.png')}
                        key={image}
                        resizeMode={resize}
                        style={[styles.image, {height: imageHeight, width: this.state.width}]}
                    />

                }) }
            </Carousel>}
            {!this.props.showAllImages &&
            <GImage
                source={resource.image ? {uri: resource.image} : require('../../../img/goodsh_placeholder.png')}
                resizeMode={resize}
                style={[styles.image, {height: imageHeight, width: this.state.width}]}
            />}

            {
                <Animated.View style={[styles.yheaaContainer, {opacity}]} pointerEvents={this.props.showAllImages ? 'none' : 'auto'}>
                    <Image resizeMode={'cover'} style={{}} source={require('../../../img2/yeaahAction.png')}/>
                </Animated.View>
            }
            {/*</BoxShadow>*/}
        </View>
    }

    animatedValue = new Animated.Value(0);

    showYeah() {
        this.animatedValue.setValue(1);
        Animated.timing(
            this.animatedValue,
            {
                toValue: 0,
                duration: 400,
                delay: 600,
                easing: Easing.ease
            }
        ).start(() => {
        })
    }
}


const styles = StyleSheet.create({
    body: {padding: 15, paddingBottom: 0, backgroundColor: ACTIVITY_CELL_BACKGROUND},
    bodyInner: {flexDirection: 'row'},
    flex1: {flex:1},
    title: {fontSize: 19, color: Colors.black, marginBottom: 4, marginRight: 5},
    subtitle: {fontSize: 14, color: Colors.greyish},
    description: {fontSize: 14, fontFamily: SFP_TEXT_ITALIC, color: Colors.brownishGrey},
    imageContainer: {flex:1, alignSelf: 'center', width: "100%", backgroundColor: 'transparent'},
    image: {alignSelf: 'center', backgroundColor: ACTIVITY_CELL_BACKGROUND, width: "100%"},
    yheaaContainer: {position: 'absolute', width: "100%", height: "100%",backgroundColor: 'rgba(0,0,0,0.3)',alignItems: 'center',justifyContent: 'center'},
    tag: {flexDirection:'row', alignItems: 'center'},
});
