// @flow

import type {Node} from 'react'
import React from 'react'
import {StyleSheet, Text, TextInput, View,} from 'react-native'
import type {SearchEngine, } from "../../../helpers/SearchHelper"
import {__createSearchItemSearcher, PERMISSION_EMPTY_INPUT} from "../../../helpers/SearchHelper"
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view"
import {LINEUP_PADDING, NAV_BACKGROUND_COLOR} from "../../UIStyles"
import GSearchBar2 from "../../components/GSearchBar2"
import SearchMotor from "../searchMotor"
import SearchListResults from "../searchListResults"
import BlankSearch, {renderBlankIcon} from "../../../ui/components/BlankSearch"
import ItemCell from "../../components/ItemCell"
import GTouchable from "../../GTouchable"
import type {SearchItemCategoryType} from "../../../helpers/SearchConstants"
import {
    calcGridLayout,
    gridCellPositioningStyle,
    obtainGridStyles,
    renderItemGridImage
} from "../../../helpers/GridHelper"
import Icon from "react-native-vector-icons/MaterialIcons"
import {Colors} from "../../colors"

export type SearchItemsGenOptions = {input: string}

type SMS = {
    searchOptions: SearchItemsGenOptions,

}
type SMP = {
    category: SearchItemCategoryType,
    placeholder: string,
    focused?: boolean,
    onItemSelected: () => void
}

export default class SearchGeneric extends React.Component<SMP, SMS> {

    search: SearchEngine<SearchItemsGenOptions>

    layout: any = calcGridLayout(__DEVICE_WIDTH__, 3)

    gridStyles: any = obtainGridStyles(this.layout)

    constructor(props: SMP) {
        super(props)
        this.state = {
            searchOptions: {
                input: '',
            },
        }
        this.search = __createSearchItemSearcher(props.category)
    }

    render() {

        return (
            <View style={{flex: 1}}>
                <GSearchBar2
                    onChangeText={(input: string)  => {this.setState({searchOptions: {...this.state.searchOptions, input}})}}
                    value={_.get(this.state, this.state.searchOptions.input)}
                    style={styles1.searchBar}
                    placeholder={this.props.placeholder}
                    autoFocus={this.props.focused}
                />
                <SearchMotor
                    searchEngine={this.search}
                    renderResults={(state, onLoadMore) => (
                        <SearchListResults
                            searchState={state}
                            numColumns={3}
                            renderItem={({item, index}) => (
                                <GTouchable
                                    style={[gridCellPositioningStyle(this.gridStyles, index, this.layout)]}
                                    onPress={()=> this.props.onItemSelected(item)
                                    }>
                                    {renderItemGridImage(item, this.gridStyles)}
                                </GTouchable>
                            )}
                            keyExtractor={item => item.uid}
                            onLoadMore={onLoadMore}

                        />)}
                    searchOptions={this.state.searchOptions}
                    canSearch={this._canSearch}
                    renderMissingPermission={this._renderMissingPermission}
                />
            </View>
        )
    }

    _canSearch = searchOptions => {
        if (!_.isEmpty(searchOptions.input)) {
            return null
        }
        return PERMISSION_EMPTY_INPUT
    }

    _renderMissingPermission = (searchOptions, missingPermission) => {
        if (missingPermission === PERMISSION_EMPTY_INPUT) {
            return <BlankSearch
                icon={renderBlankIcon(this.props.category)}
                text={i18n.t("search_item_screen.placeholder." + this.props.category)}
            />
        }
        return <View/>
    }
}


const styles1 = StyleSheet.create({
    searchBar: {
        paddingTop: 10,
        paddingBottom: 5,
        paddingHorizontal: LINEUP_PADDING,
    }
})
