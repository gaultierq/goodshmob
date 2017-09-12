import Base from "./Base";
import * as Models from "."

export default class Activity extends Base {
    createdAt;
    updatedAt;
    type;
    privacy;
    description;
    user: Models.User;
    target;
    resource: Models.Item;
    relatedActivities;
    comments;
    commentators;

}

