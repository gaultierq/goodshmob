//@flow

import React, { Component } from 'react';
import type {Id, RNNNavigator, SearchToken} from "../../types";
import {
    Text,
    TouchableWithoutFeedback,
    TouchableOpacity,
    TextInput,
    Animated,
    Dimensions,
    Keyboard,
    Image,
    View,
    ViewPropTypes
} from 'react-native';
import {Colors} from "../colors"

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
const containerHeight = 40;

type State = {
    keyword: string,
    expanded: boolean,
    cancelButtonWidth: number,
};

export type Props = {
    /**
     * onFocus
     * return a Promise
     * beforeFocus, onFocus, afterFocus
     */
    beforeFocus?: Function,
    onFocus?: Function,
    afterFocus?: Function,
    onBlur?: Function,

    /**
     * onSearch
     * return a Promise
     */
    beforeSearch?: Function,
    onSearch?: Function,
    afterSearch?: Function,

    /**
     * onChangeText
     * return a Promise
     */
    onChangeText?: Function,

    /**
     * onCancel
     * return a Promise
     */
    beforeCancel?: Function,
    onCancel?: Function,
    afterCancel?: Function,

    /**
     * async await
     * return a Promise
     * beforeDelete, onDelete, afterDelete
     */
    beforeDelete?: Function,
    onDelete?: Function,
    afterDelete?: Function,

    /**
     * styles
     */
    backgroundColor?: string,
    titleCancelColor?: string,
    tintColorSearch?: string,
    tintColorDelete?: string,
    inputStyle?: any,
    direction?: any,
    cancelButtonStyle?: any,
    onLayout?: Function,
    cancelButtonTextStyle?: any,

    cancelButtonViewStyle?: any,

    /**
     * text input
     */
    placeholder?: string,
    cancelTitle?: any,
    iconDelete?: Object,
    iconSearch?: Object,
    returnKeyType?: string,
    keyboardType?: string,
    autoCapitalize?: string,
    inputHeight?: number,
    inputBorderRadius?: number,
    contentWidth?: number,
    editable?: boolean,
    blurOnSubmit?: boolean,
    keyboardShouldPersist?: boolean,
    useClearButton?: boolean,
    textInputRef?: Function,
    cancelFunctionRef?: Function,
    autoFocus?: boolean,
    cancelTitle?: string,

    /**
     * Positioning
     */
    positionRightDelete?: number,
    searchIconCollapsedMargin?: number,
    searchIconExpandedMargin?: number,
    placeholderCollapsedMargin?: number,
    placeholderExpandedMargin?: number,


};

// Important: padding must be handled in the SearchBar component, otherwise the animation is ugly
class Search extends Component<Props, State> {
    contentWidth: number
    onFocus: Function
    onSearch: Function
    onChangeText: Function
    onCancel: Function
    cancelTitle: Function
    placeholder: string
    middleWidth: number
    autoFocus: boolean
    cancelTitle: string
    inputFocusWidthAnimated: AnimatedValue


    static defaultProps = {
        editable: true,
        blurOnSubmit: true,
        keyboardShouldPersist: false,
        searchIconCollapsedMargin: 25,
        searchIconExpandedMargin: 10,
        placeholderCollapsedMargin: 15,
        placeholderExpandedMargin: 20,

        useClearButton: true,
        direction: 'ltr',
        positionRightDelete: 10,
    };

    constructor(props: Props) {
        super(props);

        this.state = {
            keyword: '',
            expanded: false,
            cancelButtonWidth: 90,
        };
        const { width } = Dimensions.get('window');
        this.contentWidth = width;

        /**
         * Animated values
         */
        this.inputFocusWidthAnimated = new Animated.Value(this.contentWidth - 10);
        /**
         * functions
         */
        this.onFocus = this.onFocus.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.onChangeText = this.onChangeText.bind(this);
        this.onCancel = this.onCancel.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.focus = this.focus.bind(this);
        this.expandAnimation = this.expandAnimation.bind(this);
        this.collapseAnimation = this.collapseAnimation.bind(this);
        this.onLayout = this.onLayout.bind(this);

        /**
         * local variables
         */
        this.placeholder = this.props.placeholder || 'Search Search' ;
        this.cancelTitle = this.props.cancelTitle || 'Cancel';
        this.autoFocus =  this.props.autoFocus || false;


    }

