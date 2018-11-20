// @flow

import type {Node} from 'react'
import React, {Component} from 'react'
import type {SearchState} from "../../helpers/SearchHelper"
import {FlatList, Keyboard, StyleSheet, Text, View} from "react-native"
import {FullScreenLoader, RENDER_EMPTY_RESULT} from "../UIComponents"
import {Colors} from "../colors"
import Button from 'apsl-react-native-button'


export type Props = {
    searchState: SearchState,
    renderItem: any => Node,
    onLoadMore?: () => void,
    EmptyComponent?: ?() => Element<any>
}

export type State = {}

export default class SearchListResults extends Component<Props, State> {

    static defaultProps = {
        keyExtractor: item => item.id,
        EmptyComponent: RENDER_EMPTY_RESULT
    }

    render() {

        const {searchState = {}, onLoadMore, ...attr} = this.props

        // let searchState = this.props.searchState || {}
        if (searchState.requestState === 'sending' && searchState.page === 0) return <FullScreenLoader/>
        if (searchState.requestState === 'ko') return <Text style={styles.text}>{i18n.t("errors.generic")}</Text>
        if (_.flatten(searchState.data).length === 0 ) return this.props.EmptyComponent()

        return (
            <FlatList
                data={_.flatten(searchState.data)}
                // renderItem={this.props.renderItem}
                ListFooterComponent={() => onLoadMore ? this.renderSearchFooter(searchState) : null}
                keyExtractor={this.props.keyExtractor}
                onScrollBeginDrag={Keyboard.dismiss}
                keyboardShouldPersistTaps='always'
                {...attr}
            />
        )
    }

    renderSearchFooter(searchState: SearchState) {
        if (!searchState) return null;
        let nextPage = searchState.page + 1;
        let hasMore = nextPage < (searchState.nbPages || 1);
        if (!hasMore) return null;

        let isLoadingMore = searchState.requestState === 'sending';

        return (<Button
            isLoading={isLoadingMore}
            isDisabled={isLoadingMore}
            onPress={()=>{this.props.onLoadMore && this.props.onLoadMore()}}
            style={{marginTop: 15, padding: 8, borderColor: "transparent",}}
            disabledStyle={{marginTop: 15, padding: 8, borderColor: "transparent",}}>

            <Text style={{color: isLoadingMore ? Colors.greyishBrown : Colors.black}}>{i18n.t('actions.load_more')}</Text>
        </Button>);
    }

}

