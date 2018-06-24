
 export const currentUserFilter = function (state, props) {
     return _.get(state, `data.users.${props.userId}`)
}
