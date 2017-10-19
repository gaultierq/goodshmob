
export type Url = string;

export type Id = string;

export type ActivityType = 'saving' | 'post' | 'sending';

export type NavigableProps = {
    navigator: any
};

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

export type Movie = Item & {
    overview: string
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

    id: Id,
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
    goodshbox: List,
    lists: any,

}

export type Comment = Base & {
    createdAt: Date;
    content: string;
    user: User;
    resource: Activity;
}


export type Saving = Activity & {
}


