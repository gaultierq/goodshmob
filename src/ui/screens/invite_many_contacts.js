// @flow
import React from 'react'
import {Platform, StyleSheet, Text, TextInput, View} from 'react-native'
import type {Props as LineupProps} from "./lineuplist"
import Screen from "../components/Screen"
import {connect} from "react-redux"
import type {Contact} from "./contact_list"
import ContactList, {createSmsUri, splitContacts, toPerson} from "./contact_list"
import PersonRowI from "../activity/components/PeopleRow"
import CheckBox from 'react-native-check-box'
import GButton from "../components/GButton"
import {openLinkSafely} from "../UIStyles"

type Props = {
};

type State = {
    toInvite: { string?: Contact}
}

const logger = rootlogger.createLogger('invite many contacts')

@connect()
export default class InviteManyContacts extends Screen<Props, State> {

    state = {
        toInvite: {}
    }

    render() {
        return (
            <View style={{flex: 1, justifyContent: "space-between"}}>
                <ContactList
                    navigator={this.props.navigator}
                    renderItem={({item}) => this.renderContact(item)}
                    // focused={visible && focused}
                />
                <GButton
                    disabled={_.isEmpty(this.state.toInvite)}
                    style={{margin: 16}} text={"invite"}
                    onPress={()=>{
                    logger.debug("inviting", this.state.toInvite)
                    let contacts = _.values(this.state.toInvite)
                    let toInvite = splitContacts(contacts, true)
                    let uri = createSmsUri(toInvite.phones, {
                        title: i18n.t('share_goodsh.title'),
                        body: i18n.t('share_goodsh.message')
                    })
                    openLinkSafely(uri)
                }}/>
            </View>
        )
    }

    renderContact(contact: Contact) {
        const perso = toPerson(contact)
        let disabled = splitContacts([contact], true).phones.length === 0
        return (
            <PersonRowI
                person={perso}
                key={contact.rawContactId}
                style={{
                    margin: 16,
                    opacity: disabled ? 0.5 : 1
                }}
                rightComponent={(
                    <CheckBox
                        disabled={disabled}
                        onClick={()=>{
                            let toInvite = {...this.state.toInvite}
                            if (toInvite[perso.id]) {
                                delete toInvite[perso.id]
                            }
                            else {
                                toInvite[perso.id] = contact
                            }
                            this.setState({
                                toInvite
                            })
                        }}
                        isChecked={!!this.state.toInvite[perso.id]}
                    />
                )}

            />
        )
    }

}

