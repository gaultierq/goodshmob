// @flow
import type {Node} from 'react'
import React from 'react'
import {FlatList, Keyboard, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native'
import {connect} from "react-redux"
import {logged} from "../../managers/CurrentUser"
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import BottomSheet from "react-native-bottomsheet"
import i18n from "../../i18n/i18n"
import type {RNNNavigator} from "../../types"
import Contacts from 'react-native-contacts'
import PeopleRowI from "../activity/components/PeopleRow"

type Contact = {
    givenName: string,
    familyName: string,
}

type Props = {
    navigator: RNNNavigator,
    renderItem: any => Node
}

type State = {
    contacts: Contact[]
}

const logger = rootlogger.createLogger('contact list')

@logged
@connect((state, ownProps) => ({
}))
export default class ContactList extends React.Component<Props, State> {

    static defaultProps = {
        renderItem: ({item}) => ContactList.renderItem(item)
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
                data={this.state.contacts}
                renderItem={this.props.renderItem}
                // ListFooterComponent={() => this.props.onLoadMore ? this.renderSearchFooter(searchState) : null}
                keyExtractor={(item) => item.id}
                onScrollBeginDrag={Keyboard.dismiss}
                keyboardShouldPersistTaps='always'/>
        )
    }

    syncContacts() {
        Contacts.getAll((err, contacts) => {
            if (err) throw err;

            // contacts returned
            logger.debug("contacts retreived", contacts)
            this.setState({contacts})
        })
    }

    static renderItem(contact: Contact) {
        return (
            <PeopleRowI leftText={contact.givenName + " " + contact.familyName}/>
        )
    }
}
