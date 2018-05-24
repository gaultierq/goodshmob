//@flow
import React, {Component} from 'react';
import {Image} from 'react-native';
import {CachedImage} from 'react-native-cached-image';
import Config from 'react-native-config'

export type Props = {
    fallbackSource: any,
};

type State = {
};

const DISABLE_IMAGE_CACHE = Config.DISABLE_IMAGE_CACHE;

export default class GImage extends Component<Props, State>  {

    render() {
        if (DISABLE_IMAGE_CACHE === 'true') {
            return (
                <Image
                    {...this.props}>
                </Image>);
        }

        const defaultFallback = require('../../img/missing-image.png')

        const fallbackSource = this.props.fallbackSource || defaultFallback;
        return (
            <CachedImage
                useQueryParamsInCacheKey={true}
                fallbackSource={fallbackSource}
                activityIndicatorProps={{opacity: 0}}
                {...this.props
                }
            />
        );
    }

}

