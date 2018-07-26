// @flow

import type {Node} from 'react'
import React from 'react'
import {
    ActivityIndicator,
    Alert,
    Animated,
    Easing,
    FlatList,
    Linking,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import {SEARCH_CATEGORIES_TYPE} from "../../helpers/SearchHelper"
import Screen from "../components/Screen"
import type {Item, Lineup, RNNNavigator} from "../../types"
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view"
import {findBestSearchCategory} from "../../helpers/Classifier"
import {TAB_BAR_PROPS} from "../UIStyles"
import {TabView} from "react-native-tab-view"
import TabBar from "react-native-tab-view/src/TabBar"
import PagerPan from "react-native-tab-view/src/PagerPan"
import SearchGeneric from "./search/SearchGeneric"
import SearchPlaces from "./search/SearchPlaces"
import {renderTabBarFactory} from "../UIComponents"


type Props = {
    onItemSelected?: (item: Item, navigator: RNNNavigator) => void,
    defaultLineup?: Lineup
};

const ROUTES = SEARCH_CATEGORIES_TYPE.map(t=> ({key: t, title: i18n.t("search_item_screen.tabs." + t)}))

type State = {
    index: number,
    routes: any
};

export default class SearchItems extends Screen<Props, State> {

    static navigatorStyle = {
        navBarNoBorder: true,
        topBarElevationShadowEnabled: false
    };

    constructor(props: Props) {
        super(props)
        this.state = {
            routes: ROUTES,
            index: this.findBestIndex(props)
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
        switch (route.key) {
            case 'places': return <SearchPlaces navigator={this.props.navigator}/>
            default: return <SearchGeneric navigator={this.props.navigator} category={route.key} placeholder={"# " + route.key}/>
        }
    }

    findBestIndex(props: Props): number {
        let categories = SEARCH_CATEGORIES_TYPE.map( type => ({
                tabName: i18n.t("search_item_screen.tabs." + type),
                description: i18n.t("search_item_screen.placeholder." + type),
            })
        )
        if (this.props.defaultLineup) {
            let index
            // $FlowFixMe
            let best = findBestSearchCategory(props.defaultLineup, categories)
            if (best) {
                index = categories.indexOf(best)
                if (index >= 0) return index
            }
        }
        return 0
    }
}


