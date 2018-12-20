//@flow

import type {Node} from 'react'
import React, {Component} from 'react'
import {
    ActivityIndicator,
    BackHandler,
    FlatList,
    Keyboard,
    RefreshControl,
    ScrollView,
    SectionList,
    Text,
    TouchableWithoutFeedback,
    View
} from 'react-native'
import {connect} from "react-redux"
import {assertUnique} from "../../helpers/DataUtils"
import ApiAction from "../../helpers/ApiAction"
import * as Api from "../../managers/Api"
import {Call, TRIGGER_USER_DIRECT_ACTION, TRIGGER_USER_INDIRECT_ACTION} from "../../managers/Api"
import {isEmpty} from "lodash"
import type {i18Key, ms, RequestState, Url} from "../../types"
import {ViewStyle} from "../../types"
import {renderSimpleButton} from "../UIStyles"
import type {ScreenVisibility} from "./Screen"
import {getLanguages} from 'react-native-i18n'
import {RequestManager} from "../../managers/request"
import Config from "react-native-config"
import {FullScreenLoader, renderTextAndDots} from "../UIComponents"
import BugsnagManager from "../../managers/BugsnagManager"
import {Colors} from "../colors"
import Spinner from "react-native-spinkit"

export type FeedSource = {
    callFactory: ()=>Api.Call,
    useLinks?:boolean,
    action: ApiAction,
    options?: any,
    onFetch?: Promise<*>
}

export type Props = {
    data?: Array<any>,
    sections?: any,
    renderItem: any => Node,
    fetchSrc: FeedSource,
    hasMore?: boolean,
    ListHeaderComponent?: Node,
    ListFooterComponent?: Node,
    ListEmptyComponent?: Node,
    style?: ViewStyle,
    scrollUpOnBack?:?() => ?boolean,
    visibility?: ScreenVisibility,
    filter?:FilterConfig<any>,
    displayName?: string,
    doNotDisplayFetchMoreLoader?:boolean,
    listRef ?:(any => void | string),
    doNotDisplayFetchMoreLoader?: boolean,
    decorateLoadMoreCall?: (sections: any[], call: Call) => Call,
    getFlatItems?: () => any[],
    autoRefreshMs?: ms, // if set, the head of the feed will be reloaded every time the feed become visible again
};

export type FilterConfig<T> = {
    placeholder: i18Key,
    emptyFilterResult: string => Node,
    style?: *,
    applyFilter: (Array<T>) => Array<T>
};

type State = {
    isFetchingHead: RequestState,
    isFetchingMore: RequestState,

    isPulling?: boolean,
    lastEmptyResultMs?: number,
    moreLink?: Url,

    filter?:? string,
    decorateLoadMoreCall: (sections: any[], call: Call) => Call,
};


type FeedFetchOption = {
    // afterId?: Id,
    loadMore?: boolean,
    trigger?: any,
    drop?: boolean
}

// const LAST_EMPTY_RESULT_WAIT_MS = 5 * 60 * 1000;
const LAST_EMPTY_RESULT_WAIT_MS = Config.LAST_EMPTY_RESULT_WAIT_MS;
const LAST_WAIT_MS = Config.LAST_WAIT_MS

@connect((state, ownProps) => ({
    config: state.config,
}))
export default class Feed extends Component<Props, State>  {


    static defaultProps = {
        visibility: 'visible',
        keyExtractor: item => {
            if (!item) {
                if (Config.DEV_TOOLS === 'true') {
                    debugger;
                }
                return null

            }
            return item.id
        },
        // listRef: "feed",
    }

    createdAt: ms;
    firstRenderAt: ms;
    lastFetchFail: number;
    manager: RequestManager = new RequestManager();
    filterNode: Node;
    logger: GLogger;

    constructor(props: Props) {
        super(props);
        this.logger = rootlogger.createLogger('feed' + (props.displayName ? `:${props.displayName}`: ''))
        this.state = {
            initialLoaderVisibility: 'idle',
            decorateLoadMoreCall: props.decorateLoadMoreCall || this._defaultDecorateLoadMoreCall(),
            tempDisplayName: props.displayName,
            isFetchingHead: 'idle',
            isFetchingMore: 'idle',
        }

        this.createdAt = Date.now();
        this.fetchHead();

    }

