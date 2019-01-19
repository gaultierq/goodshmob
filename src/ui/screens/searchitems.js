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
import type {SearchItemCategoryType} from "../../helpers/SearchConstants"
import {SEARCH_CATEGORIES_TYPE} from "../../helpers/SearchConstants"
import Screen from "../components/Screen"
import type {Id, Item, Lineup, RNNNavigator} from "../../types"
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view"
import {findBestSearchCategory} from "../../helpers/Classifier"
import {TabView} from "react-native-tab-view"
import PagerPan from "react-native-tab-view/src/PagerPan"
import SearchGeneric from "./search/SearchGeneric"
import SearchPlaces from "./search/SearchPlaces"
import {renderTabBarFactory} from "../UIComponents"
import {createOpenModalLink} from "../../managers/Links"


type Props = {
    onItemSelected?: (item: Item, navigator: RNNNavigator) => void,
    defaultLineup?: Lineup,
    defaultLineupId?: Id,
    initialCategory?: SearchItemCategoryType,
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
            case 'places': return (
                <SearchPlaces focused={focused} navigator={this.props.navigator} onItemSelected={this._onItemSelected}/>
            )
            default: return (
                <SearchGeneric
                    focused={focused}
                    navigator={this.props.navigator}
                    category={route.key}
                    placeholder={i18n.t('search_item_screen.searchbar_placeholder.' + route.key)}
                    onItemSelected={this._onItemSelected}
                />
            )
        }
    }

    _onItemSelected= (item: Item) => {

        this.props.navigator.showModal({
            screen: 'goodsh.CreateItemScreen',
            title: i18n.t("add_item_screen.title"),
            animationType: 'none',
            passProps: {
                item,
                onCancel: () => {
                    setTimeout(this.props.navigator.dismissModal)
                },
                onAdded: () => {
                    setTimeout(() => {
                        this.props.navigator.dismissModal()
                    }, 1000)
                },
                defaultLineupId: this.props.defaultLineupId
            },
        });
    }

    findBestIndex(props: Props): number {
        if (props.initialCategory) {
            let ix =  SEARCH_CATEGORIES_TYPE.indexOf(props.initialCategory)
            if (ix >= 0) return ix
        }
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
    static createAddLink(defaultLineupId?: Id) {
        return createOpenModalLink('goodsh.SearchItems', i18n.t('search_item_screen.title'), {defaultLineupId})
    }
}



export function onNewItemSelected(item: Item, navigator: RNNNavigator, selectedLineupId: Id) {
    let cancel = navigator.dismissAllModals

    navigator.showModal({
        screen: 'goodsh.CreateItemScreen',
        title: i18n.t("add_item_screen.title"),
        animationType: 'none',
        passProps: {
            item,
            onCancel: cancel,
            onAdded: cancel,
            defaultLineupId: selectedLineupId
        },
    });
}
