//@flow
import React, {Component} from 'react';
import {CachedImage} from "react-native-img-cache";

export type Props = {
};

type State = {
};


export default class GImage extends Component<Props, State>  {

    render() {
        return (
            <CachedImage
                {...this.props}
            />
        );
    }

}

