// @flow

import React, {Component} from 'react';
import {
    Text, StyleSheet, View, FlatList, RefreshControl, ActivityIndicator, TextInput
} from 'react-native';
import {connect} from "react-redux";
import {MainBackground} from "./UIComponents"
import Immutable from 'seamless-immutable';
import * as Api from "../utils/Api";
import {combineReducers} from "redux";
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';


const SEARCH_CATEGORIES = [ "consumer_goods", "places_and_people", "musics", "movies"]

class SearchScreen extends Component {

    state = {
        index: 0,
        input: '',
        routes: SEARCH_CATEGORIES.map((c, i) => ({key: `${i}`, title: c})),
    };

    _handleIndexChange = index => {
        this.setState({ index }, () => this.performSearch());
    };

    _renderHeader = props => <TabBar {...props} />;

    _renderScene = SceneMap(
        SEARCH_CATEGORIES.reduce((result, c, i) => Object.assign(result, this.renderCategory(i, c)), {}));


    renderCategory(i, c) {
        return {[i]: () => (
            <SearchCategory category={c}/>)};
    }

    render() {
        return (
            <View style={{width:"100%", height: "100%"}}>
                <TextInput
                    editable = {true}
                    maxLength = {40}
                    onChangeText={this.onSearchInputChange.bind(this)}
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
        let cat = SEARCH_CATEGORIES[this.state.index];
        let data = this.props.search[cat];
        if (data && data.token === this.state.input) {
            console.log("skipping request");
        }
        else {
            this.props.dispatch(actions.searchFor(this.state.input, cat));
        }
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
});

@connect((state, ownProps) => ({
        search: state.search,
        request: state.request,
        data: state.data,
    })
)
class SearchCategory extends Component {

    propTypes: {
        category: React.PropTypes.string,
    };

    render() {
        let search = this.props.search[this.props.category];
        let results = search.list ;

        return (
            <View>
                <Text>Ceci est un header</Text>
                <FlatList
                    data={results}
                    renderItem={this.renderItem.bind(this)}
                    keyExtractor={(item, index) => item.id}
                />
            </View>
        );
    }

    renderItem(it) {
        return (<Text>{JSON.stringify(it)}</Text>);
    }
}


const actiontypes = (() => {
    const SEARCH = new Api.ApiAction("search");
    const SEARCH_MORE = new Api.ApiAction("search_more");

    return {SEARCH, SEARCH_MORE};
})();


const actions = (() => {
    return {
        searchFor: (token, category) => {

            let call = new Api.Call()
                .withMethod('GET')
                .withRoute(`search/${category}`)
                .withQuery({'search[term]': token});

            return call.disptachForAction(actiontypes.SEARCH, {meta: {category, token}});
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
