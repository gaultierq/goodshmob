//@flow

import type {Node} from 'react';
import React, {Component} from 'react';
import {View, ActivityIndicator, FlatList, RefreshControl, Text, BackHandler} from 'react-native';
import {connect} from "react-redux";
import {assertUnique} from "../../utils/DataUtils";
import ApiAction from "../../utils/ApiAction";
import * as Api from "../../utils/Api";
import {isEmpty} from "lodash";
import type {i18Key, Id, RequestState, Url} from "../../types";
import {renderSimpleButton} from "../UIStyles";
import i18n from '../../i18n/i18n'
import type {ScreenVisibility} from "./Screen";


export type FeedSource = {
    callFactory: ()=>Api.Call,
    useLinks:? boolean,
    action: ApiAction,
    options?: any
}

export type Props<T> = {
    data: Array<T>,
    feedId?: string,
    renderItem: Function,
    fetchSrc: FeedSource,
    hasMore: boolean,
    ListHeaderComponent?: Node,
    ListFooterComponent?: Node,
    empty: i18Key,
    style: any,
    scrollUpOnBack?: ()=>boolean,
    cannotFetch?: boolean,
    visibility: ScreenVisibility
};


type State = {
    isFetchingFirst?: RequestState,
    isFetchingMore?: RequestState,
    firstLoad?: RequestState,
    isPulling?: boolean,
    lastEmptyResultMs?: number,
    moreLink?: Url
};

@connect()
export default class Feed<T> extends Component<Props<T>, State>  {

    keyExtractor = (item, index) => item.id;

    state = {firstLoad: 'idle'};

    static defaultProps = {
        visiblility: 'unknown'
    };

    _listener: ()=>boolean;

    lastFetchFail: number;

    constructor(props: Props<T>) {
        super(props);
        this.postFetchFirst();
        props.feedId && console.log(`constructing feed '${props.feedId}'`);
    }

    componentWillReceiveProps(nextProps: Props<*>) {
        if (this.props.scrollUpOnBack !== nextProps.scrollUpOnBack) {
            let scrollUpOnBack = nextProps.scrollUpOnBack;
            if (scrollUpOnBack) {
                console.info("Feed listening to back navigation");

                this._listener = () => {
                    console.info("Feed onBackPressed");
                    if (this.getScrollY() > 100) {
                        this.refs.feed.scrollToOffset({x: 0, y: 0, animated: true});
                        return true;
                    }

                    return scrollUpOnBack();
                };

                BackHandler.addEventListener('hardwareBackPress', this._listener);
            }
            else {
                BackHandler.removeEventListener('hardwareBackPress', this._listener);
                this._listener = null;
            }
        }

        //hack: let the next props become the props
        this.postFetchFirst();

    }


    shouldComponentUpdate(nextProps, nextState) {
        if (!ENABLE_PERF_OPTIM) return true;
        if (this.props.visibility === 'hidden') {
            console.debug('feed component update saved');
            return false;
        }
        return true;
    }

    postFetchFirst() {
        setTimeout(() => {
            if (this.canFetch() && this.state.firstLoad === 'idle') {
                Api.safeExecBlock.call(
                    this,
                    () => this.fetchIt(),
                    'firstLoad'
                );
            }
        });
    }

    render() {
        assertUnique(this.props.data);

        const {
            data,
            renderItem,
            fetchSrc,
            hasMore,
            empty,
            ListHeaderComponent,
            feedId,
            ...attributes
        } = this.props;

        let empt = isEmpty(data);
        let nothingInterestingToDisplay = empt && this.state.isFetchingFirst === 'ok';

        let firstEmptyLoader = this.state.firstLoad !== 'ok' && empt;
        // firstEmptyLoader = true;

        if (feedId) {
            console.log(`feed '${feedId}' render: empt=${empt} nitd=${nothingInterestingToDisplay} fil=${firstEmptyLoader} data.len=${data ? data.length : -1}`);
        }

        if (nothingInterestingToDisplay) {
            if (this.state.isFetchingFirst === 'ko') {
                return this.renderFail(()=>this.tryFetchIt());
            }
            if (empty) return this.renderEmpty();
        }
        return (
            <FlatList
                data={data}
                ref="feed"
                renderItem={renderItem}
                keyExtractor={this.keyExtractor}
                refreshControl={this.renderRefreshControl()}
                onEndReached={ this.onEndReached.bind(this) }
                onEndReachedThreshold={0.1}
                ListFooterComponent={!firstEmptyLoader && this.renderFetchMoreLoader()}
                style={{...this.props.style,  minHeight: 100}}
                ListHeaderComponent={!firstEmptyLoader && ListHeaderComponent}
                onScroll={this._handleScroll}
                {...attributes}
            />
        );
    }

    renderEmpty() {
        return <Text style={{
            fontSize: 20,
            fontFamily: 'Chivo-Light',
            margin: '10%',
            textAlign: 'center'
        }}>{i18n.t(this.props.empty)}</Text>;
    }

    isFetchingFirst() {
        return this.state.isFetchingFirst === 'sending';
    }

    isFetchingMore() {
        return this.state.isFetchingMore === 'sending';
    }

    lastEvent: any;

    getScrollY() {
        if (!this.lastEvent) return this.lastEvent.contentOffset.y;
        return 0;
    }

