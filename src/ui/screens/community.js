// @flow

import React from 'react'
import {
    ActivityIndicator,
    FlatList,
    Keyboard,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native'
import type {NavigableProps} from "../../types"
import Screen from "../components/Screen"
import {PagerPan, TabView} from "react-native-tab-view"
import {connect} from "react-redux"
import {renderTabBarFactory} from "../UIComponents"
import ContactList, {toPerson} from "./contact_list"
import FriendsScreen from "./friends"
import {currentUserId} from "../../managers/CurrentUser"
import PersonRowI from "../activity/components/PeopleRow"
import GButton from "../components/GButton"
import type {Contact} from "./contact_list"

type Props = NavigableProps & {
    initialIndex: number,
    searchOptions?: any
}

type State = {
    index: number,
    routes: any,
};

const ROUTES = [
    {key: 'friends', title: "amis"}, {key: 'contacts', title: 'contacts'}
]

@connect()
export default class CommunityScreen extends Screen<Props, State> {

    static navigatorStyle = {
        navBarNoBorder: true,
        topBarElevationShadowEnabled: false
    }

    static defaultProps = {
        initialIndex: 0,
    }


    constructor(props: Props) {
        super(props)
        this.state = {
            routes: ROUTES,
            index: _.toNumber(props.initialIndex)
        }
    }

    render() {
        return <TabView
            style={{flex: 1}}
            navigationState={{...this.state}}
            renderScene={this.renderScene.bind(this)}
            renderTabBar={renderTabBarFactory(this.isFocused.bind(this))}
            renderPager={props => <PagerPan {...props} />}
            swipeEnabled={false}
            onIndexChange={index => {
                this.setState({index})
            }}
        />
    }

    isFocused(route) {
        return this.state.index === ROUTES.indexOf(route)
    }

    renderScene({ route}: *) {
        let ix = ROUTES.indexOf(route)
        let focused = this.state.index === ix
        const visible: boolean = super.isVisible()
        switch (route.key) {
            case 'friends': return (
                <FriendsScreen
                    userId={currentUserId()}
                    navigator={this.props.navigator}
                    // focused={visible && focused}
                />
            )
            case 'contacts': return (
                <ContactList
                    navigator={this.props.navigator}
                    renderItem={({item}) => renderContact(item)}
                    // focused={visible && focused}
                />
            )
        }
    }
}

function renderContact(contact: Contact) {
    return (
        <PersonRowI
            person={toPerson(contact)}
            key={contact.rawContactId}
            style={{
                margin: 16
            }}
            rightComponent={<GButton text={i18n.t('invite')} onPress={()=>{}}/>}
        />
    )
}
