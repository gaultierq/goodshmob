// @flow

import React, {Component} from 'react';
import {
    Text, StyleSheet, View, FlatList, RefreshControl, ActivityIndicator, TextInput
} from 'react-native';
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

const SEARCH_CATEGORIES = [ "consumer_goods", "places_and_people", "musics", "movies"]

class SearchScreen extends Component {

    state = {
        index: 0,
        input: '', //TODO : rename it to token
        routes: SEARCH_CATEGORIES.map((c, i) => ({key: `${i}`, title: this.getTitle(c)})),
        loaded: false,
    };

    _handleIndexChange = index => {
        this.setState({ index }, () => this.performSearch());
    };

    _renderHeader = props => <TabBar {...props}
                                     indicatorStyle={styles.indicator}
                                     style={styles.tabbar}
                                     tabStyle={styles.tab}
                                     labelStyle={styles.label}

    />;

    _renderScene = SceneMap(
        SEARCH_CATEGORIES.reduce((result, c, i) => Object.assign(result, this.renderCategory(i, c)), {}));



    getTitle(cat: string) {
        return i18n.t('search_item_screen.tabs.' + cat);
    }

    getPlaceholder() {
        let cat = this.getCategory();
        return i18n.t('search_item_screen.placeholder.' + cat);
    }

    renderCategory(i, c) {
        return {[i]: () => (
            <SearchPage
                category={c}
                isLoading={()=> this.isLoading(c)}
            />)};
    }

    isLoading(category: string) {
        return !!this.props.request.isLoading[composeSearchActionName(category, this.state.input)];
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

    performSearch() {
        let cat = this.getCategory();
        let data = this.props.search[cat];
        if (data && data.token === this.state.input) {
            console.log("skipping request");
        }
        else {
            this.props.dispatch(actions.searchFor(this.state.input, cat));
        }
    }

    getCategory() {
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
            onPressItem={() => this.navToSavingDetail(it)}
            item={it}
            navigator={this.props.navigator}
        />
        //return <Text>{"image="+it.image + '\n\n\n'}</Text>
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

            return call.disptachForAction(actiontypes.SEARCH, {
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
