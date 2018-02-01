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
import {renderSimpleButton, STYLES} from "../UIStyles";

import type {ScreenVisibility} from "./Screen";
import Search from 'react-native-search-box';
import {Colors} from "../colors";
import Fuse from 'fuse.js'
import { getLanguages } from 'react-native-i18n'

import {SFP_TEXT_REGULAR} from "../fonts"
import {RequestManager} from "../../managers/request";



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
    empty: Node,
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

@connect((state, ownProps) => ({
    config: state.config,
}))
export default class Feed<T> extends Component<Props<T>, State>  {

    keyExtractor = (item, index) => item.id;

    state = {firstLoad: 'idle'};

    createdAt: ms;

    static defaultProps = {
        visibility: 'unknown'
    };

    _listener: ()=>boolean;

    lastFetchFail: number;

    isFrenchLang: boolean;

    manager: RequestManager = new RequestManager();

    constructor(props: Props<T>) {
        super(props);
        this.createdAt = Date.now();
        this.postFetchFirst();
        props.feedId && console.log(`constructing feed '${props.feedId}'`);
        this.isFrenchLang = _.startsWith(i18n.locale, 'fr');
        if (!this.props.fetchSrc) {
            console.warn("no fetch source provided");
        }
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
            let trigger = this.hasItems() ? TRIGGER_USER_INDIRECT_ACTION : TRIGGER_USER_DIRECT_ACTION;
            const options = {trigger};

            if (this.canFetch('isFetchingFirst', options) && this.state.firstLoad === 'idle') {

                Api.safeExecBlock.call(
                    this,
                    () => this.fetchIt(options),
                    'firstLoad'
                );
            }
        });
    }

    render() {
        assertUnique(this.getFlatItems());

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

        let items = this.getItems();

        let nothingInterestingToDisplay = !this.hasItems() && this.manager.isSuccess('isFetchingFirst', this);

        let firstEmptyLoader = this.isFirstEmptyLoader();

        if (nothingInterestingToDisplay) {
            if (this.manager.isFail('isFetchingFirst', this)) {
                return this.renderFail(()=>this.tryFetchIt());
            }
            if (empty) return this.renderEmpty();
        }

        let params =  {
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
            items = this.props.filter.applyFilter(items, this.state.filter);
        }

        if (sections) {
            list = React.createElement(SectionList, {sections: items, ...params});
        }
        else {
            list = React.createElement(FlatList, {data: items, ...params});
        }

        return <View>{searchBar}{list}</View>
    }

    debugOnlyEmptyFeeds() {
        return this.props.config && !!this.props.config.onlyEmptyFeeds;
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
            fontSize: 16,
            lineHeight: 22,
            textAlign: 'left',
        };

        const color = Colors.grey142;
        //TODO: adjust fr, en margins
        const placeholderConfig = {
            placeholder: i18n.t('search.in_feed'),
            placeholderCollapsedMargin: this.isFrenchLang ? 95 : 65,
            searchIconCollapsedMargin: this.isFrenchLang ? 110 : 80,
        };


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
                    ...placeholderConfig,
                    cancelTitle: i18n.t('actions.cancel'),
                    inputStyle: {backgroundColor: Colors.steel12},
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
        return (this.state.firstLoad === 'sending' || this.state.firstLoad === 'idle') && !this.hasItems();
    }

    hasItems(): boolean {
        return this.itemsLen() > 0;
    }

    itemsLen(): number {
        return _.size(this.getItems());
    }

    getFlatItems() {
        if (this.props.sections) {
            let datas = this.props.sections.map(s=>s.data);
            return Array.prototype.concat.apply([], datas)
        }
        return this.props.data;
    }

    getItems() {
        if (this.debugOnlyEmptyFeeds()) return [];
        return this.props.sections || this.props.data;
    }

    getLastItem() {
        let data;
        if (this.props.sections) {
            let lastSection = _.last(this.props.sections);
            data = lastSection && lastSection.data;
        }
        else {
            data = this.props.data;
        }
        return _.last(data);
    }

    renderEmpty() {
        return <View>{this.props.empty}</View>;
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

        this._throttledPrefetch();
    };

    _throttledPrefetch = _.throttle(()=> this.prefetch(), 3000);

    //fetching next elements if only 5 rows remaining
    prefetch() {
//
        let scrollY = this.lastEvent.contentOffset.y;
        let height = this.lastEvent.layoutMeasurement.height;
        let totalSize = this.lastEvent.contentSize.height;

        let elem = this.itemsLen();
        if (elem) {
            let rowHeight = totalSize / elem;

            let scrolled = scrollY + height;
            let hidden = totalSize - scrolled;
            let remainingRows = hidden / rowHeight;

            if (remainingRows < 5) {
                if (this.gentleFetchMore()) {
                    console.debug("Only " + remainingRows + " left. Prefetching...");
                }
            }
        }
    }

    onEndReached() {
        if (this.gentleFetchMore()) {
            console.debug("onEndReached => fetching more");
        }
    }

    gentleFetchMore() {
        if (this.hasMore()) {
            return this.fetchMore({trigger: TRIGGER_USER_INDIRECT_ACTION});
        }
        else {
            console.debug("== end of feed ==");
            return false;
        }
    }

    canFetch(requestName: string = 'isFetchingFirst', options: * = {}): boolean {
        if (this.props.cannotFetch || !this.props.fetchSrc) {
            //console.log(requestName + " fetch prevented");
            return false;
        }
        else if (this.manager.isSending(requestName, this)) {
            console.log(`'${requestName}' prevented: is already running. state=${JSON.stringify(this.state)}`);
            return false;
        }
        else if (options.trigger === TRIGGER_USER_INDIRECT_ACTION) {
            let events = this.manager.getEvents(this, requestName);

            //if recent (30s) result is a failure, do not refetch now
            {
                let lastFail = _.last(events.filter(e=> e.status === 'ko'));
                if (lastFail && Date.now() < lastFail.date + 30 * 1000) {
                    console.debug("debounced fetch: recent failure");
                    return false;
                }
            }

            //if recent (5min) result with no data, do not refetch now
            {
                let lastEmpty = _.last(events.filter(e=> _.get(e, 'options.emptyResult')));
                if (lastEmpty && Date.now() < lastEmpty.date + 5 * 60 * 1000) {
                    console.debug("debounced fetch: recent empty result");
                    return false;
                }
            }
        }
        return true;
    }

    tryFetchIt(options?: any = {}) {
        let {afterId} = options;
        let requestName = afterId ? 'isFetchingMore' : 'isFetchingFirst';
        if (this.canFetch(requestName, options)) {
            this.fetchIt(options);
            return true;
        }
        return false;
    }

    fetchIt(options?: any = {}) {
        let {afterId, trigger} = options;
        let requestName = afterId ? 'isFetchingMore' : 'isFetchingFirst';

        // $FlowFixMe
        return new Promise((resolve, reject) => {
            let {fetchSrc}= this.props;

            if (!fetchSrc) {
                reject("no fetch source provided");
                return;
            }
            let reqTrack = this.manager.createTracker(requestName, this);

            // this.setState({[requestName]: 'sending'});

            reqTrack.sending();

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
                        reqTrack.fail();
                        // this.setState({[requestName]: 'ko'});
                        return reject(`no data provided for ${fetchSrc.action}`);
                    }
                    // this.setState({[requestName]: 'ok'});


                    let hasNoMore = data.length === 0;
                    reqTrack.success({emptyResult: hasNoMore});

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
                    reqTrack.fail();
                    // this.setState({[requestName]: 'ko'});
                })
        });
    }

    fetchMore(options ?: any = {}) {
        let last = this.getLastItem();
        if (last) {
            if (!last.id) throw "no id found for this item:" + last;
            return this.tryFetchIt({afterId: last.id, ...options});
        }
        return false;
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
        let displayLoader = (this.isFetchingFirst() && !this.hasItems()) || this.state.isPulling;
        return (<RefreshControl
            refreshing={!!displayLoader}
            onRefresh={this.onRefresh.bind(this)}
        />);
    }

    renderFetchMoreLoader(ListFooterComponent: Node) {
        //this is a hack: do not display load more loader right away
        let recentlyCreated = Date.now() - this.createdAt < 2000;

        return (<View style={{backgroundColor: 'transparent'}}>
                {ListFooterComponent}
                {
                    this.manager.isSending('isFetchingMore', this) && !recentlyCreated && (

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
                    this.manager.isFail('isFetchingMore', this) && this.renderFail(() => this.fetchMore({trigger: TRIGGER_USER_DIRECT_ACTION}))
                }
            </View>
        )
    }

    renderFail(fetch: () => void) {

        return (
            <View style={{padding: 12}}>
                <Text style={{alignSelf: "center"}}>{i18n.t('loading.error')}</Text>
                {renderSimpleButton(i18n.t('actions.try_again'), fetch)}
            </View>
        );
    }

    hasMore() {
        return (typeof this.props.hasMore !== 'undefined' && this.props.hasMore) || true;
    }


}
