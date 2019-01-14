import {StyleSheet, View} from "react-native"
import {Colors} from "../ui/colors"
import {GoodshContext, TRANSPARENT_SPACER} from "../ui/UIComponents"
import GTouchable from "../ui/GTouchable"
import {openLinkSafely} from "../managers/Links"
import React from "react"
import {createDetailsLink} from "../ui/activity/activityDetail"
import GImage from "../ui/components/GImage"
import {GAvatar} from "../ui/GAvatar"

export const SPACER = 6

export function calcGridLayout(width: number, numColumns: number) {
    // if (this.state.renderType !== 'grid') throw "bad layout"
    let cellWidth = (width + SPACER) / numColumns - SPACER
    return {
        numColumns,
        cellWidth,
        cellHeight: cellWidth,
        ItemSeparatorComponent: TRANSPARENT_SPACER(SPACER)
    }
}

const gridStyles = {}

export function obtainGridStyles(layout: any) {
    const width = layout.cellWidth
    const height = layout.cellHeight
    const key = `${width}x${height}`

    let res = gridStyles[key]
    if (res) return res
    res = StyleSheet.create({
        gridCellL: {
            marginLeft: 0,
            marginRight: SPACER / 2,

        },
        gridCellCommon: {
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: Colors.greying,

        },
        gridCellR: {
            marginLeft: SPACER / 2,
            marginRight: 0,
        },
        gridImg: {
            width: width,
            height: height,
            backgroundColor: Colors.white,
            alignSelf: 'center',
            alignItems: 'center',
        },
    })
    gridStyles[key] = res
    return res
}

export let gridCellPositioningStyle = (gridStyles, index, layout) => [gridStyles.gridCellCommon, index === 0 ? gridStyles.gridCellL : index === layout.numColumns ? gridStyles.gridCellR : null]

export const renderItemGridImage = (resource, gridStyles) => (
    <GImage
        source={{uri: _.get(resource, 'image'),}}
        style={[gridStyles.gridImg]}
        resizeMode='cover'
        fallbackSource={require('../img/goodsh_placeholder.png')}/>
)

export function savingForGridRenderer2(
    {width, columns} = {width: __DEVICE_WIDTH__, columns: 3},
    onPress = item => () => openLinkSafely(createDetailsLink(item.id, item.type))
) {

    const layout = calcGridLayout(width, columns)
    const gridStyles = obtainGridStyles(layout)
    let displayAuthor = (left, right) => !!left && !!right && left !== right
    return ({index, item}) => {
        let resource = _.get(item, 'resource')

        return (
            <GoodshContext.Consumer>
                {({userOwnResources, resourceOwnerId}) => (
                    <GTouchable
                        key={`lineup.grid.${index}`}
                        style={gridCellPositioningStyle(gridStyles, index, layout)}
                        onPress={onPress(item)}>
                        <View>
                            {renderItemGridImage(resource, gridStyles)}
                            {(!userOwnResources || displayAuthor(_.get(item, 'user.id'), resourceOwnerId)) && (
                                <GAvatar seeable person={item.user} size={30}
                                         style={{
                                             position: 'absolute',
                                             bottom: 5, right: 5}}/>
                            )}
                        </View>
                    </GTouchable>
                )}
            </GoodshContext.Consumer>
        )
    }
}

