//@flow

import type {Node} from 'react';
import React, {Component} from 'react';
import {ActivityIndicator, TouchableWithoutFeedback, BackHandler, FlatList, RefreshControl, SectionList, Text, View, Keyboard} from 'react-native';
import {connect} from "react-redux";
import {assertUnique} from "../../helpers/DataUtils";
import ApiAction from "../../helpers/ApiAction";
import * as Api from "../../managers/Api";
import {TRIGGER_USER_DIRECT_ACTION, TRIGGER_USER_INDIRECT_ACTION} from "../../managers/Api";
import {isEmpty} from "lodash";
import type {i18Key, ms, RequestState, Url} from "../../types";
import {NavStyles, renderSimpleButton} from "../UIStyles";
import {SearchBar} from 'react-native-elements'

import type {ScreenVisibility} from "./Screen";
import {Colors} from "../colors";
import Fuse from 'fuse.js'
import {getLanguages} from 'react-native-i18n'
import {RequestManager} from "../../managers/request";
import {createConsole} from "../../helpers/DebugUtils";
import Spinner from 'react-native-spinkit';
import GSearchBar from "../GSearchBar";
import Config from "react-native-config"
import {FullScreenLoader} from "../UIComponents";
import GTouchable from "../GTouchable";

export type FeedSource = {
    callFactory: ()=>Api.Call,
    useLinks:? boolean,
    action: ApiAction,
    options?: any
}

export type Props<T> = {
    data: Array<T>,
    renderItem: Function,
    fetchSrc: FeedSource,
    hasMore: boolean,
    ListHeaderComponent?: Node,
    ListFooterComponent?: Node,
    empty: Node,
    style: any,
    scrollUpOnBack?: ()=>boolean,
    cannotFetch?: boolean,
    visibility: ScreenVisibility,
    filter?: ?FilterConfig<T>,
    initialLoaderDelay?: ?ms,
    displayName?: string,
    doNotDisplayFetchMoreLoader: ?boolean
};

export type FilterConfig<T> = {
    placeholder: i18Key,
    onSearch: string => void,
    emptyFilterResult: string => Node,
    style: *,
    applyFilter: (Array<T>, string) => Array<T>
};

type State = {
    isFetchingFirst?: RequestState,
    isFetchingMore?: RequestState,
    firstLoad?: RequestState,
    isPulling?: boolean,
    lastEmptyResultMs?: number,
    moreLink?: Url,
    filter?:? string
};


// const LAST_EMPTY_RESULT_WAIT_MS = 5 * 60 * 1000;
const LAST_EMPTY_RESULT_WAIT_MS = Config.LAST_EMPTY_RESULT_WAIT_MS;

@connect((state, ownProps) => ({
    config: state.config,
}))
export default class Feed<T> extends Component<Props<T>, State>  {


    static defaultProps = {
        visibility: 'unknown',
        keyExtractor: item => item.id,
        initialLoaderDelay: 0
    };

    state = {initialLoaderVisibility: 'idle', firstLoad: 'idle'};
    createdAt: ms;
    firstRenderAt: ms;
    firstLoaderTimeout: number;
    _listener: ()=>boolean;
    lastFetchFail: number;
    manager: RequestManager = new RequestManager();
    logger: *;
    filterNode;

    constructor(props: Props<T>) {
        super(props);
        this.logger = props.displayName && createConsole(props.displayName) || console;
        this.createdAt = Date.now();
        // this.postFetchFirst();
    }

