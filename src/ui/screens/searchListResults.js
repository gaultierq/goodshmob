// @flow

import type {Node} from 'react'
import React, {Component} from 'react'
import type {SearchState} from "../../helpers/SearchHelper"
import {FlatList, Keyboard, StyleSheet, Text, View} from "react-native"
import {FullScreenLoader} from "../UIComponents"
import {Colors} from "../colors"
import Button from 'apsl-react-native-button'


export type Props = {
    searchState: SearchState,
    renderItem: any => Node,
    onLoadMore?: () => void
}

export type State = {}

export default class SearchListResults extends Component<Props, State> {

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

    render() {
        let searchState = this.props.searchState || {}
        if (searchState.requestState === 'sending' && searchState.page === 0) return <FullScreenLoader/>
        if (searchState.requestState === 'ko')
            return <Text style={{alignSelf: "center", marginTop: 20}}>{i18n.t("errors.generic")}</Text>
        if (searchState.data && searchState.data.length === 0) {
            return <Text style={{alignSelf: "center", marginTop: 20}}>{i18n.t("lineups.search.empty")}</Text>
        }


        const data = _.flatten(searchState.data)

        if (data.length === 0 ) {
            return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <Text>{i18n.t("lineups.search.empty")}</Text>
            </View>
        }

        return (
            <FlatList
                data={data}
                renderItem={this.props.renderItem}
                ListFooterComponent={() => this.props.onLoadMore ? this.renderSearchFooter(searchState) : null}
                keyExtractor={(item) => item.id}
                onScrollBeginDrag={Keyboard.dismiss}
                keyboardShouldPersistTaps='always'/>
        )
    }

}
