// @flow

import React, {Component} from 'react';
import {FlatList, RefreshControl, ActivityIndicator, ReactElement} from 'react-native';
import {connect} from "react-redux";
import {assertUnique} from "../../utils/DataUtils";
import ApiAction from "../../utils/ApiAction";
import * as Api from "../../utils/Api";
import {isEmpty} from "lodash";

export type FeedSource = {
    callFactory: ()=>Api.Call,
    action: ApiAction,
    options?: any
}


@connect()
export default class Feed<T> extends Component  {

    props: {
        data: Array<T>,
        renderItem: Function,
        fetchSrc: FeedSource,
        hasMore: boolean,
        ListHeaderComponent?: ReactElement,
        style: any
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

    render() {
        assertUnique(this.props.data);

        const {
            data,
            renderItem,
            fetchSrc,
            hasMore,
            ...attributes
        } = this.props;

        return (
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={this.keyExtractor}
                refreshControl={this.renderRefreshControl()}
                onEndReached={ this.onEndReached.bind(this) }
                onEndReachedThreshold={0}
                ListFooterComponent={this.renderFetchMoreLoader()}
                style={{...this.props.style, minHeight: 50}}
                {...attributes}
            />
        );
    }

    componentDidMount() {
        this.fetchIt();
    }

    fetchIt(afterId?) {
        return new Promise((resolve) => {

            let t = afterId ? 'isFetchingMore' : 'isFetchingFirst';

            if (this.state[t]) {
                resolve();
            }
            else {
                this.setState({[t]: true});

                let {fetchSrc}= this.props;

                let call = fetchSrc.callFactory();

                if (afterId) call.addQuery({id_after: afterId});

                this.props
                    .dispatch(call.disptachForAction2(fetchSrc.action, fetchSrc.options))
                    .then(()=>this.setState({[t]: false}))
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

    renderRefreshControl() {
        let displayLoader = (this.state.isFetchingFirst && isEmpty(this.props.data)) || this.state.isPulling;
        return (<RefreshControl
            refreshing={displayLoader}
            onRefresh={this.onRefresh.bind(this)}
        />);
    }

    renderFetchMoreLoader() {
        return (this.state.isFetchingMore ?
            <ActivityIndicator
                animating={this.state.isFetchingMore}
                size = "small"
            />:null)
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


