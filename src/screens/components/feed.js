// @flow

import React, {Component} from 'react';
import {FlatList, RefreshControl, ActivityIndicator, ReactElement} from 'react-native';
import {connect} from "react-redux";
import {assertUnique} from "../../utils/DataUtils";
import ApiAction from "../../utils/ApiAction";
import * as Api from "../../utils/Api";

export type FeedSource = {
    callFactory: ()=>Api.Call,
    action: ApiAction
}


@connect()
export default class Feed<T> extends Component  {

    props: {
        data: Array<T>,
        renderItem: Function,
        fetchSrc: FeedSource,
        hasMore: boolean,
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

                let call = this.props.fetchSrc.callFactory();
                if (afterId) call.addQuery({id_gt: afterId});

                this.props
                    .dispatch(call.disptachForAction2(this.props.fetchSrc.action))
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
        return !!this.props.hasMore;
    }

    onEndReached() {
        if (this.hasMore()) {
            this.fetchMore();
        }
        else {
            console.info("== end of feed ==")
        }
    }
}


