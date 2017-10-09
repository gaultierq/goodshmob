
export type Item = {
    title: string,
    subtitle: String,
    url: String,
    uid: number,
    image: String,
    provider: any,
    type: string,
    activitiesCount: number,
    description: string,
}


export type List =  Base & {

    createdAt: any,
    name: string,
    primary: any,
    privacy: any,
    savings: List<Saving>,
    user: any,
}

export type Base = {

    id: String,
    type: String, //doesn't make sense though
    links: any,
    meta: any,
}

export type Activity = Base & {
    createdAt: any,
    updatedAt: any,
    type: any,
    privacy: any,
    description: any,
    user: User,
    target: any,
    resource: Item,
    relatedActivities: any,
    comments: any,
    commentators: any,

}

export type User = Base & {

    firstName: string,
    provider: any,
    uid: any,
    lastName: any,
    image: any,
    email: any,
    timezone: any,
    goodshbox: any,
    lists: any,

}


export type Saving = Base & {
}


