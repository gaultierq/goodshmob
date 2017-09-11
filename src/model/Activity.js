import Base from "./Base";
import User from "./User";

export default class Activity extends Base {
    createdAt;
    updatedAt;
    type;
    privacy;
    description;
    user: User;
    target;
    resource;
    relatedActivities;
    comments;
    commentators;
}

