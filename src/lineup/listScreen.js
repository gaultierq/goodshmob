import React, {Component} from 'react';
import {StyleSheet, View, Text, ScrollView, ActivityIndicator, FlatList, RefreshControl, TouchableHighlight} from 'react-native';
import  * as actions from './actions'
import {connect} from "react-redux";
import {AsyncStorage} from "react-native";
import LineupCell from "./components/LineupCell";
import {MainBackground} from "../screens/UIComponents";

class LineupListScreen extends Component {

    keyExtractor = (item, index) => item.id;

    constructor(){
        super();
    }

    componentDidMount() {
        this.load();
    }

    load() {
        this.props.dispatch(actions.loadLineups());
    }

    loadMore() {
        this.props.dispatch(actions.loadMoreLineups());
    }

    render() {
        let lineup = this.props.lineup;
        let lineups = lineup.ids.map((id) => {
            let lin = lineup.all[id];
            if (!lin) throw new Error("no lineup found for id="+id);
            return lin;
        });
        return (
            <MainBackground>
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
            </MainBackground>
        );
    }


    renderItem(item) {
        let it = item.item;
        return <TouchableHighlight onPress={() => this.seeLineupDetails(it)}>
            <View>
                <LineupCell
                    onPressItem={() => this.navToLineupDetail(it)}
                    lineupId={it.id}
                />
            </View>
        </TouchableHighlight>
    }

    seeLineupDetails(lineup) {
        console.info("onPressItem: " + JSON.stringify(lineup));
        this.props.navigator.push({
            screen: 'goodsh.LineupDetailScreen', // unique ID registered with Navigation.registerScreen
            title: "Lineup Details", // navigation bar title of the pushed screen (optional)
            titleImage: require('../img/screen_title_home.png'), // iOS only. navigation bar title image instead of the title text of the pushed screen (optional)
            passProps: {lineupId: lineup.id}, // Object that will be passed as props to the pushed screen (optional)
            animated: true, // does the push have transition animation or does it happen immediately (optional)
            animationType: 'slide-up', // 'fade' (for both) / 'slide-horizontal' (for android) does the push have different transition animation (optional)
            backButtonTitle: undefined, // override the back button title (optional)
            backButtonHidden: false, // hide the back button altogether (optional)
            navigatorStyle: {}, // override the navigator style for the pushed screen (optional)
            navigatorButtons: {} // override the nav buttons for the pushed screen (optional)
        });
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

export default connect(mapStateToProps)(LineupListScreen);