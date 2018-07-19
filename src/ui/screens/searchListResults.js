// @flow

import type {Node} from 'react'
import React, {Component} from 'react'
import type {SearchState} from "../../helpers/SearchHelper"
import {FlatList, Keyboard, Text, View} from "react-native"
import {FullScreenLoader} from "../UIComponents"


export type Props = {
    searchState: SearchState,
    renderItem: any => Node,
}

export type State = {}

export default class SearchListResults extends Component<Props, State> {

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
            <View style={{flex: 1}}>
                <FlatList
                    data={data}
                    renderItem={this.props.renderItem}
                    //FIXME: restore
                    //ListFooterComponent={() => this.renderSearchFooter(searchState)}
                    keyExtractor={(item) => item.id}
                    onScrollBeginDrag={Keyboard.dismiss}
                    keyboardShouldPersistTaps='always'/>
            </View>
        )
    }

}
