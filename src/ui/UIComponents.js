// @flow
// @flow

import React, {Component} from 'react';
import {Image, LayoutAnimation, StyleSheet, Text, View, UIManager} from 'react-native';
import {Colors} from "./colors";
import User from "react-native-firebase/lib/modules/auth/User";
import {CachedImage} from "react-native-img-cache";
import GTouchable from "./GTouchable";
import {BACKGROUND_COLOR, LINEUP_PADDING, STYLES} from "./UIStyles";
import Spinner from 'react-native-spinkit';
import type {Id, Lineup, RequestState, RNNNavigator} from "../types";
import {displayLineupActionMenu, seeList, startAddItem} from "./Nav";
import {LineupH1} from "./components/LineupHorizontal";
import {isCurrentUserId} from "../managers/CurrentUser";
import {SFP_TEXT_MEDIUM} from "./fonts";
import LineupHorizontal from "./components/LineupHorizontal";


// export const MainBackground = (props) => <ImageBackground
//         source={require('../img/home_background.png')}
//         style={{
//             // flex: 1,
//             position: 'absolute',
//             width: '100%',
//             height: '100%',
//         }}>{props.children}</ImageBackground>;



export const MainBackground = (props) => <View
    style={{
        // flex: 1,
        backgroundColor: BACKGROUND_COLOR,
        position: 'absolute',
        width: '100%',
        height: '100%',
    }}>{props.children}
</View>;



type Props = {
    user: User,
    size?: number,
    style?: any
}
type State = {}

export class Avatar extends Component<Props, State> {


    static defaultProps = {
        size: 40
    }
    render() {
        const {user, style, size, ...attributes} = this.props;

        //TODO: image placeholder
        return (<CachedImage
            source={{uri: user && user.image}}
            style={[{
                height: size,
                width: size,
                borderRadius: size / 2,

            }, style]}
            {...attributes}
        />)
    }
}

export const TRANSPARENT_SPACER = (height: number) => ()=><View style={{height, backgroundColor: 'transparent'}}/>


export function activityFeedProps() {
    return {
        ItemSeparatorComponent: TRANSPARENT_SPACER(20),
        ListHeaderComponent: TRANSPARENT_SPACER(0)(),
        style: {backgroundColor: Colors.greying},
    };
}

//TODO: useless, inline
export function renderTag(tag: string, onPress: () => void, style?:?*) {
    return (<GTouchable onPress={onPress}>
        <Text style={[STYLES.tag, style]}>{tag}</Text>
    </GTouchable>);
}


export const FullScreenLoader = props => (<View style={STYLES.FULL_SCREEN}>
    <Spinner
        isVisible={true}
        size={__DEVICE_WIDTH__ / 10}
        type={"WanderingCubes"}
        color={Colors.grey3}/>
</View>);

export const Http404 = props => (<View style={STYLES.FULL_SCREEN}>
    <Text>{i18n.t('errors.unavailable')}</Text>
</View>);


export const scheduleOpacityAnimation = () => {
    registerLayoutAnimation('opacity');
}


export const registerLayoutAnimation = (type: 'opacity' | 'scaleXY', duration = 400) => {
// Simple fade-in / fade-out animation
    const animType = LayoutAnimation.Properties[type];
    const CustomLayoutLinear = {
        duration,
        create: {type: LayoutAnimation.Types.linear, property: animType},
        update: {type: LayoutAnimation.Types.linear, property: animType},
        delete: {type: LayoutAnimation.Types.linear, property: animType}
    }
    LayoutAnimation.configureNext(CustomLayoutLinear)
};

export function floatingButtonScrollListener() {
    if (typeof this.state.isActionButtonVisible !== 'boolean') throw "bad usage";
    let that = this;
    return function() {
        if (that.floatingButtonScrollListener) return that.floatingButtonScrollListener;
        var _listViewOffset;

        if (__IS_ANDROID__) {
            UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
        }

        return (that.floatingButtonScrollListener = function(event)  {

            // Check if the user is scrolling up or down by confronting the new scroll position with your own one
            const currentOffset = event.nativeEvent.contentOffset.y

            const diff = currentOffset - _listViewOffset;
            if (Math.abs(diff) < 100) return;

            const direction = (currentOffset > 0 && diff > 0) ? 'down' : 'up'



            // If the user is scrolling down (and the action-button is still visible) hide it
            const isActionButtonVisible = direction === 'up'
            if (isActionButtonVisible !== that.state.isActionButtonVisible) {
                registerLayoutAnimation('opacity', 200);
                that.setState({ isActionButtonVisible })
            }
            // Update your scroll position
            _listViewOffset = currentOffset
        })
    }();
}


//TODO: split - create a file dedicated to Lineup rendering
export const LINEUP_SECTIONS = (navigator: RNNNavigator, dispatch: any, userId: Id) => (lineups: Lineup[])=> {
    // const goodshbox = _.head(lineups);
    // let savingCount = _.get(goodshbox, `meta.savingsCount`, null) || 0;
    return lineups.map(lineup => ({
        data: [lineup],
        title:lineup.name,
        subtitle: ` (${_.get(lineup, `meta.savingsCount`, null) || 0})`,
        onPress: () => seeList(navigator, lineup),
        renderItem: ({item}: {item: Lineup}) => (
            <LineupH1
                lineup={item}
                navigator={navigator}
                skipLineupTitle={true}
                onPressEmptyLineup={isCurrentUserId(userId) ? ()=>startAddItem(navigator, item.id): null }
            />
        ),
        renderSectionHeaderChildren:() => renderLineupMenu(navigator, dispatch, lineup)
    }));
};


export function renderSectionHeader({title, subtitle, onPress, renderSectionHeaderChildren}) {
    return (<GTouchable
        deactivated={!onPress}
        onPress={onPress}>
        <View style={{
            backgroundColor: BACKGROUND_COLOR,
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: LINEUP_PADDING,
            paddingTop: 15,
            paddingBottom: 10,
        }}>
            <Text style={{
                fontSize: 20,
                fontFamily: SFP_TEXT_MEDIUM
            }}>
                {title}
                {subtitle && <Text style={{fontSize: 16, color: Colors.greyish}}>{subtitle}</Text>}
            </Text>
            {renderSectionHeaderChildren && renderSectionHeaderChildren()}
        </View>
    </GTouchable>);
}

export function renderEmptyLineup(navigator: RNNNavigator, item: Lineup) {
    return (list: Lineup) => (
        <GTouchable
            onPress={() => startAddItem(navigator, item.id)}
            deactivated={item.pending}
        >
            {
                LineupHorizontal.defaultRenderEmpty(true)
            }
        </GTouchable>
    );
}


export function renderLineupMenu(navigator: RNNNavigator, dispatch: any, lineup: Lineup) {
    return (
        <GTouchable style={{position: "absolute", right: 0, margin: 0}}
                    onPress={() => displayLineupActionMenu(navigator, dispatch, lineup)}>
            <View style={{
                paddingHorizontal: LINEUP_PADDING,
                paddingVertical: 14,
            }}>
                <Image source={require('../img2/moreDotsGrey.png')} resizeMode="contain"/>
            </View>
        </GTouchable>
    );
}