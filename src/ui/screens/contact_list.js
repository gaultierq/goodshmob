// @flow
import type {Node} from 'react'
import React from 'react'
import {FlatList, Keyboard, RefreshControl, ScrollView, StyleSheet, Text, View} from 'react-native'
import {connect} from "react-redux"
import {logged} from "../../managers/CurrentUser"
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import BottomSheet from "react-native-bottomsheet"
import i18n from "../../i18n/i18n"
import type {RNNNavigator} from "../../types"
import Contacts from 'react-native-contacts'
import PersonRowI from "../activity/components/PeopleRow"
import {STYLES} from "../UIStyles"
import GButton from "../components/GButton"
import Screen from "../components/Screen"

export type Contact = {
    recordID: string,
    rawContactId: string,
    givenName: string,
    familyName: string,
    thumbnailPath: string,
}

type Props = {
    navigator: RNNNavigator,
    renderItem: any => Node
}

type State = {
    syncing?: boolean
}

const logger = rootlogger.createLogger('contact list')

const SET_CONTACTS = 'SET_CONTACTS'

@logged
@connect((state, ownProps) => ({
    contacts: state.contacts
}))
export default class ContactList extends Screen<Props, State> {

    static defaultProps = {
        renderItem: ({item}) => renderItem(item),
        syncing: false
    }

    state = {
    }

    // constructor() {
    // }

    componentDidMount() {
        const navigator = this.props.navigator
        if (navigator) {
            // this.props.navigator.setButtons({
            //     // ...ActivityDetailScreen.navigatorButtons,
            //     rightButtons: [{
            //         id: 'contact_screen_options',
            //         icon: require('../../img2/moreDotsGrey.png'),
            //         // disableIconTint: true,
            //     }]
            // })


            navigator.addOnNavigatorEvent((event) => {

                if (event.type === 'NavBarButtonPress') {
                    if (event.id === 'contact_screen_options') {
                        BottomSheet.showBottomSheetWithOptions({
                            options: [
                                i18n.t("actions.sync_contact_list"),
                                i18n.t("actions.cancel"),
                            ],
                            title: i18n.t("actions.contact_list_options"),
                            cancelButtonIndex: 1,
                        }, (value) => {
                            switch (value) {
                                case 0:
                                    this.syncContacts()
                                    break;
                            }
                        });
                    }
                }
            })
        }
    }

    componentWillAppear() {
        this.props.navigator.setButtons({
            rightButtons: [{
                id: 'contact_screen_options',
                icon: require('../../img2/moreDotsGrey.png'),
            }]
        })
    }

    componentWillDisappear() {
        this.props.navigator.setButtons({
            rightButtons: []
        })
    }

    render() {
        return (
            <FlatList
                data={this.props.contacts.data}
                renderItem={this.props.renderItem}
                // ListFooterComponent={() => this.props.onLoadMore ? this.renderSearchFooter(searchState) : null}
                keyExtractor={(item) => item.id}
                onScrollBeginDrag={Keyboard.dismiss}
                keyboardShouldPersistTaps='always'
                ListEmptyComponent={(
                    <View>
                        <Text style={STYLES.empty_message}>{i18n.t('contacts.empty_screen')}</Text>
                        <GButton text={i18n.t('contacts.empty_screen_button')} onPress={this.syncContacts.bind(this)}/>
                    </View>
                )
                }
                refreshControl={<RefreshControl
                    refreshing={this.state.syncing}
                    onRefresh={this.onRefresh.bind(this)}
                />}
            />
        )
    }

    onRefresh() {
        this.syncContacts()
    }

    syncContacts() {
        if (this.state.syncing) return
        this.setState({syncing: true})
        Contacts.getAll((err, contacts) => {
            if (err) throw err;
            this.props.dispatch({type: SET_CONTACTS, data: contacts})
            this.setState({syncing: false})
        })
    }
}

function renderItem(contact: Contact) {
    return (
        <PersonRowI
            person={toPerson(contact)}
            key={contact.rawContactId}
            style={{
                margin: 16
            }}
        />
    )
}

export function toPerson(contact: Contact) {
    return {
        firstName: contact.givenName,
        lastName: contact.familyName,
        image: contact.thumbnailPath,
        id: __IS_IOS__ ? contact.recordID : contact.rawContactId
    }
}

export const reducer =  (state = {data: []}, action = {}) => {

    switch (action.type) {
        case SET_CONTACTS: {
            state = {...state, data: action.data}
        }
    }
    return state;
}
