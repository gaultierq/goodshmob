// @flow

import React, {Component} from 'react';
import {FlatList, RefreshControl, ActivityIndicator, ReactElement} from 'react-native';
import {connect} from "react-redux";
import {assertUnique} from "../../utils/DataUtils";


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
        this.fetchIt();
    }

    fetchIt(afterId?) {
        return new Promise((resolve) => {
            if (this.state.isFetchingFirst) {
                resolve();
            }
            else {
                this.setState({isFetchingFirst: true});
                this.props
                    .dispatch(this.props.fetchAction({afterId}))
                    .then(()=>this.setState({isFetchingFirst: false}))
                    .then(()=>resolve());
            }
        });
    }

    fetchMore() {
        let c = this.props.data;
        c && this.fetchIt(c[c.length-1].id);
    }

    onRefresh() {
        if (this.state.isPulling) return;
        this.setState({isPulling: true});
        this.fetchIt().then(()=>this.setState({isPulling: false}));
    }

    render() {
        assertUnique(this.props.data);
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

    hasMore() {
        return true;
    }

    onEndReached() {
        if (this.hasMore()) {
            this.fetchMore();
        }
        else {
            console.info("end of feed")
        }
    }

}
