import React, {Component} from 'react';
import {StyleSheet, View, Button, Text, ScrollView, ActivityIndicator, FlatList, RefreshControl} from 'react-native';
import  * as actions from './actions'
import {connect} from "react-redux";
import {AsyncStorage} from "react-native";
import LineupCell from "./components/LineupCell";

class LineupScreen extends Component {

    keyExtractor = (item, index) => item.id;

    constructor(){
        super();
    }

    componentDidMount() {
        this.load();
    }

    load() {
        this.props.dispatch(actions.loadLineup());
    }

    loadMore() {
        this.props.dispatch(actions.loadMoreLineup());
    }

    render() {
        let lineup = this.props.lineup;
        let lineups = lineup.ids.map((id) => {
            let lin = lineup.all[id];
            if (!lin) throw new Error("no lineup found for id="+id);
            return lin;
        });
        return (
            <ScrollView>
                <View style={styles.container}>
                    <FlatList
                        data={lineups}
                        renderItem={this.renderItem.bind(this)}
                        keyExtractor={this.keyExtractor}
                        refreshControl={
                            <RefreshControl
                                refreshing={!!lineup.load_lineup.loaded && lineup.load_lineup.requesting}
                                onRefresh={this.onRefresh.bind(this)}
                            />
                        }
                        onEndReached={ this.onEndReached.bind(this) }
                        onEndReachedThreshold={0}
                        ListFooterComponent={(lineup.load_more_lineup.requesting) &&

                        <ActivityIndicator
                            animating = {lineup.load_more_lineup.requesting}
                            size = "small"
                        />}
                    />
                </View>
            </ScrollView>
        );
    }

    renderItem(item) {
        let it = item.item;
        return <Text>{JSON.stringify(it)}</Text>
    }


    renderItem(item) {
        let it = item.item;
        return <LineupCell
            onPressItem={() => this.navToLineupDetail(it)}
            lineupId={it.id}
        />
    }

    navToLineupDetail(it) {
    }


    onRefresh() {
        this.loadFirst();
    }

    onEndReached() {
        if (this.props.lineup.hasMore) {
            this.loadMore();
        }
        else {
            console.info("end of feed")
        }

    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});

const mapStateToProps = (state, ownProps) => ({
    lineup: state.lineup
});

export default connect(mapStateToProps)(LineupScreen);