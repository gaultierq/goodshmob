// @flow
import React from 'react'
import {Platform, StyleSheet, Text, TextInput, View} from 'react-native'
import Screen from "../components/Screen"
import {connect} from "react-redux"
import type {Contact} from "./contact_list"
import ContactList, {createSmsUri, splitContacts, toPerson} from "./contact_list"
import PersonRowI from "../activity/components/PeopleRow"
import GButton from "../components/GButton"
import {LINEUP_PADDING, openLinkSafely} from "../UIStyles"
import {fullName} from "../../helpers/StringUtils"
import GTouchable from "../GTouchable"
import Icon from 'react-native-vector-icons/MaterialIcons'
import {Colors} from "../colors"
import {SFP_TEXT_MEDIUM} from "../fonts"

type Props = {
}

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

        let n = _.size(this.state.toInvite)
        let first = _.first(_.values(this.state.toInvite))
        return (
            <View style={{flex: 1, justifyContent: "space-between"}}>
                <ContactList
                    navigator={this.props.navigator}
                    renderItem={({item}) => this.renderContact(item)}
                    // focused={visible && focused}
                />
                { n > 0 && <GButton
                    style={{
                        margin: LINEUP_PADDING,
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        flex:1,
                    }}
                    text={i18n.t("invite_button", {count: n, name: fullName(toPerson(first))})}
                    onPress={() => {
                        logger.debug("inviting", this.state.toInvite)
                        let contacts = _.values(this.state.toInvite)
                        let toInvite = splitContacts(contacts, true)
                        let uri = createSmsUri(toInvite.phones, {
                            title: i18n.t('share_goodsh.title'),
                            body: i18n.t('share_goodsh.message')
                        })
                        openLinkSafely(uri)
                    }}/>
                }
            </View>
        )
    }

    renderContact(contact: Contact) {
        const perso = toPerson(contact)
        let disabled = splitContacts([contact], true).phones.length === 0
        let checked = !!this.state.toInvite[perso.id]
        return (
            <PersonRowI
                person={perso}
                key={contact.rawContactId}
                style={{
                    margin: LINEUP_PADDING,
                    opacity: disabled ? 0.5 : 1
                }}
                rightComponent={(
                    <GTouchable onPress={()=>{
                        let toInvite = {...this.state.toInvite}
                        if (toInvite[perso.id]) {
                            delete toInvite[perso.id]
                        }
                        else {
                            toInvite[perso.id] = contact
                        }

                        this.setState({toInvite});
                        // scheduleOpacityAnimation()
                    }}>
                        {checked
                            ? <Icon style={{padding: 8}} name="check-box" size={24} color={Colors.green} />
                            : <Text style={{
                                fontSize: 18,
                                fontFamily: SFP_TEXT_MEDIUM,
                                color: Colors.black,
                                // borderColor: Colors.green,
                                // borderWidth: 1,
                                // borderRadius: 8,
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                            }}>
                                {i18n.t('invite')}
                            </Text>
                        }
                    </GTouchable>

                )}

            />
        )
    }

}

