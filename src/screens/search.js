// @flow

import React, {Component} from 'react';
import {
    StyleSheet, View, FlatList, ActivityIndicator} from 'react-native';
import {connect} from "react-redux";
import Immutable from 'seamless-immutable';
import * as Api from "../utils/Api";
import {combineReducers} from "redux";
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import ItemCell from "./components/ItemCell";
import {buildNonNullData} from "../utils/DataUtils";
import i18n from '../i18n/i18n'
import { SearchBar } from 'react-native-elements'
import * as UIStyles from "../screens/UIStyles"


type SearchCategory = "consumer_goods" | "places_and_people" | "musics" | "movies";
type SearchToken = string;

const SEARCH_CATEGORIES : SearchCategory = [ "consumer_goods", "places_and_people", "musics", "movies"]

type SearchState = {
    index: number,
    input: SearchToken,
    routes: Array<string>,
    loaded: boolean,
    pendingSearch: number,
    isSearching: { [key: SearchCategory]: Array<SearchToken> }
}

class SearchScreen extends Component {



    static navigatorButtons = {
        // leftButtons: [
        //     {
        //         icon: require('../img/drawer_community.png'), // for icon button, provide the local image asset name
        //         id: 'community' // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
        //     }
        // ],
        rightButtons: [
            {
                //icon: require('../img/drawer_line_up.png'), // for icon button, provide the local image asset name
                id: 'cancel_search', // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
                title: "Cancel"
            }
        ],
    };


    constructor(props) {
        super(props);
        props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    onNavigatorEvent(event) { // this is the onPress handler for the two buttons together
        if (event.type === 'NavBarButtonPress') { // this is the event type for button presses
            if (event.id === 'cancel_search') { // this is the same id field from the static navigatorButtons definition
                this.props.onCancel();
            }
        }
    }

    props: {
        onItemSelected: Function;
        search: Function,
        onCancel: Function
    };

    state : SearchState = {
        index: 0,
        input: '', //TODO : rename it to token
        routes: SEARCH_CATEGORIES.map((c, i) => ({key: `${i}`, title: SearchScreen.getTitle(c)})),
        loaded: false,
        isSearching: {},
    };

    _handleIndexChange = index => {
        this.setState({ index }, () => this.performSearch(true));
    };

    _renderHeader = props => <TabBar {...props}
                                     indicatorStyle={styles.indicator}
                                     style={styles.tabbar}
                                     tabStyle={styles.tab}
                                     labelStyle={styles.label}/>;

    renderScene = SceneMap(
        SEARCH_CATEGORIES.reduce((result, c, i) => Object.assign(result, this.renderCategory(i, c)), {}));

    _renderScene = ({ route }) => { return this.renderSearchPage(SEARCH_CATEGORIES[route.key])}


    static getTitle(cat: SearchCategory) {
        return i18n.t('search_item_screen.tabs.' + cat);
    }

    getPlaceholder() {
        let cat = this.getCategory();
        return i18n.t('search_item_screen.placeholder.' + cat);
    }

    renderCategory(i, c) {
        let xml = this.renderSearchPage(c);
        return {[i]: () => (xml)};
    }

    renderSearchPage(c: SearchCategory) {
        let xml = <SearchPage
            category={c}
            isLoading={() => this.isSearching(c)}
            onItemSelected={this.props.onItemSelected}
        />;
        return xml;
    }

    isSearching(category: SearchCategory) {
        return !!this.state.isSearching[category];
    }

    render() {
        return (
            <View style={{width:"100%", height: "100%"}}>
                <SearchBar
                    lightTheme
                    onChangeText={this.onSearchInputChange.bind(this)}
                    placeholder={this.getPlaceholder()}
                    clearIcon={{color: '#86939e'}}
                    containerStyle={styles.searchContainer}
                    inputStyle={styles.searchInput}
                />
                <TabViewAnimated
                    style={styles.container}
                    navigationState={this.state}
                    renderScene={this._renderScene}
                    renderHeader={this._renderHeader}
                    onIndexChange={this._handleIndexChange}
                />
            </View>

        );
    }

    onSearchInputChange(input) {
        this.setState({input: input}, () => this.performSearch());
    }

    performSearch(hard: false) {
        let when = -1;
        let cat : SearchCategory = this.getCategory();
        let data = this.props.search[cat];
        let input = this.state.input;
        if (data && data.token === input) {
            console.log("skipping request");
        }
        else {
            when = hard ? 0 : 400;
        }

        if (when >= 0) {
            let timeoutId = setTimeout(() => {

                let tokenBeingSearched = this.state.isSearching[cat] || [];
                tokenBeingSearched = tokenBeingSearched.slice();

                if (tokenBeingSearched.indexOf(input) > -1) throw new Error(`"${input}" is already being searched for`);
                tokenBeingSearched.push(input);

                this.setState({isSearching: {[cat]: tokenBeingSearched}});

                this.props.dispatch(actions.searchFor(this.state.input, cat))
                    .then(()=> {
                        let tokenBeingSearched = this.state.isSearching[cat];
                        tokenBeingSearched = tokenBeingSearched.slice();
                        let indexOf = tokenBeingSearched.indexOf(input);
                        if (indexOf === -1) throw new Error(`"${input}" should be being searched for`);

                        tokenBeingSearched.splice(indexOf, 1);
                        this.setState({isSearching: {[cat]: tokenBeingSearched}});
                    });
            }, when);
            clearTimeout(this.state.pendingSearch);
            this.setState({pendingSearch: timeoutId});
        }
    }

    getCategory() : SearchCategory {
        return SEARCH_CATEGORIES[this.state.index];
    }
}

const mapStateToProps = (state, ownProps) => ({
    search: state.search,
    request: state.request,
    data: state.data,
    activity: state.activity
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchContainer: {
        backgroundColor: 'white',
    },
    searchInput: {
        backgroundColor: 'white',
    },
    tabbar: {
        backgroundColor: 'white',
    },
    indicator: {
        backgroundColor: UIStyles.Colors.green,
    },
    activityIndicator: {
        position: "absolute",
        top: 30, left: 0, right: 0, justifyContent: 'center',
        zIndex: 3000
    },
    tab: {
        opacity: 1,
        width: 90,
    },
    label: {
        color: '#000000',
    },
});

@connect((state, ownProps) => ({
        search: state.search,
        request: state.request,
        data: state.data,
    })
)
class SearchPage extends Component {

