import React, {Component} from 'react';
import {
    ActivityIndicator,
    Animated,
    Easing,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import {CheckBox, SearchBar} from 'react-native-elements'
import GTouchable from "../GTouchable";
import {Colors} from "../colors";
import {NavStyles, SEARCH_INPUT_PROPS, SEARCH_INPUT_RADIUS, SEARCH_STYLES, SEARCH_STYLES_OBJ} from "../UIStyles";
import Icon from 'react-native-vector-icons/MaterialIcons';


export type SearchPlacesProps = {
    aroundMe: ?boolean,
    onNewOptions: any => void,
    onSearchSubmited: void => void
};

type SearchPlacesState = {
    aroundMe: boolean,
    city: string,
    focus: boolean
};

export class SearchPlacesOption extends Component<SearchPlacesProps, SearchPlacesState> {

    input;
    animation;

    static defaultProps = {
        aroundMe: true,
    };

    constructor(props) {
        super(props);
        const aroundMe = !!props.aroundMe;
        this.state = {aroundMe};
        this.animation = new Animated.Value(0);
        props.onNewOptions(this.state);
        this.toggleAroundMe(aroundMe);
    }

    render() {

        const radius = SEARCH_INPUT_RADIUS;
        const inputFlex = this.animation.interpolate({inputRange: [0, 1], outputRange: [1, 0]});
        const inputAroundMe = this.animation.interpolate({inputRange: [0, 1], outputRange: [0, 1]});
        const opacity = this.animation.interpolate({inputRange: [0, 1], outputRange: [0, 1]});
        const paddingLeft = this.animation.interpolate({inputRange: [0, 1], outputRange: [10, 0]});
        const color2 = this.animation.interpolate({inputRange: [0, 1], outputRange: ['rgba(235, 235, 235, 1)', 'rgba(235, 235, 235, 0)']});
        const radius2 = this.animation.interpolate({inputRange: [0, 1], outputRange: [radius, 0]});


        const darkerBackgroundColor = "#E1E1E1";
        const lighterBackgroundColor = _.get(SEARCH_STYLES_OBJ, 'searchInput.backgroundColor') || Colors.greying;


        return (
            <View style={{
                backgroundColor: NavStyles.navBarBackgroundColor,
                flex: 0,
                flexDirection: 'row',
                paddingLeft: __IS_IOS__ ? 16 : 80,
                paddingRight: __IS_IOS__ ? 16 : 8,
                paddingVertical: 8,
            }}>

                <Animated.View style={{
                    flex: 1,
                    flexDirection: 'row',
                    // paddingLeft,
                    // paddingHorizontal: 4,
                }}>
                    {/* input block */}
                    <Animated.View style={{
                        flex: inputFlex,
                        flexDirection: 'row',

                    }}>

                        <Animated.View style={{
                            flex: 1,
                            // paddingVertical: 4,
                            backgroundColor: lighterBackgroundColor,
                            borderTopLeftRadius: radius,
                            borderBottomLeftRadius: radius,
                            paddingHorizontal: paddingLeft,
                        }}>
                            <TextInput
                                ref={input=>this.input = input}
                                onSubmitEditing={() => this.props.onSearchSubmited()}
                                onClearText={() => this.setStateAndNotify({city: ""})}
                                placeholder={"Paris, London, New-York..."}
                                onFocus={()=>this.setState({focus:true})}
                                onBlur={()=>this.setState({focus:false})}
                                // placeholderTextColor={SEARCH_PLACEHOLDER_COLOR}
                                {...SEARCH_INPUT_PROPS}
                                style={[SEARCH_STYLES.searchInput,]}
                                value={this.state.city}
                                onChangeText={city=> {
                                    this.setStateAndNotify({city})
                                }}
                            />
                        </Animated.View>

                    </Animated.View>


                    <Animated.View style={{
                        // flex: 0,
                        zIndex: 1,
                        // flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: color2,
                        borderTopRightRadius: radius,
                        borderBottomRightRadius: radius,
                    }}>
                        <Animated.View style={{
                            flex: 1,
                            zIndex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: 8,
                            backgroundColor: darkerBackgroundColor,
                            borderTopLeftRadius: radius,
                            borderBottomLeftRadius: radius,
                            borderRadius: radius2,

                            // backgroundColor: 'pink',
                        }}>
                            <GTouchable

                                onPress={()=>{
                                    this.toggleAroundMe(true);
                                }}>
                                <Icon name="gps-fixed" size={18} color={Colors.greyishBrown}/>
                            </GTouchable>

                        </Animated.View>
                    </Animated.View>
                    {/* text */}
                    <Animated.View style={{
                        flex: inputAroundMe,
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: darkerBackgroundColor,
                        // marginRight: 18,
                        // backgroundColor: 'red',
                        borderTopRightRadius: radius,
                        borderBottomRightRadius: radius,
                    }}>


                        <Text
                            numberOfLines={1}
                            style={{
                                color: Colors.brownishGrey,
                                flex: 1,
                                singleLine: true,
                                backgroundColor: 'transparent',
                            }}>{i18n.t("search_item_screen.search_options.around_me")}

                        </Text>



                    </Animated.View>

                    {/*cross*/}
                    <Animated.View
                        style={{
                            // flex: 0,
                            position: 'absolute',
                            right: 0,
                            zIndex: 0,
                            alignSelf: 'center',
                            // flexDirection: 'row',

                            opacity,
                            // alignItems: 'center',
                            backgroundColor: 'transparent',
                            // backgroundColor: 'red',
                        }}
                    >
                        <GTouchable
                            style={{
                                padding: 12
                            }}
                            onPress={()=>{
                                this.toggleAroundMe(false);
                            }}>
                            <Icon name="close" size={15} color={Colors.greyishBrown}
                                // style={{flex:1}}
                            />
                        </GTouchable>
                    </Animated.View>



                </Animated.View>
            </View>
        );
    }

    toggleAroundMe(aroundMe: boolean) {
        this.setStateAndNotify({aroundMe});
        Animated.timing(
            this.animation,
            {
                toValue: aroundMe ? 1 : 0,
                easing: Easing.cubic,
                duration: 400,

            }
        ).start();

    }

    setStateAndNotify(newState) {
        this.setState(newState, () => this.props.onNewOptions(this.state));
    }
}