    _defaultDecorateLoadMoreCall = () => (sections: any[], call: Call) => {

        let lastId
        if (this.props.sections) {
            let last = _.last(this.props.sections)
            let lastItem = _.last(last.data)

            lastId = lastItem && lastItem.id
        }
        else {
            let last = _.last(this.props.data)
            lastId = last.id
        }
        if (lastId) {
            call.addQuery({id_after: lastId})
        }
        else {
            console.warn("Error while forming load more call")
        }
        return call
    }

    componentDidUpdate(prevProps: Props, prevState: State, snapshot: any) {
        // if (Feed.becameVisible(prevProps, this.props)) {
        if (this.isVisible()) {

            let shouldFetch = false
            if (this.props.autoRefreshMs) {
                let events = this.manager.getEvents(this, 'isFetchingHead');
                let lastOk = _.last(events.filter(e=> e.status === 'ok'));
                shouldFetch = !(lastOk && Date.now() < lastOk.date + this.props.autoRefreshMs);

            }
            else {
                shouldFetch = this.state.isFetchingHead === 'idle'
            }

            if (shouldFetch) {
                this.logger.debug("componentDidUpdate: fetchHead")
                this.fetchHead()
            }
            else {
                this.logger.debug("componentDidUpdate: fetchHead skipped")
            }
        }

    }

    static becameVisible(prevProps: Props, props: Props) {
        return props.visibility === 'visible' && props.visibility !== prevProps.visibility;

    }

    shouldComponentUpdate(nextProps: Props, nextState: State) {
        if (!__ENABLE_PERF_OPTIM__) return true;
        if (nextProps.visibility === 'hidden') {
            this.logger.debug('feed component update saved');
            return false;
        }
        return true;
    }


    fetchHead() {
        let trigger = this.hasItems() ? TRIGGER_USER_INDIRECT_ACTION : TRIGGER_USER_DIRECT_ACTION;

        const options = {loadMore: false, trigger};

        const canotFetch = this.cannotFetchReason('isFetchingHead', options);

        if (canotFetch === null) {
            this.logger.debug('posting first fetch')
            this.fetchIt(options)
        }
        else {
            //this.logger.debug(`postFetchFirst was not performed: reason=${canotFetch}`);
        }
    }

    render() {

        const name = this.props.displayName
        if (name) {
            BugsnagManager.leaveBreadcrumb(name, {type: 'render feed'});
        }

        //assertUnique(this.getFlatItems())

        const {
            sections,
            data,
            style,
            renderItem,
            fetchSrc,
            hasMore,
            ListEmptyComponent,
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
            if (this.manager.isSending('isFetchingHead', this)) return <FullScreenLoader/>
            if (this.manager.isFail('isFetchingHead', this)) return this.renderFail(()=>this.tryFetchIt())
            if (this.state.isFetchingHead === 'idle' && fetchSrc) return null


            //FIX: this line would ignore header & footer + empty component (comments ActivityDescription on 1st comment)
            // if (this.manager.isSuccess('isFetchingHead', this)) return this.renderEmpty()

            // if (!ListFooterComponent && !ListHeaderComponent) {
            //     this.logger.warn("rendering hole", this.state)
            //     return this.renderEmpty()
            // }
        }

        const filter = this.props.filter;
        if (filter) {
            items = filter.applyFilter(items);
        }

        const style1 = [style];
        if ((this.state.isFetchingHead === 'sending' || this.state.isFetchingHead === 'idle') && !this.hasItems()) style1.push({minHeight: 150});


        const someCondition = this.state.isFetchingHead !== 'sending' && this.state.isFetchingHead !== 'idle' || this.hasItems()
        let params =  {
            ref: listRef,
            renderItem,
            key: "feed-list",
            refreshControl: this.renderRefreshControl(),
            onEndReached: this.onEndReached.bind(this),
            onEndReachedThreshold: 0.1,
            style: style1,
            ListHeaderComponent: someCondition && ListHeaderComponent,
            ListEmptyComponent: (filter && filter.token) ? filter.emptyFilterResult(filter.token) : ListEmptyComponent,
            ListFooterComponent: someCondition && this.renderFetchMoreLoader(ListFooterComponent),
            renderSectionHeader: someCondition && renderSectionHeader,
            onScroll: this._handleScroll,
            onScrollBeginDrag: Keyboard.dismiss,
            keyboardShouldPersistTaps: 'always',

            ...attributes,
        };

        if (sections) return <SectionList sections={items} {...params} />
        else return <FlatList data={items} {...params} />
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
        if (this.debugOnlyEmptyFeeds()) return []
        if (this.props.getFlatItems) return this.props.getFlatItems()
        const sections = this.props.sections
        if (sections) {
            let datas = sections.map(s => s.data)
            return Array.prototype.concat.apply([], datas)
        }
        else return this.props.data

    }