    propTypes: {
        category: React.PropTypes.string,
        isLoading: React.PropTypes.func;
        onItemSelected: React.PropTypes.func;
    };

    render() {
        let search = this.props.search[this.props.category];
        let results = search.list ;

        let isLoading = !!this.props.isLoading();

        return (
            <View>
                {isLoading && <ActivityIndicator
                    animating = {isLoading}
                    size = "large"
                    style={styles.activityIndicator}
                />}
                <FlatList
                    data={results}
                    renderItem={this.renderItem.bind(this)}
                    keyExtractor={(item, index) => item.id}
                />
            </View>
        );
    }

    renderItem(item) {
        let it = this.getItem(item.item);
        if (!it) throw new Error(`no item${JSON.stringify(item.item)}`);

        return <ItemCell
            onPressItem={() => this.props.onItemSelected(it)}
            item={it}
            navigator={this.props.navigator}
        />
    }

    getItem(item) {
        return buildNonNullData(this.props.data, item.type, item.id);
    }
}


const actiontypes = (() => {
    const SEARCH = new Api.ApiAction("search");
    const SEARCH_MORE = new Api.ApiAction("search_more");

    return {SEARCH, SEARCH_MORE};
})();


let composeSearchActionName = (category, token) => `search/${category}?${token}`;

const actions = (() => {
    return {
        searchFor: (token, category) => {

            let call = new Api.Call()
                .withMethod('GET')
                .withRoute(`search/${category}`)
                .withQuery({'search[term]': token});

            return call.disptachForAction2(actiontypes.SEARCH, {
                actionName: composeSearchActionName(category, token),
                meta: {category, token}});
        },
    };
})();

const reducerCreator = (reducerCategory) => (() => {
    const initialState = Immutable({...Api.initialListState(), token: ''});

    return (state = initialState, action = {}) => {

        switch (action.type) {
            case actiontypes.SEARCH.success():
            case actiontypes.SEARCH_MORE.success():
                let {category, token} = action.meta;
                if (!category || !token) throw new Error("we expect token and category");

                if (category !== reducerCategory) return state;

                if (state.token !== action.token) {
                    state = initialState.merge({token});
                }
                state = Api.reduceList(
                    state,
                    action,
                    {
                        fetchFirst: actiontypes.SEARCH,
                        fetchMore: actiontypes.SEARCH_MORE
                    }
                );
                return state;
        }

        return state;
    }
})();

let screen = connect(mapStateToProps)(SearchScreen);

let allReducers = SEARCH_CATEGORIES.reduce((acc, cu) => {
    acc[cu] = reducerCreator(cu);
    return acc
}, {});

let reducer = combineReducers(allReducers);

export {reducer, screen};
