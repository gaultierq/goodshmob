// @flow

import React, {Component} from 'react';
import {Image, LayoutAnimation, StyleSheet, Text, UIManager, View} from 'react-native';
import {Colors} from "./colors";
import User from "react-native-firebase/lib/modules/auth/User";
import {CachedImage} from "react-native-img-cache";
import GTouchable from "./GTouchable";
import {BACKGROUND_COLOR, LINEUP_PADDING, STYLES} from "./UIStyles";
import Spinner from 'react-native-spinkit';
import type {Id, Lineup, RNNNavigator} from "../types";
import {displayLineupActionMenu, seeList, startAddItem} from "./Nav";
import LineupHorizontal from "./components/LineupHorizontal";
import LineupTitle2 from "./components/LineupTitle2";

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


export const RENDER_SECTION_HEADER = (navigator: RNNNavigator, dispatch: Dispatch, lineup: Lineup) => <GTouchable
    onPress={() => seeList(navigator, lineup)}>

    <LineupTitle2
        lineupId={lineup.id}
        dataResolver={id => lineup}
        style={{
            backgroundColor: BACKGROUND_COLOR,
            paddingLeft: LINEUP_PADDING,
        }}
    >
        {renderLineupMenu(navigator, dispatch, lineup)}
    </LineupTitle2>
</GTouchable>;

//TODO: split - create a file dedicated to Lineup rendering
export const LINEUP_SECTIONS = (navigator: RNNNavigator, dispatch: any, userId: Id) => (lineups: Lineup[])=> {
    // const goodshbox = _.head(lineups);
    // let savingCount = _.get(goodshbox, `meta.savingsCount`, null) || 0;
    return lineups.map(lineup => ({
        data: [lineup],
        title: lineup.name,
        subtitle: ` (${_.get(lineup, `meta.savingsCount`, 0)})`,
        onPress: () => seeList(navigator, lineup),
        renderItem: ({item}: {item: Lineup}) => (
            <GTouchable
                onPress={() => seeList(navigator, lineup)}>
                <LineupHorizontal
                    lineupId={item.id}
                    dataResolver={() => ({lineup: lineup, savings: lineup.savings})}
                    style={{paddingBottom: 10}}
                    skipLineupTitle={true}
                />
            </GTouchable>
        ),
        renderSectionHeader: () => RENDER_SECTION_HEADER(navigator, dispatch, lineup),
    }));
};


export function renderLineupMenu(navigator: RNNNavigator, dispatch: any, lineup: Lineup) {
    return (
        <GTouchable style={{
            position: "absolute",
            right: 0,
            margin: 0,
            // backgroundColor: 'red'
        }}
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

export function renderLineupFromOtherPeople(navigator: RNNNavigator, lineup: Lineup) {

    return (<GTouchable
        onPress={() => seeList(navigator, lineup)}>

        <LineupHorizontal
            lineupId={lineup.id}
            dataResolver={() => ({lineup: lineup, savings: lineup.savings})}
            style={{paddingBottom: 10}}
            renderTitle={(lineup: Lineup) => <LineupTitle2 dataResolver={id => lineup} lineupId={lineup.id}/>}
        />
    </GTouchable>);
}

export const GoodshContext = React.createContext({userOwnResources: true});