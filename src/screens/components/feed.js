// @flow

import React, {Component} from 'react';
import {FlatList, RefreshControl, ActivityIndicator, ReactElement} from 'react-native';
import {connect} from "react-redux";


@connect()
export default class Feed<T> extends Component  {

    props: {
        data: Array<T>,
        renderItem: Function,
        fetchAction: Function,
        fetchMoreAction: Function,
        ListHeaderComponent?: ReactElement
    };


    state:  {
        isFetchingFirst: boolean,
        isFetchingMore: boolean,
        isPulling: boolean
    };

    keyExtractor = (item, index) => item.id;

    constructor(){
        super();
        this.state =  {isFetchingFirst: false, isFetchingMore: false, isPulling: false};
    }

    componentDidMount() {
        this.fetchFirst();
    }

    fetchFirst() {
        return new Promise((resolve) => {
            if (this.state.isFetchingFirst) {
                resolve();
            }
            else {
                this.setState({isFetchingFirst: true});
                this.props.dispatch(this.props.fetchAction()).then(()=>this.setState({isFetchingFirst: false})).then(()=>resolve());
            }
        });


    }

    fetchMore() {
        //TODO
    }

    onRefresh() {
        if (this.state.isPulling) return;
        this.setState({isPulling: true});
        this.fetchFirst().then(()=>this.setState({isPulling: false}));
    }

    render() {
        return (
            <FlatList
                data={this.props.data}
                renderItem={this.props.renderItem}
                keyExtractor={this.keyExtractor}
                refreshControl={this.renderRefreshControl()}
                onEndReached={ this.onEndReached.bind(this) }
                onEndReachedThreshold={0}
                ListFooterComponent={this.renderFetchMoreLoader()}
                ListHeaderComponent={this.props.ListHeaderComponent}
            />
        );
    }

    renderRefreshControl() {
        let displayLoader = (this.state.isFetchingFirst && !this.props.data) || this.state.isPulling;
        return (<RefreshControl
            refreshing={displayLoader}
            onRefresh={this.onRefresh.bind(this)}
        />);
    }

    renderFetchMoreLoader() {
        return (this.state.isFetchingMore &&
            <ActivityIndicator
                animating={this.state.isFetchingMore}
                size = "small"
            />)
    }



    onEndReached() {
        // if (this.props.network.hasMore) {
        //     this.loadMore();
        // }
        // else {
        console.info("end of feed")
        // }
    }

}