    componentDidMount() {
        if(this.autoFocus) {
            this.setState({expanded: true})
            this.refs.input_keyword._component.focus();
        }
        this.props.cancelFunctionRef && this.props.cancelFunctionRef(this.onCancel)
    }

    onLayout = (event : any) => {
        const contentWidth = event.nativeEvent.layout.width;
        this.contentWidth = contentWidth;
        this.middleWidth = contentWidth / 2;
        if (this.state.expanded) {
            this.expandAnimation();
        } else {
            this.collapseAnimation();
        }
    };

    /**
     * onSearch
     * async await
     */
    onSearch = async () => {
        this.props.beforeSearch &&
        (await this.props.beforeSearch(this.state.keyword));
        if (this.props.keyboardShouldPersist === false) {
            await Keyboard.dismiss();
        }
        this.props.onSearch && (await this.props.onSearch(this.state.keyword));
        this.props.afterSearch &&
        (await this.props.afterSearch(this.state.keyword));
    };

    /**
     * onChangeText
     * async await
     */
    onChangeText = async (text : string) => {
        await this.setState({ keyword: text });
        this.props.onChangeText &&
        (await this.props.onChangeText(this.state.keyword));
    };

    /**
     * onFocus
     * async await
     */
    onFocus = async () => {
        this.props.beforeFocus && (await this.props.beforeFocus());
        this.refs.input_keyword._component.isFocused &&
        (await this.refs.input_keyword._component.focus());
        await this.setState(prevState => {
            return { expanded: !prevState.expanded };
        });
        await this.expandAnimation();
        this.props.onFocus && (await this.props.onFocus(this.state.keyword));
        this.props.afterFocus && (await this.props.afterFocus());
    };

    /**
     * focus
     * async await
     */
    focus = async (text : string = '') => {
        await this.setState({ keyword: text });
        await this.refs.input_keyword._component.focus();
    };

    /**
     * onDelete
     * async await
     */
    onDelete = async () => {
        this.props.beforeDelete && (await this.props.beforeDelete());
        await this.setState({ keyword: '' });
        this.onChangeText('')

        this.props.onDelete && (await this.props.onDelete());
        this.props.afterDelete && (await this.props.afterDelete());
        await this.refs.input_keyword._component.focus();

    };

    /**
     * onCancel
     * async await
     */
    onCancel = async () => {
        this.props.beforeCancel && (await this.props.beforeCancel());
        await this.setState({ keyword: '' });
        await this.setState(prevState => {
            return { expanded: !prevState.expanded };
        });
        this.onChangeText('')
        await this.collapseAnimation(true);
        this.props.onCancel && (await this.props.onCancel());
        this.props.afterCancel && (await this.props.afterCancel());
    };

    expandAnimation = () => {
        this.setState({expanded: true})
        return new Promise((resolve, reject) => {
            Animated.parallel([
                Animated.timing(this.inputFocusWidthAnimated, {
                    toValue: this.contentWidth - this.state.cancelButtonWidth - 25,
                    duration: 200
                }).start(),

            ]);
            resolve();
        });
    };

    collapseAnimation = (isForceAnim : boolean = false) => {
        const DURATION = 200;
        this.setState({expanded: false})

        return new Promise((resolve, reject) => {
            Animated.parallel([
                this.props.keyboardShouldPersist === false ? Keyboard.dismiss() : null,
                Animated.timing(this.inputFocusWidthAnimated, {
                    toValue: this.contentWidth - 10,
                    duration: DURATION,
                }).start(),

            ]);
            resolve();
        });
    };

