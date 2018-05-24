//@flow

import type {Node} from 'react';
import React, {Component} from 'react';
import {
    ActivityIndicator,
    BackHandler,
    FlatList,
    Keyboard,
    RefreshControl,
    SectionList,
    Text,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import {connect} from "react-redux";
import {assertUnique} from "../../helpers/DataUtils";
import ApiAction from "../../helpers/ApiAction";
import * as Api from "../../managers/Api";
import {TRIGGER_USER_DIRECT_ACTION, TRIGGER_USER_INDIRECT_ACTION} from "../../managers/Api";
import {isEmpty} from "lodash";
import type {i18Key, Id, ms, RequestState, Url} from "../../types";
import {renderSimpleButton} from "../UIStyles";
import {SearchBar} from 'react-native-elements'

import type {ScreenVisibility} from "./Screen";
import {Colors} from "../colors";
import {getLanguages} from 'react-native-i18n'
import {RequestManager} from "../../managers/request";
import {createConsole} from "../../helpers/DebugUtils";
import Spinner from 'react-native-spinkit';
import Config from "react-native-config"
import {FullScreenLoader, Http404} from "../UIComponents";
import {ViewStyle} from "../../types";
import {Call} from "../../managers/Api";
import type {GLoggerLevel} from "../../../flow-typed/goodshmob";

export type FeedSource = {
    callFactory: ()=>Api.Call,
    useLinks?: ?boolean,
    action: ApiAction,
    options?: any
}

export type Props = {
    data?: Array<any>,
    sections?: any,
    renderItem?: any => Node,
    fetchSrc: FeedSource,
    hasMore?: boolean,
    ListHeaderComponent?: Node,
    ListFooterComponent?: Node,
    empty: Node,
    style?: ViewStyle,
    scrollUpOnBack?: ?() => ?boolean,
    visibility?: ScreenVisibility,
    filter?: ?FilterConfig<any>,
    displayName?: string,
    doNotDisplayFetchMoreLoader: ?boolean,
    listRef ?: ?(any => void | string),
    doNotDisplayFetchMoreLoader?: boolean,
    decorateLoadMoreCall?: (last: any, call: Call) => Call,
};

export type FilterConfig<T> = {
    placeholder: i18Key,
    renderFilter: () => Node,
    emptyFilterResult: string => Node,
    style: *,
    applyFilter: (Array<T>) => Array<T>
};

type State = {
    isFetchingFirst: RequestState,
    isFetchingMore: RequestState,

    isPulling?: boolean,
    lastEmptyResultMs?: number,
    moreLink?: Url,

    filter?:? string,
    decorateLoadMoreCall: (last: any, call: Call) => Call,
};


type FeedFetchOption = {
    // afterId?: Id,
    loadMore: boolean,
    trigger?: any,
    drop?: boolean
}

// const LAST_EMPTY_RESULT_WAIT_MS = 5 * 60 * 1000;
const LAST_EMPTY_RESULT_WAIT_MS = Config.LAST_EMPTY_RESULT_WAIT_MS;

@connect((state, ownProps) => ({
    config: state.config,
}))
export default class Feed extends Component<Props, State>  {


    static defaultProps = {
        visibility: 'visible',
        keyExtractor: item => item.id,
        // listRef: "feed",
    }

    createdAt: ms;
    firstRenderAt: ms;
    firstLoaderTimeout: number;
    _listener: ()=>boolean;
    lastFetchFail: number;
    manager: RequestManager = new RequestManager();
    console: GLogger;
    filterNode: Node;

    constructor(props: Props) {
        super(props);
        this.state = {
            initialLoaderVisibility: 'idle',
            decorateLoadMoreCall: props.decorateLoadMoreCall || this._defaultDecorateLoadMoreCall(props),
            tempDisplayName: props.displayName,
            isFetchingFirst: 'idle',
            isFetchingMore: 'idle',
        }
        // this.console = props.displayName ? createConsole(props.displayName) : console
        // this.console = console.createLogger({group: 'feed', groupName: props.displayName})
        this.console = console.createLogger({group: 'feed'})

        this.createdAt = Date.now();
        this.postFetchFirst();
    }

    _defaultDecorateLoadMoreCall = (props: Props) => (last: any, call: Call) => {
        let lastId;
        if (props.sections) {
            let lastItem = _.last(last.data)
            lastId = lastItem && lastItem.id
        }
        else {
            lastId = last.id
        }
        return call.addQuery({id_after: lastId})
    }


    componentDidUpdate(prevProps: Props, prevState: State, snapshot) {
        this.postFetchFirst();
    }

    shouldComponentUpdate(nextProps: Props, nextState: State) {
        if (!__ENABLE_PERF_OPTIM__) return true;
        if (nextProps.visibility === 'hidden') {
            this.console.debug('feed component update saved');
            return false;
        }
        return true;
    }


    postFetchFirst() {
        // if (this.notFetchable()) {
        //     this.logger.debug('cannot fetch. aborting', this.props);
        //     return;
        // }

        setTimeout(() => {
            if (this.state.isFetchingFirst !== 'idle') {
                this.console.debug(`postFetchFirst was not performed, isFetchingFirst=${this.state.isFetchingFirst}`);
                return;
            }
            let trigger = this.hasItems() ? TRIGGER_USER_INDIRECT_ACTION : TRIGGER_USER_DIRECT_ACTION;
            const options = {loadMore: false, trigger};

            const canotFetch = this.cannotFetchReason('isFetchingFirst', options);

            if (canotFetch === null) {
                this.console.debug('posting first fetch')
                this.fetchIt(options)
            }
            else {
                this.console.debug(`postFetchFirst was not performed: reason=${canotFetch}`);
            }
        });
    }
    // type = _.sample(['CircleFlip', 'Bounce', 'Wave', 'WanderingCubes', 'Pulse', 'ChasingDots', 'ThreeBounce', 'Circle', '9CubeGrid', 'WordPress', 'FadingCircle', 'FadingCircleAlt', 'Arc', 'ArcAlt']);
    type = _.sample(['Bounce']);
    // type = _.sample(['ChasingDots']);

    // color = _.sample(['CircleFlip', 'Bounce', 'Wave', 'WanderingCubes', 'Pulse', 'ChasingDots', 'ThreeBounce', 'Circle', '9CubeGrid', 'WordPress', 'FadingCircle', 'FadingCircleAlt', 'Arc', 'ArcAlt']);
    color = _.sample([Colors.greyish]);
    color = _.sample([Colors.green]);


    render() {
        if (this.props.displayName === 'Network') {
            this.console.debug("feed::render", this.state)
        }

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
            renderSectionHeader,
            listRef,
            ...attributes
        } = this.props;

        if (!this.firstRenderAt) this.firstRenderAt = Date.now();

        let items = this.getItems();


        // rendering rules
        // 1. if has some items to display, display them
        if (!this.hasItems()) {
            if (this.manager.isSending('isFetchingFirst', this)) return <FullScreenLoader/>
            if (this.manager.isFail('isFetchingFirst', this)) return this.renderFail(()=>this.tryFetchIt())
            if (this.manager.isSuccess('isFetchingFirst', this)) return this.renderEmpty()
            this.console.warn("rendering hole", this.state)
            return null
        }

        const filter = this.props.filter;
        if (filter) {
            // allViews.push(this.renderSearchBar(filter));
            // allViews.push(filter.renderFilter());

            items = filter.applyFilter(items);
            if (_.isEmpty(items)) {
                return filter.emptyFilterResult(this.state.filter)
            }
        }

        const style1 = [style];
        if ((this.state.isFetchingFirst === 'sending' || this.state.isFetchingFirst === 'idle') && !this.hasItems()) style1.push({minHeight: 150});
        // if (filter
        //     && _.isEmpty(this.state.filter) && this.state.isFilterFocused) {
        //     style1.push({opacity: 0.4})
        // }
        let params =  {
            ref: listRef,
            renderItem,
            // keyExtractor: this.keyExtractor,
            key: "feed-list",
            refreshControl: this.renderRefreshControl(),
            onEndReached: this.onEndReached.bind(this),
            onEndReachedThreshold: 0.1,
            ListFooterComponent: !((this.state.isFetchingFirst === 'sending' || this.state.isFetchingFirst === 'idle') && !this.hasItems()) && this.renderFetchMoreLoader(ListFooterComponent),
            style: style1,
            ListHeaderComponent: !((this.state.isFetchingFirst === 'sending' || this.state.isFetchingFirst === 'idle') && !this.hasItems()) && ListHeaderComponent,
            renderSectionHeader: !((this.state.isFetchingFirst === 'sending' || this.state.isFetchingFirst === 'idle') && !this.hasItems()) && renderSectionHeader,
            onScroll: this._handleScroll,
            onScrollBeginDrag: Keyboard.dismiss,
            keyboardShouldPersistTaps: 'always',
            ...attributes
        };

        let listNode;
        if (sections) {
            listNode = React.createElement(SectionList, {sections: items, ...params});
        }
        else {
            listNode = React.createElement(FlatList, {data: items, ...params});
        }


        return <View style={[this.props.style, {flex: 1}]}>{listNode}</View>
    }

    isVisible() {
        return this.props.visibility === 'visible';
    }

    isFiltering() {
        return !!_.get(this, 'props.filter.token');
    }

    debugOnlyEmptyFeeds() {
        return this.props.config && !!this.props.config.onlyEmptyFeeds;
    }

    //displayed when no data yet, and loading for the first time

    hasItems(): boolean {
        return this.itemsLen() > 0;
    }

    itemsLen(): number {
        return _.size(this.getFlatItems());
    }

    getFlatItems() {
        if (this.debugOnlyEmptyFeeds()) return [];
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

    getLastElement() {
        return _.last(this.props.sections || this.props.data);
    }

    getElementCount() {
        return (this.props.sections || this.props.data || []).length;
    }

    isEmpty() {
        return this.getElementCount() === 0
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
        if (this.props.onScroll) {
            this.props.onScroll(event)
        }
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
                    this.console.debug("Only " + remainingRows + " left. Prefetching...");
                }
            }
        }
    }

    onEndReached() {
        if (this.gentleFetchMore()) {
            this.console.debug("onEndReached => fetching more");
        }
    }

    gentleFetchMore() {
        if (this.hasMore()) {
            return this.fetchMore({trigger: TRIGGER_USER_INDIRECT_ACTION});
        }
        else {
            this.console.debug("== end of feed ==");
            return false;
        }
    }

    canFetch(requestName: string = 'isFetchingFirst', options: FeedFetchOption = {loadMore: false}): boolean {
        const reason = this.cannotFetchReason(requestName, options);
        if (reason) {
            this.console.debug(`cannot fetch: ${reason}`)
        }
        return reason === null
    }


    cannotFetchReason(requestName: string = 'isFetchingFirst', options: FeedFetchOption = {loadMore: false}): string  | null {
        if (this.isFiltering()) return "filtering list";
        if (!this.isVisible()) return "not visible";
        if (!this.props.fetchSrc) return "no fetch sources";

        if (this.manager.isSending(requestName, this)) return "already sending";
        if (options.trigger === TRIGGER_USER_INDIRECT_ACTION) {
            let events = this.manager.getEvents(this, requestName);

            //if recent (30s) result is a failure, do not refetch now
            {
                let lastFail = _.last(events.filter(e=> e.status === 'ko'));
                if (lastFail && Date.now() < lastFail.date + 30 * 1000) {
                    // this.logger.debug("debounced fetch: recent failure");
                    return "debounced: recent failure";
                }
            }

            //if recent (5min) result with no data, do not refetch now
            {
                let lastEmpty = _.last(events.filter(e=> _.get(e, 'options.emptyResult')));


                if (lastEmpty && Date.now() < lastEmpty.date + LAST_EMPTY_RESULT_WAIT_MS) {
                    return "debounced: recent empty";
                }
            }
        }
        return null;
    }

    tryFetchIt(options?: FeedFetchOption = {loadMore: false}) {
        let {loadMore} = options;
        let requestName = loadMore ? 'isFetchingMore' : 'isFetchingFirst';
        if (this.canFetch(requestName, options)) {
            this.fetchIt(options)
            return true;
        }
        return false;
    }

    fetchIt(options?: FeedFetchOption = {loadMore: false}) {
        let {loadMore, trigger, drop} = options;
        let requestName = loadMore ? 'isFetchingMore' : 'isFetchingFirst';

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
            if (loadMore && this.state.moreLink) {
                call = Api.Call.parse(this.state.moreLink).withMethod('GET');
            }
            else {
                call = callFactory();
                if (loadMore && !useLinks) {
                    this.decorateCallForNextPage(call)
                }
            }
            if (trigger === undefined) {
                trigger = loadMore ? TRIGGER_USER_INDIRECT_ACTION : TRIGGER_USER_DIRECT_ACTION;
            }

            this.props
                .dispatch(call.createActionDispatchee(fetchSrc.action, {trigger, ...fetchSrc.options, mergeOptions: {drop, hasLess: !!loadMore}}))
                .then(({data, links})=> {
                    this.console.debug("disptachForAction" + JSON.stringify(this.props.fetchSrc.action));
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
                        && (loadMore || !this.state.moreLink)
                    ) {

                        this.setState({moreLink: links.next});
                    }
                    resolve(data);
                }, err => {
                    this.console.warn("feed error:", err);
                    this.lastFetchFail = Date.now();
                    reqTrack.fail()
                    // this.setState({[requestName]: 'ko'});
                    // reject(err);
                    // this.logger.warn("test::finsih")

                })
        });
    }

    decorateCallForNextPage(call: Call) {
        const lastItem = this.getLastElement();

        if (lastItem) {
            return this.state.decorateLoadMoreCall(lastItem, call);
        }
        else {
            this.console.warn("no last item found")
            return call
        }
    }

    fetchMore(options ?: FeedFetchOption = {loadMore: false}) {
        if (!this.isEmpty()) {
            return this.tryFetchIt({loadMore: true, ...options});
        }
        return false;
    }

    onRefresh() {
        if (this.state.isPulling) return;
        this.setState({isPulling: true});

        this.manager.clearEvents();
        if (this.canFetch()) {
            this.fetchIt({drop: true})
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
                    this.manager.isSending('isFetchingMore', this) &&
                    !recentlyCreated &&
                    !this.props.doNotDisplayFetchMoreLoader &&
                    (
                        <View style={{flex:1, flexDirection: 'row',
                            margin:12, justifyContent:'center', alignItems: 'flex-end'}}>
                            <Text style={{fontSize: 10, marginRight: 2, alignSelf: "center"}}>{i18n.t('loadmore')}</Text>
                            <Spinner
                                isVisible={true}
                                size={8}
                                type={"ThreeBounce"}
                                color={Colors.black}/>
                        </View>
                    )
                }
                {
                    this.manager.isFail('isFetchingMore', this) && this.renderFail(() => this.fetchMore({trigger: TRIGGER_USER_DIRECT_ACTION}))
                }
            </View>
        )
    }

    renderFail(fetch: () => any) {

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
