// @flow

import type {Element} from "react"
import React, {Component} from 'react'
import {Image, LayoutAnimation, Platform, StyleSheet, Text, UIManager, View} from 'react-native'
import {Colors} from "./colors"
import GTouchable from "./GTouchable"
import {BACKGROUND_COLOR, createOpenModalLink, LINEUP_PADDING, STYLES, TAB_BAR_PROPS, TAB_BAR_STYLES} from "./UIStyles"
import Spinner from 'react-native-spinkit'
import type {Lineup, RNNNavigator, User} from "../types"
import {ViewStyle} from "../types"
import {CANCELABLE_MODAL2, displayLineupActionMenu, seeList} from "./Nav"
import LineupHorizontal from "./components/LineupHorizontal"
import LineupTitle2 from "./components/LineupTitle2"
import Icon from 'react-native-vector-icons/MaterialIcons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import {GLineupAction, L_ADD_ITEM, L_FOLLOW, L_SHARE, L_UNFOLLOW} from "./lineupRights"
import {TabBar} from "react-native-tab-view"
import {GAvatar} from "./GAvatar"
import {currentGoodshboxId} from "../managers/CurrentUser"
import {SEARCH_CATEGORIES_TYPE} from "../helpers/SearchConstants"
import i18n from "../i18n/i18n"
import Config from "react-native-config"
import HTMLView from "react-native-htmlview/HTMLView"
import {SFP_TEXT_BOLD, SFP_TEXT_MEDIUM} from "./fonts"

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
    style?: ViewStyle
}
type State = {}

export class Avatar extends Component<Props, State> {

    render() {

        let {user, ...others} = this.props
        if (!user) return null

        let person = {...user}
        if (user.provider === 'facebook' && user.uid && this.props.size > 75) {
            person.image += "?type=large"
        }

        return (
            <GAvatar person={person} {...others} />
        )
    }
}

export const TRANSPARENT_SPACER = (height: number = 20) => ()=><View style={{height, backgroundColor: 'transparent'}}/>