    getItems() {
        if (this.debugOnlyEmptyFeeds()) return [];
        return this.props.sections || this.props.data || []
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

    isFetchingHead() {
        return this.state.isFetchingHead === 'sending';
    }

    isFetchingMore() {
        return this.state.isFetchingMore === 'sending';
    }

    lastEvent: any;

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
                    this.logger.debug("Only " + remainingRows + " left. Prefetching...");
                }
            }
        }
    }

    onEndReached() {
        if (this.gentleFetchMore()) {
            this.logger.debug("onEndReached => fetching more");
        }
    }

    gentleFetchMore() {
        if (this.hasMore()) {
            return this.fetchMore({trigger: TRIGGER_USER_INDIRECT_ACTION});
        }
        else {
            this.logger.debug("== end of feed ==");
            return false;
        }
    }

    canFetch(requestName: string = 'isFetchingHead', options: FeedFetchOption = {loadMore: false}): boolean {
        const reason = this.cannotFetchReason(requestName, options);
        if (reason) {
            // this.logger.debug(`cannot fetch: ${reason}`)
        }
        return reason === null
    }


    cannotFetchReason(requestName: string = 'isFetchingHead', options: FeedFetchOption = {loadMore: false}): string  | null {
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
                    // this.this.logger.debug("debounced fetch: recent failure");
                    return "debounced: recent failure";
                }
            }

            //if recent (5min) result with no data, do not refetch now
            {
                let lastEmpty = _.last(events)

                if (lastEmpty && Date.now() < lastEmpty.date + LAST_EMPTY_RESULT_WAIT_MS) {
                    return "debounced: recent empty";
                }
            }
            //if super recent (5sec), do not refetch now
            {
                let last = _.last(events.filter(e=> _.get(e, 'options.emptyResult')));


                if (last && Date.now() < last.date + LAST_WAIT_MS) {
                    return "debounced: recent too recent";
                }
            }
        }
        return null;
    }

    tryFetchIt(options?: FeedFetchOption = {loadMore: false}) {
        let {loadMore} = options;
        let requestName = loadMore ? 'isFetchingMore' : 'isFetchingHead';
        if (this.canFetch(requestName, options)) {
            this.fetchIt(options)
            return true;
        }
        return false;
    }

    fetchIt(options?: FeedFetchOption = {}) {
        let {loadMore, trigger, drop} = options;
        let requestName = loadMore ? 'isFetchingMore' : 'isFetchingHead';

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
                    this.state.decorateLoadMoreCall(this.props.sections || this.props.data, call);
                }
            }
            if (trigger === undefined) {
                trigger = loadMore ? TRIGGER_USER_INDIRECT_ACTION : TRIGGER_USER_DIRECT_ACTION;
            }

            this.props
                .dispatch(call.createActionDispatchee(fetchSrc.action, {trigger, ...fetchSrc.options, mergeOptions: {drop, hasLess: !!loadMore}}))
                .then(({data, links})=> {
                    this.logger.debug("disptachForAction" + JSON.stringify(this.props.fetchSrc.action));
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
                    this.logger.warn("feed error:", err);
                    this.lastFetchFail = Date.now();
                    reqTrack.fail()
                    // this.setState({[requestName]: 'ko'});
                    // reject(err);
                    // this.this.logger.warn("test::finsih")

                })
                .then(this.props.fetchSrc.onFetch)
        });
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
        let displayLoader = (this.isFetchingHead() && !this.hasItems()) || this.state.isPulling;
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
                    !this.props.doNotDisplayFetchMoreLoader && (<Spinner style={{alignSelf: 'center'}} size={40} type={__IS_IOS__ ? "Arc" : "WanderingCubes"} color={Colors.grey3}/>)
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
