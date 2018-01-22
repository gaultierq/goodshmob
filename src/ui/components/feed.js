//@flow

import type {Node} from 'react';
import React, {Component} from 'react';
import {ActivityIndicator, BackHandler, FlatList, RefreshControl, SectionList, Text, View} from 'react-native';
import {connect} from "react-redux";
import {assertUnique} from "../../helpers/DataUtils";
import ApiAction from "../../helpers/ApiAction";
import * as Api from "../../managers/Api";
import {TRIGGER_USER_DIRECT_ACTION, TRIGGER_USER_INDIRECT_ACTION} from "../../managers/Api";
import {isEmpty} from "lodash";
import type {i18Key, ms, RequestState, Url} from "../../types";
import {renderSimpleButton} from "../UIStyles";
import i18n from '../../i18n/i18n'
import type {ScreenVisibility} from "./Screen";
import Search from 'react-native-search-box';
import {Colors} from "../colors";
import Fuse from 'fuse.js'


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
//@logged
export default class Feed<T> extends Component<Props<T>, State>  {

    keyExtractor = (item, index) => item.id;

    state = {firstLoad: 'idle'};

    createdAt: ms;

    static defaultProps = {
        visibility: 'unknown'
    };

    _listener: ()=>boolean;

    lastFetchFail: number;

    constructor(props: Props<T>) {
        super(props);
        this.createdAt = Date.now();
        this.postFetchFirst();
        props.feedId && console.log(`constructing feed '${props.feedId}'`);
    }