    _handleScroll = (event: Object) => {
        let lastEvent = event.nativeEvent;
        this.lastEvent = lastEvent;

        this.prefetch(lastEvent);
    };

    prefetch(lastEvent) {
//
        let scrollY = lastEvent.contentOffset.y;
        let height = lastEvent.layoutMeasurement.height;
        let totalSize = lastEvent.contentSize.height;

        let data = this.props.data;
        let elem = (data || []).length;
        if (elem) {
            let rowHeight = totalSize / elem;

            let scrolled = scrollY + height;
            let hidden = totalSize - scrolled;
            let remainingRows = hidden / rowHeight;

            if (remainingRows < 5) {
                console.log("Only " + remainingRows + " left. Prefetching...");
                this.gentleFetchMore();
            }
        }
    }

    onEndReached() {
        console.debug("onEndReached");
        this.gentleFetchMore();
    }

    gentleFetchMore() {
        if (this.hasMore()) {
            this.fetchMore();
        }
        else {
            console.info("== end of feed ==")
        }
    }

    canFetch(requestName: string = 'isFetchingFirst'): boolean {
        if (this.props.cannotFetch) {
            console.log(requestName + " fetch prevented");
            return false;
        }
        else if (this.state[requestName] === 'sending') {
            console.log(requestName + " is already running. state="+JSON.stringify(this.state));
            return false;
        }
        else if (this.lastFetchFail + 2000 > Date.now()) {
            console.log("request debounced");
            return false;
        }
        return true;
    }

    tryFetchIt(afterId?: Id) {
        let requestName = afterId ? 'isFetchingMore' : 'isFetchingFirst';
        if (this.canFetch(requestName)) {
            this.fetchIt(afterId);
        }
    }

    fetchIt(afterId?: Id) {
        let requestName = afterId ? 'isFetchingMore' : 'isFetchingFirst';
        return new Promise((resolve, reject) => {
            let {fetchSrc}= this.props;

            if (!fetchSrc) return;

            this.setState({[requestName]: 'sending'});

            const {callFactory, useLinks} = fetchSrc;
            let call;
            //backend api is not unified yet
            if (this.state.moreLink) {
                call = Api.Call.parse(this.state.moreLink);
            }
            else {
                call = callFactory();
                if (afterId && !useLinks) {
                    call.addQuery({id_after: afterId});
                }
            }

            this.props
                .dispatch(call.disptachForAction2(fetchSrc.action, fetchSrc.options))
                .then(({data, links})=> {
                    console.debug("disptachForAction3 " + JSON.stringify(this.props.fetchSrc.action));
                    if (!data) {
                        this.setState({[requestName]: 'ko'});
                        return reject(`no data provided for ${fetchSrc.action}`);
                    }
                    this.setState({[requestName]: 'ok'});

                    let hasNoMore = data.length === 0;
                    if (hasNoMore) {
                        this.setState({lastEmptyResultMs: Date.now()});
                    }

                    //handle links
                    if (
                        useLinks
                        && links && links.next
                        && (afterId || !this.state.moreLink)
                    ) {

                        this.setState({moreLink: links.next});
                    }
                    resolve(data);
                }, err => {
                    console.warn("feed error:" + err);
                    this.lastFetchFail = Date.now();
                    this.setState({[requestName]: 'ko'});
                })
        });
    }

    fetchMore() {
        let c = this.props.data;
        if (!c) return;
        let last = c[c.length-1];
        if (!last) return;
        this.tryFetchIt(last.id);
    }

    onRefresh() {
        if (this.state.isPulling) return;
        this.setState({isPulling: true});

        if (this.canFetch()) {
            this.fetchIt()
                .catch(err=>{console.warn("error while fetching:" + err)})
                .then(()=>this.setState({isPulling: false}));
        }

    }

    renderRefreshControl() {
        let displayLoader = (this.isFetchingFirst() && isEmpty(this.props.data)) || this.state.isPulling;
        return (<RefreshControl
            refreshing={!!displayLoader}
            onRefresh={this.onRefresh.bind(this)}
        />);
    }

    renderFetchMoreLoader() {
        return (<View>
                {this.props.ListFooterComponent}
                {
                    this.state.isFetchingMore === 'sending' && (

                        <View style={{flex:1, margin:12, justifyContent:'center'}}>
                            <Text style={{fontSize: 10, alignSelf: "center", marginRight: 8}}>{i18n.t('loadmore')}</Text>
                            <ActivityIndicator
                                animating={this.isFetchingMore()}
                                size="small"
                            />
                        </View>
                    )
                }
                {
                    this.state.isFetchingMore === 'ko' && this.renderFail(() => this.fetchMore())
                }
            </View>
        )
    }

    renderFail(fetch: () => Promise<*>) {

        return (
            <View style={{padding: 12}}>
                <Text style={{alignSelf: "center"}}>Le chargement a échoué...</Text>
                {renderSimpleButton("Réessayer", fetch)}
            </View>
        );
    }

    hasMore() {
        let last = this.state.lastEmptyResultMs;
        if (last && Date.now() - last < 1000 * 10) {
            console.log("throttled -> hasMore=false");
            return false;
        }
        if (typeof this.props.hasMore !== 'undefined') return this.props.hasMore;
        return true;
    }


}


