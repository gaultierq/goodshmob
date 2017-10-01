// @flow

import React, {Component} from 'react';
import {Text, TouchableOpacity,
    StyleSheet, View, FlatList, ImageBackground, RefreshControl, ActivityIndicator} from 'react-native';
import {connect} from "react-redux";
import {MainBackground} from "./UIComponents"
import Immutable from 'seamless-immutable';
import * as Api from "../utils/Api";

import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';


class SearchScreen extends Component {

    categ = ["stuff", "place", "movie", "music"];

    state = {
        index: 0,
        routes: this.categ.map((c, i) => ({key: `${i}`, title: c}))
    };

    _handleIndexChange = index => this.setState({ index });

    _renderHeader = props => <TabBar {...props} />;

    _renderScene = SceneMap(
        this.categ.reduce((result, c, i) => Object.assign(result, this.cool(i, c)), {}));


    cool(i, c) {
        return {[i]: () => <SearchCategory category={c}/>};
    }

    render() {
        let search = this.props.search;

        return (
            <TabViewAnimated
                style={styles.container}
                navigationState={this.state}
                renderScene={this._renderScene}
                renderHeader={this._renderHeader}
                onIndexChange={this._handleIndexChange}
            />
        );
    }

    renderCategory(c) {
        return <SearchCategory tabLabel={c} category={c} />;
    }

    goToPage(tabNumber: number) {

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

class SearchCategory extends Component {

    propTypes: {
        category: React.PropTypes.string,
    };

    render() {
        let results = [];

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
    const FETCH_ACTIVITIES = new Api.ApiAction("search/fetch_activities");
    const FETCH_MORE_ACTIVITIES = new Api.ApiAction("search/fetch_more_activities");

    return {FETCH_ACTIVITIES, FETCH_MORE_ACTIVITIES};
})();


const actions = (() => {
    return {
        loadLineups: () => {
            let call = new Api.Call().withMethod('GET')
                .withRoute("activities")
                .withQuery({include: "user,resource,target"});

            return call.disptachForAction(actiontypes.FETCH_ACTIVITIES);
        },

        loadMoreLineups:(nextUrl:string) => {
            let call = new Api.Call.parse(nextUrl).withMethod('GET')
                .withQuery({include: "user,resource,target"});

            return call.disptachForAction(actiontypes.FETCH_MORE_ACTIVITIES);
        }
    };
})();

const reducer = (() => {
    const initialState = Immutable(Api.initialListState());

    return (state = initialState, action = {}) => {
        let desc = {fetchFirst: actiontypes.FETCH_ACTIVITIES, fetchMore: actiontypes.FETCH_MORE_ACTIVITIES};
        return Api.reduceList(state, action, desc);
    }
})();

let screen = connect(mapStateToProps)(SearchScreen);

export {reducer, screen};
