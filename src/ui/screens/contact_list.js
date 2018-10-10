// @flow
import type {Node} from 'react'
import React from 'react'
import {FlatList, Keyboard, ScrollView, StyleSheet, Text, RefreshControl, View} from 'react-native'
import {connect} from "react-redux"
import {logged} from "../../managers/CurrentUser"
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import BottomSheet from "react-native-bottomsheet"
import i18n from "../../i18n/i18n"
import type {RNNNavigator} from "../../types"
import Contacts from 'react-native-contacts'
import PeopleRowI from "../activity/components/PeopleRow"

type Contact = {
    recordID: string,
    rawContactId: string,
    givenName: string,
    familyName: string,
}

type Props = {
    navigator: RNNNavigator,
    renderItem: any => Node
}

type State = {
    contacts: Contact[],
    syncing: boolean
}

const logger = rootlogger.createLogger('contact list')

const SET_CONTACTS = 'SET_CONTACTS'

@logged
@connect((state, ownProps) => ({
    contacts: state.contacts
}))
export default class ContactList extends React.Component<Props, State> {

    static defaultProps = {
        renderItem: ({item}) => ContactList.renderItem(item),
        syncing: false
    }

    state = {
        contacts: []
    }

    // constructor() {
    // }

    componentDidMount() {
        const navigator = this.props.navigator
        if (navigator) {
            this.props.navigator.setButtons({
                // ...ActivityDetailScreen.navigatorButtons,
                rightButtons: [{
                    id: 'contact_screen_options',
                    icon: require('../../img2/moreDotsGrey.png'),
                    // disableIconTint: true,
                }]
            })


            navigator.addOnNavigatorEvent((event) => {

                if (event.type === 'NavBarButtonPress') {
                    if (event.id === 'contact_screen_options') {
                        BottomSheet.showBottomSheetWithOptions({
                            options: [
                                i18n.t("actions.sync_contact_list"),
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

    render() {
        return (
            <FlatList
                data={this.props.contacts.data}
                renderItem={this.props.renderItem}
                // ListFooterComponent={() => this.props.onLoadMore ? this.renderSearchFooter(searchState) : null}
                keyExtractor={(item) => item.id}
                onScrollBeginDrag={Keyboard.dismiss}
                keyboardShouldPersistTaps='always'
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
            this.setState({contacts})
            this.props.dispatch({type: SET_CONTACTS, data: contacts})
            this.setState({syncing: false})
        })
    }

    static renderItem(contact: Contact) {
        logger.debug('rendering', contact)
        return (
            <PeopleRowI key={contact.rawContactId} leftText={ContactList.getName(contact)}/>
        )
    }

    static getName(contact: Contact) {
        let append = (l, r) => {
            if (_.isEmpty(r)) return l
            if (_.isEmpty(l)) return r
            return l + " " + r
        }
        let {givenName, familyName} = contact
        return append(givenName, familyName)
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