export function activityFeedProps() {
    return {
        ItemSeparatorComponent: TRANSPARENT_SPACER(20),
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
        type={"9CubeGrid"}
        color={Colors.grey3}/>
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
export const LINEUP_SECTIONS = (navigator: RNNNavigator, dispatch: any) => (lineups: Lineup[])=> {
    return lineups.map(lineup => ({
        data: [lineup],
        onPress: () => seeList(navigator, lineup),
        renderItem: ({item}: {item: Lineup}) => (
            <GTouchable
                onPress={() => seeList(navigator, lineup)}>
                <LineupHorizontal
                    lineupId={item.id}
                    dataResolver={() => ({lineup: lineup, savings: lineup.savings})}
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
            // backgroundColor: 'red'
        }}
                    onPress={() => displayLineupActionMenu(navigator, dispatch, lineup)}>
            <View style={{
                paddingHorizontal: LINEUP_PADDING,
                paddingVertical: 12,
            }}>
                <Image source={require('../img2/moreDotsGrey.png')} resizeMode="contain"/>
            </View>
        </GTouchable>
    );
}

export function renderLineup(navigator: RNNNavigator, lineup: Lineup) {

    return (
        <GTouchable
            onPress={() => seeList(navigator, lineup)}>

            <LineupHorizontal
                lineup={lineup}
                style={{paddingBottom: 10}}
                renderTitle={(l: Lineup) => <LineupTitle2 dataResolver={id => lineup} lineupId={lineup.id}/>}
            />
        </GTouchable>
    )
}

export const GoodshContext = React.createContext({userOwnResources: true});


export let getAddButton = () => {
    return {
        ...Platform.select({
            ios: {
                rightButtons: [
                    {
                        // icon: require('../img2/add-intro.png'),
                        icon: require('../img2/add_green.png'),
                        disableIconTint: true,
                        id: 'add'
                    }
                ],
            },
            android: {
                fab: {
                    collapsedId: 'add',
                    collapsedIcon: require('./../img2/plus_white.png'),
                    collapsedIconColor: Colors.white,
                    backgroundColor: Colors.green
                }
            },
        }),
    }
}

export let getFollowButton = (lineup: Lineup) => {
    return {
        ...Platform.select({
            ios: {
                rightButtons: [FOLLOW_RIGHT_BUTTON(lineup.id)],
            },
            android: {
                fab: {
                    collapsedId: 'add',
                    collapsedIcon: require('./../img/plus.png'),
                    collapsedIconColor: Colors.white,
                    backgroundColor: Colors.green
                }
            },
        }),
    }
}

export const ADD_ITEM_RIGHT_BUTTON = (id: string) => ({
    icon: require('../img2/add_green.png'),
    disableIconTint: true,
    id: 'add_' + id
})

export const FOLLOW_RIGHT_BUTTON = (id: string) => ({
    title: i18n.t('actions.follow'),
    id: 'follow_' + id,
    buttonColor: Colors.green
})

export const UNFOLLOW_RIGHT_BUTTON = (id: string) => ({
    title: i18n.t('actions.unfollow'),
    id: 'unfollow_' + id
})

export const SHARE_RIGHT_BUTTON = (id: string) => ({
    icon: require('../img2/shareArrow-empty.png'),
    id: 'share_' + id
})

export const RIGHT_BUTTON_SPINNER = {
    component: 'goodsh.NavBarButtonIndicator',
}


let PERSON_ADD
Promise.all([
    Icon.getImageSource('person-add', 24, 'black')
]).then(sources => {
    PERSON_ADD = sources[0]
})

export const CONNECT_RIGHT_BUTTON = (id: string) => ({
    // title: i18n.t('actions.follow'),
    id: 'connect_' + id,
    icon: PERSON_ADD
})

export const DISCONNECT_RIGHT_BUTTON = (id: string) => ({
    title: i18n.t('actions.unfollow'),
    id: 'disconnect_' + id
})

export let getUnfollowButton = (lineup: Lineup) => {
    return Platform.select({
        ios: {
            rightButtons: [UNFOLLOW_RIGHT_BUTTON],
        },
        android: {
            fab: {
                collapsedId: 'add',
                collapsedIcon: require('./../img/plus.png'),
                collapsedIconColor: Colors.white,
                backgroundColor: Colors.green
            }
        },
    })
}

export let getClearButton = function () {
    return Platform.select({
        ios: {rightButtons: []},
        android: {fab: {}}
    })
}

export const RED_SQUARE = (size = 100) => () => <View style={{width: size, height: size, backgroundColor: 'red'}} />


export function getNavButtonForAction(action: GLineupAction, id: string) {
    if (action === L_ADD_ITEM) return ADD_ITEM_RIGHT_BUTTON(id)
    if (action === L_FOLLOW) return FOLLOW_RIGHT_BUTTON(id)
    if (action === L_UNFOLLOW) return UNFOLLOW_RIGHT_BUTTON(id)
    if (action === L_SHARE) return SHARE_RIGHT_BUTTON(id)
    throw action + " not found"

}


export const renderTabBarFactory = (isFocused: any => boolean) => (props: any) => (
    <TabBar
        renderLabel={({route}) => (
            <Text
                style={[{paddingVertical: 14}, TAB_BAR_STYLES.label, {color: isFocused(route) ? Colors.green : Colors.black}]}>
                {_.toUpper(route.title)}
            </Text>
        )}
        {...TAB_BAR_PROPS}
        {...props}
    />
)


export const renderTextAndDots = (text: string, style?: any) => (
    <View style={{flexDirection: 'row', justifyContent:'center', alignItems: 'flex-end'}}>
        <Text style={[{fontSize: 10, marginRight: 2, alignSelf: "center"}, style]}>{text}</Text>
        <Spinner
            isVisible={true}
            size={10}
            type={"ThreeBounce"}
            color={Colors.black}/>
    </View>
)




const {RENDER_EMPTY_RESULT_TEXT} = StyleSheet.create({
    RENDER_EMPTY_RESULT_TEXT: {
        fontSize: 25,
        lineHeight: 35,
        color: Colors.brownishGrey,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
    },
});

export const RENDER_EMPTY_RESULT = () => (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: LINEUP_PADDING}}>
        <Text style={RENDER_EMPTY_RESULT_TEXT}>{i18n.t("lineups.search.empty")}</Text>
    </View>
)
export const RENDER_EMPTY_ME_RESULT = (navigator: RNNNavigator, category: SEARCH_CATEGORIES_TYPE) : () => Element<any> => () => (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', padding: LINEUP_PADDING}}>
        <HTMLView
            onLinkPress={pressed => {
                if (pressed === createAddLink()) {
                    navigator.push({
                        screen: 'goodsh.SearchItems',
                        navigatorButtons: CANCELABLE_MODAL2,
                        title: i18n.t('search_item_screen.title'),
                        animationType: 'fade',
                        animated: false,
                        passProps: {
                            defaultLineupId: currentGoodshboxId(),
                            initialCategory: category,
                            onClickClose: () => navigator.pop({animationType: 'fade', }),
                        }
                    })
                }
            }
            }
            value={`<div>${i18n.t("lineups.search.empty_add", {link: createAddLink()})}</div>`}
            stylesheet={htmlStyles}
        />

    </View>
)

export const RENDER_NO_FRIEND_ERROR : () => Element<any> = ()  => (

    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', padding: LINEUP_PADDING}}>
        <HTMLView
            value={`<div>${i18n.t("explore.friends.empty", {link: createOpenModalLink('goodsh.Community', i18n.t('community.screens.friends'))})}</div>`}
            stylesheet={htmlStyles}
        />
    </View>
)


const htmlStyles = StyleSheet.create({

    div: {
        fontFamily: SFP_TEXT_MEDIUM,
        fontSize: 20,
        lineHeight: 32,
        color: Colors.brownishGrey,
        alignItems: 'center',
    },
    a: {
        fontFamily: SFP_TEXT_BOLD,
        fontSize: 22,
        color: Colors.darkerBlack,
    },
})

export function createAddLink() {
    return `${Config.GOODSH_PROTOCOL_SCHEME}://it/openmodal?screen=goodsh.SearchItems&title=${
        encodeURIComponent(i18n.t('search_item_screen.title'))
        }`
}



export class ListColumnsSelector extends Component<
    {
        onTabPressed?: number => void,
        size: number,
    },
    {
        index: number
    }> {

    state = {index: 0}


    _select = (index: number) => {
        this.setState({index})
        const onTabPressed = this.props.onTabPressed
        onTabPressed && onTabPressed(index)
    }

    render() {
        return (
            <View style={{justifyContent: 'space-around', flexDirection: 'row'}}>
                <GTouchable style={{
                    flex:1,
                    alignItems: 'center',
                    paddingVertical: 4,

                }}  onPress={() => this._select(0)}>
                    <MaterialCommunityIcons name="view-grid" size={this.props.size} color={this.state.index === 0 ? Colors.brownishGrey: Colors.grey3} />
                </GTouchable>
                <GTouchable style={{
                    flex:1,
                    alignItems: 'center',
                    borderLeftWidth: StyleSheet.hairlineWidth,
                    borderColor: Colors.greyish,
                    paddingVertical: 4,
                }} onPress={() => this._select(1)}>
                    <MaterialCommunityIcons name="view-day" size={this.props.size} color={this.state.index === 1 ? Colors.brownishGrey: Colors.grey3} />
                </GTouchable>

            </View>
        )
    }
}

