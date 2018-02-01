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
import type {Activity, i18Key} from "../../../types"
import {ACTIVITY_CELL_BACKGROUND, Colors} from "../../colors";
import ActionRights from "../../rights";
import Button from 'apsl-react-native-button';
import {SFP_TEXT_ITALIC, SFP_TEXT_MEDIUM} from "../../fonts";
import {seeList, seeUser} from "../../Nav";
import GTouchable from "../../GTouchable";
import {CachedImage} from "react-native-img-cache";
import Icon from 'react-native-vector-icons/Feather';
import {firstName} from "../../../helpers/StringUtils";
import {renderTag} from "../../UIComponents";


type Props = {
    activity: Activity,
    onPressItem: (any) => void,
    skipLineup?: boolean,
    liked: boolean,
};

type State = {
};

@connect()
@logged
export default class ActivityBody extends React.Component<Props, State> {

    componentWillReceiveProps(nextProps: Props) {
        if (nextProps.liked && !this.props.liked) {
            this.showYeah();
        }
    }

    render() {
        const {activity} = this.props;
        let resource = activity.resource;

        return (
            <View>
                {/*Image And Button*/}
                {this.renderImage()}

                {resource && (
                    <View style={styles.body}>
                        <View style={styles.bodyInner}>
                            <View style={styles.flex1}>
                                <Text style={[styles.title]} numberOfLines={2}>{resource.title}</Text>
                                <Text style={[styles.subtitle]}>{resource.subtitle}</Text>

                                {__DEBUG_SHOW_IDS__ &&
                                <Text style={UI.TEXT_LESS_IMPORTANT}>{activity.type + " " + activity.id}</Text>}
                            </View>
                            {this.renderBuyButton(activity)}
                        </View>
                        {this.renderTags()}

                        {!!activity.description && <Text style={[styles.description]}>{"\"" + activity.description + "\""}</Text>}
                    </View>
                )}
            </View>
        )
    }


    renderTags() {
        let activity, target, targetName: string, key: i18Key, press: () => void;
        if (!(activity = this.props.activity)) return null;
        if (activity.type === 'asks') throw 'no ask';

        // const {skipLineup, withFollowButton} = this.props;
        // if (skipLineup) return null;


        if (!(target = activity.target)) return null;

        if (target.type === 'lists') {
            let count = target.meta ? target.meta["savingsCount"] : 0;
            targetName = target.name;
            if (count) targetName += " (" + count + ")";

            key = "activity_item.header.in";
            press = () => seeList(this.props.navigator, target);
        }
        else if (target.type === 'users') {
            targetName = target.firstName + " " + target.lastName;
            key = "activity_item.header.to";
            press = () => seeUser(this.props.navigator, target);

            //new spec. todo clean
            return null;
        }

        const inLineup = i18n.t(key) + ' ' + targetName;
        const tags = [];
        if (!this.props.skipLineup) {
            tags.push(inLineup);
        }
        return tags.map(tag=><View key={tag} style={styles.tag}>
            {renderTag(tag, press)}
        </View>)
    }


    renderBuyButton(activity:Activity) {
        return new ActionRights(activity).canBuy() && <Button
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

    renderImage() {

        const {activity} = this.props;
        let resource = activity.resource;
        let image = resource ? resource.image : undefined;
        let imageHeight = 288;
        if (activity.type === 'asks'){
            let content = activity.content;
            if (__DEBUG_SHOW_IDS__) content += ` (id=${activity.id.substr(0, 5)})`;
            return <Text style={styles.askText}>{content}</Text>;
        }

        const resize = image && (
            resource.type === 'CreativeWork'
            || resource.type === 'TvShow'
            || resource.type === 'Movie'
        )? 'contain' : 'cover';

        const opacity = this.animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1]
        });

        return <View style={[styles.imageContainer, {height: imageHeight}]}>

            <CachedImage
                source={image ? {uri: image} : require('../../../img/goodsh_placeholder.png')}
                resizeMode={resize}
                style={[styles.image, {height: imageHeight}]}
                defaultSource={{}}
            />

            {
                <Animated.View style={[styles.yheaaContainer, {opacity}]}>
                    <Image resizeMode={'cover'} style={{}} source={require('../../../img2/yeaahAction.png')}/>
                </Animated.View>
            }

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
    description: {fontSize: 14, fontFamily: SFP_TEXT_ITALIC, marginTop: 10, color: Colors.brownishGrey},
    imageContainer: {flex:1, alignSelf: 'center', width: "100%", backgroundColor: 'transparent'},
    image: {alignSelf: 'center', backgroundColor: ACTIVITY_CELL_BACKGROUND, width: "100%"},
    yheaaContainer: {position: 'absolute', width: "100%", height: "100%",backgroundColor: 'rgba(0,0,0,0.3)',alignItems: 'center',justifyContent: 'center'},
    tag: {flexDirection:'row', marginTop: 10},
    askText: {margin: 12, fontSize: 30}
});
