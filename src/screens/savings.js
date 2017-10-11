// @flow

import React, {Component} from 'react';
import {StyleSheet, View, ScrollView, ActivityIndicator, FlatList} from 'react-native';
import {connect} from "react-redux";
import {MainBackground} from "./UIComponents";
import build from './redux-object'
import Immutable from 'seamless-immutable';
import * as Api from "../utils/Api";
import ItemCell from "./components/ItemCell";
import Feed from "./components/feed";



// SavingsScreen.propTypes = {
//     lineupId: PropTypes.string.required
// };

class SavingsScreen extends Component {

    props : {
        lineupId: string
    };

    render() {
        let lineup = this.getLineup();
        let savingList = lineup.savings.map((s)=>s.resource);

        return (
            <MainBackground>
                <ScrollView>
                    <View style={styles.container}>

                        <Feed
                            data={savingList}
                            renderItem={this.renderItem.bind(this)}
                            fetchAction={()=>actions.loadSavings(this.props.lineupId)}
                            fetchMoreAction={actions.loadMoreSavings}
                        />

                    </View>
                </ScrollView>
            </MainBackground>
        );
    }

    getLineup() {
        return build(this.props.data, "lists", this.props.lineupId);
    }

    renderItem(item) {
        let it = item.item;
        return <ItemCell
            onPressItem={() => this.navToSavingDetail(it)}
            item={it}
            navigator={this.props.navigator}
        />
    }

    navToSavingDetail(it) {
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});

const mapStateToProps = (state, ownProps) => ({
    savings: state.savings,
    data: state.data,
    app: state.app,
    request: state.request
});


const actionTypes = (() => {

    const LOAD_SAVINGS = new Api.ApiAction("load_savings");
    const LOAD_MORE_SAVINGS = new Api.ApiAction("load_more_savings");

    return {LOAD_SAVINGS, LOAD_MORE_SAVINGS};
})();


const actions = (() => {
    return {

        loadSavings: (lineupId: string) => {
            let call = new Api.Call().withMethod('GET')
                .withRoute(`lists/${lineupId}/savings`)
                .withQuery({
                    page: 1,
                    per_page: 10,
                    include: "*.*"
                });

            return call.disptachForAction(actionTypes.LOAD_SAVINGS);
        },
        loadMoreSavings: (nextUrl:string) => {
            let call = new Api.Call.parse(nextUrl).withMethod('GET')
                .withQuery({
                    page: 1,
                    per_page: 10,
                    include: "creator"
                });

            return call.disptachForAction(actionTypes.LOAD_MORE_SAVINGS);
        }
    };
})();

const reducer = (() => {
    const initialState = Immutable(Api.initialListState());

    return (state = initialState, action = {}) => {
        let desc = {fetchFirst: actionTypes.LOAD_SAVINGS, fetchMore: actionTypes.LOAD_MORE_SAVINGS};
        return Api.reduceList(state, action, desc);
    }
})();

let screen = connect(mapStateToProps)(SavingsScreen);

export {reducer, screen};
