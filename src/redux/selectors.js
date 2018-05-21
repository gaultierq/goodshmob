
 export const currentUserFilter = function (state, props) {
    const userId = props.userId
    if (!userId) throw "please provide a userId to this selector"
    return _.get(state, `data.users.${userId}`)
}