    componentWillReceiveProps(nextProps: Props<*>) {
        if (__ENABLE_BACK_HANDLER__ && this.props.scrollUpOnBack !== nextProps.scrollUpOnBack) {
            let scrollUpOnBack = nextProps.scrollUpOnBack;
            if (scrollUpOnBack) {
                this.logger.info("Feed listening to back navigation");

                this._listener = () => {
                    this.logger.info("Feed onBackPressed");
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
        if (!__ENABLE_PERF_OPTIM__) return true;
        if (nextProps.visibility === 'hidden') {
            this.logger.debug('feed component update saved');
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
            if (this.state.firstLoad !== 'idle') {
                this.logger.debug(`postFetchFirst was not performed, firstLoad=${this.state.firstLoad}`);
                return;
            }
            let trigger = this.hasItems() ? TRIGGER_USER_INDIRECT_ACTION : TRIGGER_USER_DIRECT_ACTION;
            const options = {trigger};

            const canotFetch = this.cannotFetchReason('isFetchingFirst', options);

            if (canotFetch === null) {

                Api.safeExecBlock.call(
                    this,
                    () => this.fetchIt(options),
                    'firstLoad'
                );
            }
            else {
                this.logger.debug(`postFetchFirst was not performed: reason=${canotFetch}`);
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
            ...attributes
        } = this.props;

        if (!this.firstRenderAt) this.firstRenderAt = Date.now();

        let items = this.getItems();

        let nothingInterestingToDisplay = !this.hasItems() && this.manager.isSuccess('isFetchingFirst', this);

        let firstEmptyLoader = (this.state.firstLoad === 'sending' || this.state.firstLoad === 'idle') && !this.hasItems();

        const isFirstRenderRecent = this.firstRenderAt + this.props.initialLoaderDelay > Date.now();

        let displayFirstLoader = firstEmptyLoader || this.props.initialLoaderDelay && isFirstRenderRecent;

        if (this.props.initialLoaderDelay && isFirstRenderRecent) {
            if (this.props.visibility === 'visible' && !this.firstLoaderTimeout) {
                this.logger.debug("first timer force update posted");
                this.firstLoaderTimeout = setTimeout(() => {
                    this.logger.debug("first timer force update triggered");
                    this.forceUpdate();
                }, this.props.initialLoaderDelay);
            }
        }

        if (displayFirstLoader) {
            return <FullScreenLoader/>;
            // return <View style={{
            //     flex:1, width: "100%", height: "100%", alignItems: 'center', justifyContent: 'center',
            //     position: 'absolute', zIndex: 1000
            // }}>
            //     <Spinner
            //         // style={styles.spinner}
            //         isVisible={true}
            //         size={__DEVICE_WIDTH__ / 5}
            //         type={this.type}
            //         color={this.color}/>
            // </View>
        }


        let allViews = [];
        if (nothingInterestingToDisplay) {
            if (this.manager.isFail('isFetchingFirst', this)) {
                return this.renderFail(()=>this.tryFetchIt());
            }
            if (empty) return this.renderEmpty();
        }

        const filter = this.props.filter;
        if (filter) {
            allViews.push(this.renderSearchBar(filter));
            if (this.state.filter) {

                items = filter.applyFilter(items, this.state.filter);
                if (_.isEmpty(items)) {
                    allViews.push(filter.emptyFilterResult(this.state.filter));
                }
            }
        }

        const style1 = [style];
        if (firstEmptyLoader) style1.push({minHeight: 150});
        // if (filter
        //     && _.isEmpty(this.state.filter) && this.state.isFilterFocused) {
        //     style1.push({opacity: 0.4})
        // }
        let params =  {
            ref: "feed",
            renderItem,
            // keyExtractor: this.keyExtractor,
            key: "feed-list",
            refreshControl: this.renderRefreshControl(),
            onEndReached: this.onEndReached.bind(this),
            onEndReachedThreshold: 0.1,
            ListFooterComponent: !firstEmptyLoader && this.renderFetchMoreLoader(ListFooterComponent),
            style: style1,
            ListHeaderComponent: !firstEmptyLoader && ListHeaderComponent,
            renderSectionHeader: !firstEmptyLoader && renderSectionHeader,
            onScroll: this._handleScroll,
            onScrollBeginDrag: Keyboard.dismiss,
            keyboardShouldPersistTaps: 'always',
            ...attributes
        };

        let listNode;
        if (sections) {
            // allViews.push(React.createElement(SectionList, {sections: items, ...params}));
            listNode = React.createElement(SectionList, {sections: items, ...params});
        }
        else {
            // allViews.push(React.createElement(FlatList, {data: items, ...params}));
            listNode = React.createElement(FlatList, {data: items, ...params});
        }
        allViews.push(<View style={{flex:1}}>
            {listNode}
            {filter && _.isEmpty(this.state.filter) && this.state.isFilterFocused && this.renderSearchOverlay()}
        </View>);


        return <View style={[this.props.style, {flex: 1}]}>{allViews}</View>
    }

    renderSearchOverlay() {
        return (<TouchableWithoutFeedback onPress={() => this.filterNode.blur()}>
                <View style={{
                    position: 'absolute', width: '100%', height: '100%', opacity: 0.4,
                    backgroundColor: Colors.black, zIndex: 50,}} />
            </TouchableWithoutFeedback>
        );
    }

    isFiltering() {
        return !!this.state.filter;
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

    renderSearchBar(filter: FilterConfig<T>){

        let {onSearch, style, placeholder} = filter;

        let font = {
            fontSize: 16,
            lineHeight: 22,
            textAlign: 'left',
        };

        // const color = Colors.grey142;
        // //TODO: adjust fr, en margins
        // //TODO: center placeholder ! https://github.com/agiletechvn/react-native-search-box
        // const placeholderConfig = {
        //     placeholder: i18n.t(placeholder),
        //     //TOREMOVE
        //     placeholderCollapsedMargin: this.isFrenchLang ? 95 : 65,
        //     //TOREMOVE
        //     searchIconCollapsedMargin: this.isFrenchLang ? 110 : 80,
        // };

        return (
            <View key={'searchbar_container'} style={[style]}>

                <GSearchBar
                    textInputRef={r=>this.filterNode = r}
                    // lightTheme
                    onChangeText={filter => this.setState({filter})}
                    onClearText={()=>this.setState({filter: null})}
                    placeholder={i18n.t(placeholder)}
                    // autoCapitalize='none'
                    clearIcon={!!this.state.filter && {color: '#86939e'}}
                    // containerStyle={{backgroundColor: NavStyles.navBarBackgroundColor, marginTop:0 ,marginBottom: 0, borderBottomWidth: 0, borderTopWidth: 0,}}
                    // inputStyle={{backgroundColor: Colors.greying, textAlign: 'center', marginBottom: 5, fontSize: 15}}
                    // autoCorrect={false}
                    style={{margin: 0,}}
                    // returnKeyType={'search'}
                    onClearText={() => {
                        this.filterNode.blur();
                    }}
                    value={this.state.filter}
                    onFocus={()=>this.setState({isFilterFocused:true})}
                    onBlur={()=>this.setState({isFilterFocused:false})}

                />
            </View>
        );
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

    canFetch(requestName: string = 'isFetchingFirst', options: * = {}): boolean {
        return this.cannotFetchReason(requestName, options) === null;
    }


    cannotFetchReason(requestName: string = 'isFetchingFirst', options: * = {}): string  | null {
        if (this.isFiltering()) return "filtering list";

        if (this.notFetchable()) return this.notFetchable();

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

    //doesnt depend on any state
    notFetchable() {
        if (this.props.cannotFetch) return "cannot fetch";
        if (!this.props.fetchSrc) return "no fetch sources";
        return null;
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
        let {afterId, trigger, drop} = options;
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
            if (afterId && this.state.moreLink) {
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
                .dispatch(call.disptachForAction2(fetchSrc.action, {trigger, ...fetchSrc.options, mergeOptions: {drop}}))
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
                        && (afterId || !this.state.moreLink)
                    ) {

                        this.setState({moreLink: links.next});
                    }
                    resolve(data);
                }, err => {
                    this.logger.warn("feed error:" + err);
                    this.lastFetchFail = Date.now();
                    reqTrack.fail();
                    reject(err);
                    // this.setState({[requestName]: 'ko'});
                })
        });
    }

    fetchMore(options ?: any = {}) {
        let last = this.getLastItem();
        if (last) {
            const lastId = this.props.keyExtractor(last);
            if (!lastId) throw "no id found for this item:" + JSON.stringify(last);
            return this.tryFetchIt({afterId: lastId, ...options});
        }
        return false;
    }

    onRefresh() {
        if (this.state.isPulling) return;
        this.setState({isPulling: true});

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
