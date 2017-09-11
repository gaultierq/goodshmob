import Base from "./Base";

export default class Activity extends Base {
    created_at;
    updated_at;
    type;
    privacy;
    description;
    user;
    target;
    resource;
    related_activities;
    comments;
    commentators;
}