    componentWillReceiveProps(nextProps: Props<*>) {
        if (__ENABLE_BACK_HANDLER__ && this.props.scrollUpOnBack !== nextProps.scrollUpOnBack) {
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
        if (nextProps.visibility === 'hidden') {
            console.debug('feed component update saved');
            return false;
        }
        return true;
    }

    postFetchFirst() {
        setTimeout(() => {
            if (this.canFetch() && this.state.firstLoad === 'idle') {
                let trigger = this.hasData() ? TRIGGER_USER_INDIRECT_ACTION : TRIGGER_USER_DIRECT_ACTION;
                Api.safeExecBlock.call(
                    this,
                    () => this.fetchIt({trigger}),
                    'firstLoad'
                );
            }
        });
    }

    render() {
        assertUnique(this.props.data);

        const {
            sections,
            data,
            style,
            renderItem,
            fetchSrc,
            hasMore,
            empty,
            ListHeaderComponent,
            ListFooterComponent,
            feedId,
            renderSectionHeader,
            ...attributes
        } = this.props;

        let nothingInterestingToDisplay = isEmpty(data) && this.state.isFetchingFirst === 'ok';

        let firstEmptyLoader = this.isFirstEmptyLoader(data);
        //firstEmptyLoader = true;

        // if (feedId) {
        //     console.debug(`feed '${feedId}' render: empt=${isEmpty(data)} nitd=${nothingInterestingToDisplay} fil=${firstEmptyLoader} data.len=${data ? data.length : -1}`);
        // }

        if (nothingInterestingToDisplay) {
            if (this.state.isFetchingFirst === 'ko') {
                return this.renderFail(()=>this.tryFetchIt());
            }
            if (empty) return this.renderEmpty();
        }

        let params =  {
            // data,
            ref: "feed",
            renderItem,
            keyExtractor: this.keyExtractor,
            refreshControl: this.renderRefreshControl(),
            onEndReached: this.onEndReached.bind(this),
            onEndReachedThreshold: 0.1,
            ListFooterComponent: !firstEmptyLoader && this.renderFetchMoreLoader(ListFooterComponent),
            style: [{...style}, firstEmptyLoader ? {minHeight: 150} : {}],
            ListHeaderComponent: !firstEmptyLoader && ListHeaderComponent,
            renderSectionHeader: !firstEmptyLoader && renderSectionHeader,
            onScroll: this._handleScroll,
            keyboardShouldPersistTaps: 'always',
            ...attributes
        };

        let searchBar = !!this.props.filter && this.renderSearchBar();
        let list;

        if (this.props.filter && this.state.filter) {
            items = this.props.filter.applyFilter(sections || data, this.state.filter);
        }
        else {
            items = sections || data;
        }

        if (sections) {
            list = React.createElement(SectionList, {sections: items, ...params});
        }
        else {

            list = React.createElement(FlatList, {data: items, ...params});
        }

        return <View>{searchBar}{list}</View>


        //
        // return (
        //     <SectionList
        //         sections={[{data, title: 'test'}]}
        //         ref="feed"
        //         renderItem={renderItem}
        //         keyExtractor={this.keyExtractor}
        //         refreshControl={this.renderRefreshControl()}
        //         onEndReached={ this.onEndReached.bind(this) }
        //         onEndReachedThreshold={0.1}
        //         ListFooterComponent={!firstEmptyLoader && this.renderFetchMoreLoader(ListFooterComponent)}
        //         style={{...this.props.style,  minHeight: 100}}
        //         ListHeaderComponent={!firstEmptyLoader && ListHeaderComponent}
        //         onScroll={this._handleScroll}
        //         {...attributes}
        //     />
        // );
    }

    applyFilter(data, isSection: boolean = false) {
        if (this.state.filter) {

            let searchIn = data;

            let fuse = new Fuse(searchIn, {
                keys: [
                    {
                        name: 'name',
                        weight: 0.6
                    },
                    {
                        name: 'title',
                        weight: 0.4
                    }],
                // keys: ['name', 'title'],
                sort: true,
                threshold: 0.6
            });
            data = fuse.search(this.state.filter);
        }


        return data;
    }

    renderSearchBar(){

        let {onSearch, style} = this.props.filter;

        let font = {
            fontSize: 17,
            lineHeight: 22,
            textAlign: 'left'};
        const color = 'rgb(142,142,147)';

        //TODO: finish design
        //use https://github.com/agiletechvn/react-native-search-box
        return (
            <View style={[{}, style]}>
                {React.createElement(Search, {
                    backgroundColor: Colors.white82,
                    placeholderTextColor: color, //TODO
                    titleCancelColor: color,
                    tintColorSearch: color,
                    tintColorDelete: color,
                    // cancelButtonWidth: PropTypes.number,
                    // cancelButtonStyle: PropTypes.PropTypes.oneOfType([
                    //     PropTypes.number,
                    //     PropTypes.object
                    // ]),
                    cancelButtonTextStyle: {
                        ...font
                    },
                    // onLayout: PropTypes.func,
                    inputStyle: {
                        color: Colors.black,
                        ...font
                    },
                    //MagicString
                    placeholder: i18n.t('search.in_feed'),
                    //MagicString
                    cancelTitle: "Cancel",
                    inputStyle: {backgroundColor: 'rgb(230,230,230)'},
                    inputBorderRadius: 10,
                    inputHeight: 32,
                    onChangeText: filter => this.setState({filter}),
                    onCancel: ()=>this.setState({filter: null}),
                    onDelete: ()=>this.setState({filter: null}),
                    onSearch
                })}
            </View>
        );
    }


    //displayed when no data yet, and loading for the first time
    isFirstEmptyLoader() {
        return (this.state.firstLoad === 'sending' || this.state.firstLoad === 'idle') && !this.hasData();
    }

    hasData() {
        return !isEmpty(this.props.data);
    }

    renderEmpty() {
        return <Text style={{
            fontSize: 20,
            //BadFont
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


    //fetching next elements if only 5 rows remaining
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
            this.fetchMore({trigger: TRIGGER_USER_INDIRECT_ACTION});
        }
        else {
            console.debug("== end of feed ==")
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

    tryFetchIt(options?: any = {}) {
        let {afterId} = options;
        let requestName = afterId ? 'isFetchingMore' : 'isFetchingFirst';
        if (this.canFetch(requestName)) {
            this.fetchIt(options);
        }
    }

    fetchIt(options?: any = {}) {
        let {afterId, trigger} = options;
        let requestName = afterId ? 'isFetchingMore' : 'isFetchingFirst';

        return new Promise((resolve, reject) => {
            let {fetchSrc}= this.props;

            if (!fetchSrc) return;

            this.setState({[requestName]: 'sending'});

            const {callFactory, useLinks} = fetchSrc;
            let call;
            //backend api is not unified yet
            if (this.state.moreLink) {
                call = Api.Call.parse(this.state.moreLink).withMethod('GET');
            }
            else {
                call = callFactory();
                if (afterId && !useLinks) {
                    call.addQuery({id_after: afterId});
                }
            }
            if (trigger === undefined) {
                trigger = afterId ? TRIGGER_USER_INDIRECT_ACTION : TRIGGER_USER_DIRECT_ACTION;
            }


            this.props
                .dispatch(call.disptachForAction2(fetchSrc.action, {trigger, ...fetchSrc.options}))
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

    fetchMore(options ?: any = {}) {
        let c = this.props.data;
        if (!c) return;
        let last = c[c.length-1];
        if (!last) return;
        this.tryFetchIt({afterId: last.id, ...options});
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

    renderFetchMoreLoader(ListFooterComponent: Node) {
        //this is a hack: do not display load more loader right away
        let recentlyCreated = Date.now() - this.createdAt < 2000;

        return (<View>
                {ListFooterComponent}
                {
                    this.state.isFetchingMore === 'sending' && !recentlyCreated && (

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
                    this.state.isFetchingMore === 'ko' && this.renderFail(() => this.fetchMore({trigger: TRIGGER_USER_DIRECT_ACTION}))
                }
            </View>
        )
    }

    renderFail(fetch: () => Promise<*>) {

        return (
            <View style={{padding: 12}}>
                <Text style={{alignSelf: "center"}}>{i18n.t('loading.error')}</Text>
                {renderSimpleButton(i18n.t('actions.try_again'), fetch)}
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
