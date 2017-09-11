import Base from "./Base";
import User from "./User";

export default class Activity extends Base {
    created_at;
    updated_at;
    type;
    privacy;
    description;
    user: User;
    target;
    resource;
    related_activities;
    comments;
    commentators;
}

