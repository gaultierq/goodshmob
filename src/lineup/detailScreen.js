import React, {Component} from 'react';
import {StyleSheet, View, Button, Text, ScrollView, ActivityIndicator, FlatList} from 'react-native';
import  * as actions from './actions'
import {connect} from "react-redux";
import {AsyncStorage} from "react-native";
import Model from "../models/Saving";

class LineupDetailScreen extends Component {

    constructor(){
        super();
        this.state = {};
    }

    componentDidMount() {
        this.load();
    }

    load() {
        this.props.dispatch(actions.loadLineups(this.props.activityId, this.props.activityType));
    }

    render() {
        let lineup = this.props.lineup.all[this.props.lineupId];

        let showLoader = !lineup && this.props.lineup.fetch.requesting;

        return (
            <ScrollView>
                <View style={styles.container}>
                    <ActivityIndicator
                        animating = {showLoader}
                        size = "small"
                    />
                    { lineup && this.renderList(lineup)}

                </View>
            </ScrollView>
        );
    }

    renderList(data) {
        return  <FlatList
            data={lineups}
            renderItem={this.renderSaving.bind(this)}
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
    }

    renderSaving(item) {
        let saving: Model.Saving = item.item;
        return <TouchableHighlight onPress={() => this.seeSavingDetails(saving)}>
            <View>
                <LineupCell
                    onPressItem={() => this.navToLineupDetail(saving)}
                    lineupId={saving.id}
                />
            </View>
        </TouchableHighlight>
    }

    seeSavingDetails(saving) {

    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});

const mapStateToProps = (state, ownProps) => ({
    lineup: state.lineup,
});

export default connect(mapStateToProps)(LineupDetailScreen);