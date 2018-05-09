// @flow
import React from 'react';
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
import ActionRights, {canPerformAction, A_BUY} from "../../rights";
import Button from 'apsl-react-native-button';
import {SFP_TEXT_ITALIC} from "../../fonts";
import {CachedImage} from "react-native-img-cache";
import Icon from 'react-native-vector-icons/Feather';
import {firstName} from "../../../helpers/StringUtils";
import Carousel from 'react-native-looped-carousel';


type Props = {
    activity: Activity,
    onPressItem: (any) => void,
    showAllImages?: boolean,
    liked: boolean,
    bodyStyle?: *
};

type State = {
    width: number,
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

                                {__DEBUG_SHOW_IDS__ &&
                                <Text style={UI.TEXT_LESS_IMPORTANT}>{activity.type + " " + activity.id}</Text>}
                            </View>
                            {this.renderBuyButton(activity)}
                        </View>
                        {/*{this.renderDescription(activity)}*/}
                    </View>
                )}
            </View>
        )
    }


    renderBuyButton(activity:Activity) {
        return canPerformAction(A_BUY, {activity}) /*new ActionRights(activity).canBuy()*/ && <Button
            onPress={() => {
                this.execBuy(activity)
            }}
            style={[{borderRadius: 10, backgroundColor: Colors.blue, borderWidth: 0}]}
        >
            <Icon name="shopping-cart" size={22} color={Colors.white} style={UI.stylePadding(10,1,10,1)}/>
            {/*<Text style={[UI.SIDE_MARGINS(10), {color: Colors.white, fontFamily: SFP_TEXT_MEDIUM, fontSize: 14}]}>

                i18n.t("actions.buy")
            </Text>*/}
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

    _onLayoutDidChange = e => {
        const layout = e.nativeEvent.layout;
        this.setState({  width: layout.width });
    };

    renderImage() {

        const {activity} = this.props;
        if (activity.type === 'asks'){
            let content = activity.content;
            if (__DEBUG_SHOW_IDS__) content += ` (id=${activity.id.substr(0, 5)})`;
            return <Text style={styles.askText}>{content}</Text>;
        }

        let resource = activity.resource;
        let images = resource ? resource.images : undefined;

        // For when resource is a Spotify song
        if (images && images.length === 0) {
            images = [resource.image]
        }

        if (images && !this.props.showAllImages) {
            images = images.slice(0, 1)
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

        const shadowOpt = {
            width:"100%",
            height:imageHeight,
            color:"#000",
            border:5,
            radius:3,
            opacity:1,
            x:0,
            y:3,
            style:{marginVertical:5}
        };

        return <View style={[styles.imageContainer,{height: imageHeight,}]}>

            {/*<BoxShadow setting={shadowOpt}>*/}

            <Carousel
                delay={4000}
                style={styles.imageContainer}
                autoplay
                bullets={this.props.showAllImages}>
                {images.map((image, i) => {
                    return <CachedImage
                        source={image ? {uri: image} : require('../../../img/goodsh_placeholder.png')}
                        key={image}
                        resizeMode={resize}
                        style={[styles.image, {height: imageHeight, width: this.state.width}]}
                        defaultSource={{}}
                    />

                }) }
            </Carousel>

            {
                <Animated.View style={[styles.yheaaContainer, {opacity}]}>
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
    askText: {margin: 12, fontSize: 30}
});
