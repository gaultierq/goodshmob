import React, {Component} from 'react';
import {StyleSheet, View, Button, Text, ScrollView, ActivityIndicator, FlatList, RefreshControl} from 'react-native';
import  * as actions from './actions'
import {connect} from "react-redux";
import {AsyncStorage} from "react-native";
import FriendCell from "./components/FriendCell";
import {MainBackground} from "../screens/UIComponents";

class CommunityScreen extends Component {

    keyExtractor = (item, index) => item.id;

    constructor(){
        super();
    }

    componentDidMount() {
        this.load();
    }

    load() {
        let cui = this.props.app.currentUser.id;
        this.props.dispatch(actions.loadFriend(cui));
    }

    loadMore() {
        this.props.dispatch(actions.loadMoreFriend());
    }

    render() {
        let friend = this.props.friend;
        let friends = friend.ids.map((id) => {
            let lin = friend.all[id];
            if (!lin) throw new Error("no friend found for id="+id);
            return lin;
        });
        return (
            <MainBackground>
            <ScrollView>
                <View style={styles.container}>
                    <FlatList
                        data={friends}
                        renderItem={this.renderItem.bind(this)}
                        keyExtractor={this.keyExtractor}
                        refreshControl={
                            <RefreshControl
                                refreshing={!!friend.load_friend.loaded && friend.load_friend.requesting}
                                onRefresh={this.onRefresh.bind(this)}
                            />
                        }
                        onEndReached={ this.onEndReached.bind(this) }
                        onEndReachedThreshold={0}
                        ListFooterComponent={(friend.load_more_friend.requesting) &&

                        <ActivityIndicator
                            animating = {friend.load_more_friend.requesting}
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
        return <Text>{JSON.stringify(it)}</Text>
    }


    renderItem(item) {
        let it = item.item;
        return <FriendCell
            onPressItem={() => this.navToFriendDetail(it)}
            friendId={it.id}
        />
    }

    navToFriendDetail(it) {
    }


    onRefresh() {
        this.loadFirst();
    }

    onEndReached() {
        if (this.props.friend.hasMore) {
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
    friend: state.friend,
    app: state.app,
});

export default connect(mapStateToProps)(CommunityScreen);