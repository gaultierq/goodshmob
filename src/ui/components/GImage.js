//@flow
import React, {Component} from 'react'
import {Image} from 'react-native'
import {CachedImage} from 'react-native-cached-image'
import Config from 'react-native-config'
import {Colors} from "../colors"
import Spinner from "react-native-spinkit"

export type Props = {
    fallbackSource?: any,
};

type State = {
};

const DISABLE_IMAGE_CACHE = Config.DISABLE_IMAGE_CACHE;

const logger = rootlogger.createLogger({group: 'image'})

export default class GImage extends Component<Props, State>  {

    // static defaultProps = {
    //     fallbackSource: require('../../img/missing-image.png')
    // };

    render() {
        // logger.debug("render", this.props)
        if (DISABLE_IMAGE_CACHE === 'true') {
            return (
                <Image
                    {...this.props}>
                </Image>);
        }

        return (
            <CachedImage
                useQueryParamsInCacheKey={true}
                fallbackSource={this.props.fallbackSource}
                activityIndicatorProps={{opacity: 0}}
                loadingIndicator={props => <Spinner style={{alignSelf: 'center'}} type={"Pulse"} color={Colors.greying}/>}
                {...this.props}
            />
        );
    }

}

