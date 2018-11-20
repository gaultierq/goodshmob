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
import SearchUserPage from "./search/SearchUserPage"
import SearchSavingAndLineupPage from "./search/SearchSavingAndLineupPage"

type Props = NavigableProps & {
    initialIndex: number,
    searchOptions?: any
}

type State = {
    index: number,
    routes: any,
};

const ROUTES = ["savings", "users"].map(t=> ({key: t, title: i18n.t("search_item_screen.tabs." + t)}))

@connect()
export default class SearchSavingsOrUsers extends Screen<Props, State> {

    static navigatorStyle = {
        navBarNoBorder: true,
        topBarElevationShadowEnabled: false
    }

    static defaultProps = {
        initialIndex: 0,
    }

    propsToState(props: Props) {
        return {
            index: props.initialIndex,
        }
    }

    constructor(props: Props) {
        super(props)
        this.state = { routes: ROUTES, ...this.propsToState(props)}
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
        // let focused = this.state.index === ix
        // const visible: boolean = super.isVisible()
        switch (route.key) {
            case 'savings': return (
                <SearchSavingAndLineupPage
                    navigator={this.props.navigator}
                    scope={"all"}
                />
            )
            case 'users': return (
                <SearchUserPage navigator={this.props.navigator}/>
            )
        }
    }
}
