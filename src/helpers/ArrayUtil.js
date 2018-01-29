
export function isUnique(activities) {
    let unique = activities.filter((elem, index, self) => {
        return index === self.indexOf(elem);
    });
    return unique.length === activities.length;
}