    render() {
        const isRtl = this.props.direction === 'rtl';
        const styles = getStyles(this.props.inputHeight, isRtl);
        return (
            <View
                ref="searchContainer"
                style={[
                    styles.container,
                    this.props.backgroundColor && {
                        backgroundColor: this.props.backgroundColor
                    }
                ]}
                onLayout={this.onLayout}
            >
                <AnimatedTextInput
                    ref={(ref) => {
                        if (!ref) return;
                        this.refs['input_keyword']  = ref;
                        this.props.textInputRef && this.props.textInputRef(ref.getNode())
                    }}
                    style={[
                        styles.input,
                        this.props.placeholderTextColor && {
                            color: this.props.placeholderTextColor
                        },
                        this.props.inputStyle && this.props.inputStyle,
                        this.props.inputHeight && { height: this.props.inputHeight },
                        this.props.inputBorderRadius && {
                            borderRadius: this.props.inputBorderRadius
                        },
                        {
                            width: this.inputFocusWidthAnimated,
                        },

                    ]}
                    editable={this.props.editable}
                    value={this.state.keyword}
                    onChangeText={this.onChangeText}
                    onSubmitEditing={this.onSearch}
                    autoCorrect={false}
                    blurOnSubmit={this.props.blurOnSubmit}
                    returnKeyType={this.props.returnKeyType || 'search'}
                    keyboardType={this.props.keyboardType || 'default'}
                    autoCapitalize={this.props.autoCapitalize}
                    onFocus={this.onFocus}
                    onBlur={this.props.onBlur}
                    underlineColorAndroid="transparent"
                />

                <TouchableWithoutFeedback onPress={this.onFocus}>
                    <View style={[styles.placeholder,
                        this.state.expanded ? {left: 10,} : {right: 0}]}
                          pointerEvents="none">
                        <Image
                            source={require('../../img/search-icon.png')}
                            style={[
                                styles.iconSearch,
                                styles.iconSearchDefault,
                                this.props.tintColorSearch && {
                                    tintColor: this.props.tintColorSearch
                                }
                            ]}
                        />
                        {this.state.keyword.length < 1 &&
                        <View>
                            <Text style={{color: Colors.greyish}}>
                                {this.placeholder}
                            </Text>
                        </View>}


                    </View>
                </TouchableWithoutFeedback>
                <TouchableOpacity onPress={this.onDelete} style={styles.iconDeleteWrapper}>

                    <Image
                        source={require('../../img/delete-icon.png')}
                        style={[
                            styles.iconDelete,
                            {opacity: this.state.keyword.length > 0 ? 100 : 0}
                        ]}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.cancelButtonWrapper}
                    onPress={this.onCancel}>
                    <Animated.View
                        onLayout={ (event) => this.setState({cancelButtonWidth: event.nativeEvent.layout.width})}
                        style={[
                            styles.cancelButton,
                            this.props.cancelButtonStyle && this.props.cancelButtonStyle,
                            this.props.cancelButtonViewStyle && this.props.cancelButtonViewStyle,
                        ]}
                    >
                        <Text
                            style={[
                                styles.cancelButtonText,
                                this.props.cancelButtonStyle && this.props.cancelButtonStyle,
                                this.props.cancelButtonTextStyle && this.props.cancelButtonTextStyle,
                            ]}>
                            {this.cancelTitle}
                        </Text>
                    </Animated.View>
                </TouchableOpacity>
            </View>
        );
    }
}

const getStyles = (inputHeight, isRtl) => {
    let middleHeight = 20
    if (typeof inputHeight == 'number')
        middleHeight = (10 + inputHeight) / 2;

    const iconDeleteSize = 18;
    return {
        container: {
            backgroundColor: 'transparent',
            height: containerHeight,
            flexDirection: isRtl ? 'row-reverse' : 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            padding: 5
        },
        input: {
            height: containerHeight - 10,
            paddingTop: 5,
            paddingBottom: 5,
            paddingRight: iconDeleteSize + 5,
            [isRtl ? 'paddingRight' : 'paddingLeft']: 20,
            textAlign: isRtl ? 'right' : 'left',
            borderColor: '#444',
            backgroundColor: Colors.greying,
            borderRadius: 5,
            fontSize: 13
        },
        placeholderColor: 'grey',
        placeholder: {
            position: 'absolute',
            top: 0,
            left: 0,

            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row'
        },
        iconSearch: {
            height: 14,
            width: 14,
            marginRight: 3,
        },
        iconSearchDefault: {
            tintColor: 'grey'
        },
        iconDelete: {
            height: iconDeleteSize,
            width: iconDeleteSize,
            tintColor: Colors.brownishGrey
        },
        cancelButtonWrapper: {
            left: -10,
        },
        iconDeleteWrapper: {
            left: -24,
        },
        cancelButton: {
            justifyContent: 'center',
            alignItems: isRtl ? 'flex-end' : 'flex-start',
            backgroundColor: 'transparent',
            zIndex: 10,

            height: 50
        },
        cancelButtonText: {
            // Note: overflow: visible does not work on Android, so avoid negative margins
            fontSize: 14,
            color: Colors.brownishGrey
        }
    };
}

export default Search;
