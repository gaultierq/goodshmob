//@flow
import React, {Component} from 'react';
import {
    CachedImage,
} from 'react-native-cached-image';

export type Props = {
    fallbackSource: any,
};

type State = {
};


export default class GImage extends Component<Props, State>  {

    render() {
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

