// @flow
import type {Node} from 'react'
import React from 'react'
import {FlatList, Keyboard, Linking, RefreshControl, ScrollView, StyleSheet, Text, View} from 'react-native'
import {connect} from "react-redux"
import {isCurrentUser, logged} from "../../managers/CurrentUser"
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import BottomSheet from "react-native-bottomsheet"
import i18n from "../../i18n/i18n"
import type {OutMessage, RNNNavigator} from "../../types"
import Contacts from 'react-native-contacts'
import PersonRowI from "../activity/components/PeopleRow"
import {LINEUP_PADDING, STYLES} from "../UIStyles"
import GButton from "../components/GButton"
import Screen from "../components/Screen"
import GSearchBar2 from "../components/GSearchBar2"
import {fullName} from "../../helpers/StringUtils"
import Permissions from 'react-native-permissions'
import {openLinkSafely} from "../../managers/Links"


export type Contact = {
    recordID: string,
    rawContactId: string,
    givenName: string,
    familyName: string,
    thumbnailPath: string,
    emailAddresses: [{
        label: string,
        email: string,
    }],
    phoneNumbers: [{
        label: string,
        number: string,
    }]
}

type Props = {
    navigator: RNNNavigator,
    renderItem: any => Node,
    onlyPhones?: boolean
}

type State = {
    syncing?: boolean,
    searching?: boolean,
    filter?: string,
    searchResult?: Contact[],
    permission: string,
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
        permission: 'unknown'
    }

    componentDidMount() {
        Permissions.check('contacts').then(permission => {
            this.setState({ permission })

            if (permission === 'authorized') {
                this.syncContacts()
            }

        })
    }

    addNavButton() {
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
                                i18n.t("actions.cancel"),
                            ],
                            title: i18n.t("actions.contact_list_options"),
                            cancelButtonIndex: 1,
                        }, (value) => {
                            switch (value) {
                                case 0:
                                    this.syncContacts()
                                    break
                            }
                        })
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
        let {contacts, ...attr} = this.props

        let data, empty
        if (_.isEmpty(this.state.filter)) {
            data = contacts.data
            if (this.state.permission === 'authorized') {
                // empty = (
                //     <View>
                //         <Text style={STYLES.empty_message}>{i18n.t('contacts.empty_screen')}</Text>
                //         <GButton style={{marginHorizontal: LINEUP_PADDING}} text={i18n.t('contacts.empty_screen_button')} onPress={ () => {this.syncContacts()}}/>
                //     </View>
                // )
                empty = null
            }
            else {
                empty = (
                    <View>
                        <Text style={STYLES.empty_message}>{i18n.t('contacts.empty_screen')}</Text>
                        <GButton style={{marginHorizontal: LINEUP_PADDING}} text={i18n.t('contacts.empty_screen_button')} onPress={ () => {
                            this.askPermissions().then(() => {
                            this.syncContacts()
                        })

                        }}/>
                    </View>
                )
            }

        }
        else {
            data = this.state.searchResult || []
            empty = (
                <View>
                    <Text style={STYLES.empty_message}>{i18n.t('contacts.empty_search')}</Text>
                </View>
            )
        }

        logger.debug("render", data, this.state)

        return (
            <FlatList
                data={data}
                keyExtractor={(item) => item.id}
                onScrollBeginDrag={Keyboard.dismiss}
                keyboardShouldPersistTaps='always'
                ListEmptyComponent={empty}
                refreshControl={<RefreshControl
                    refreshing={this.state.syncing}
                    onRefresh={this.onRefresh.bind(this)}
                />}
                {...attr}
                ListHeaderComponent={ this.displayFilter() &&
                (
                    <GSearchBar2
                        value={this.state.filter}
                        onChangeText={filter => this.onChangeFilter(filter)}
                        placeholder={i18n.t('search.in_my_contacts')}
                        style={{padding: LINEUP_PADDING}}
                    />
                )
                }
            />
        )
    }

    displayFilter() {
        return this.state.permission === 'authorized' || _.size(this.props.contacts.data) > 0
    }

    onChangeFilter(filter:string) {
        this.setState({filter, searching: true})

        Contacts.getContactsMatchingString(this.state.filter, (err, response) => {
            if (err) throw err
            this.setState({
                searchResult: response,
                searching: false
            })
        })

    }

    onRefresh() {
        this.syncContacts()
    }

    async syncContacts() {
        if (this.state.syncing) return
        this.setState({syncing: true})

        if (this.state.permission === 'authorized') {
            Contacts.getAll((err, contacts) => {
                if (err) throw err
                contacts = _.filter(contacts, c => !_.isEmpty(fullName(toPerson(c))))
                contacts = _.sortBy(contacts, c => fullName(toPerson(c)))
                this.props.dispatch({type: SET_CONTACTS, data: contacts})
                this.setState({syncing: false})
            })
        }
        else {
            logger.warn(`trying to sync contacts without the right permissions: ${this.state.permission}`)
        }
    }

    async askPermissions() {
        let permission = await Permissions.request('contacts')
        logger.info(`permissions: ${permission}`)
        await this.setState({permission})
    }
}

function renderItem(contact: Contact) {

    return (
        <PersonRowI
            person={toPerson(contact)}
            key={getId(contact)}
            style={{
                margin: LINEUP_PADDING
            }}
        />
    )
}

export function toPerson(contact: Contact) {
    return {
        firstName: contact.givenName,
        lastName: contact.familyName,
        image: contact.thumbnailPath,
        id: getId(contact)
    }
}

export function getId(contact: Contact) {
    return __IS_IOS__ ? contact.recordID : contact.rawContactId
}

export function splitContacts(contact: Contact[] = [], prioPhone: boolean) {

    return _.reduce(contact, (result, c) => {
        let email = _.first(c.emailAddresses.map(ea => ea.email))
        let phone = _.first(c.phoneNumbers.map(pn => pn.number))
        let addIfIs = (arr, el) => el && arr.push(el)
        let o = [() => addIfIs(result.emails, email), () => addIfIs(result.phones, phone)]
        if (prioPhone) _.reverse(o)
        o.forEach(c => c())
        return result
    }, {
        phones: [],
        emails: []
    })
}

export function createHandler(contact: Contact, message: OutMessage, options?: any): ?() => void {
    let email = _.get(contact, 'emailAddresses[0].email')
    let {title, body} = message
    let url
    if (!_.isEmpty(email)) {
        //launch email app
        url = `mailto:${email}}?subject=${encodeURIComponent(title)}&message=${encodeURIComponent(body)}`;
    }
    let number = _.get(contact, 'phoneNumbers[0].number')
    if (!_.isEmpty(number)) {
        url = createSmsUri([number], message)
    }
    return url ? (() => openLinkSafely(url)) : null

}


export function createSmsUri(phones: string[], message: OutMessage): string {
    let {title, body} = message
    return `sms:${phones.join(',')}${__IS_IOS__ ? '&' : '?' }body=${body}`
}




export const reducer =  (state = {data: []}, action = {}) => {

    switch (action.type) {
        case SET_CONTACTS: {
            state = {...state, data: action.data}
        }
    }
    return state;
}
