import {StyleSheet} from "react-native"
import {Colors} from "../ui/colors"
import {TRANSPARENT_SPACER} from "../ui/UIComponents"

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
