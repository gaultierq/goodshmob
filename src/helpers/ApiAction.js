// @flow


export type ApiActionName = string;
export type ApiActionDescription = string;

export default class ApiAction {

    actionName: ApiActionName;
    actionDescription: ApiActionDescription;

    static byName = {};

    //deprecated, use create
    constructor(actionName:ApiActionName, actionDescription:ApiActionDescription) {
        this.actionName = actionName;
        // if no action description passed fallback to action name
        this.actionDescription = actionDescription || actionName;
        if (ApiAction.byName[actionName]) throw actionName + " is already defined";

        ApiAction.byName[actionName] = this;
    }

    success() {
        return this.forType("success");
    }

    request() {
        return this.forType("request");
    }

    failure() {
        return this.forType("failure");
    }

    forType(apiType: string) {
        return ApiAction.composeName(this.actionName, apiType);
    }

    forId(id: string) {
        return `${this.name()}[${id}]`;
    }

    name() {
        return this.actionName;
    }

    description() {
        return this.actionDescription;
    }

    toString() {
        return this.name();
    }

    static composeName(actionName: string, apiType: string): string {
        return `${actionName}_${apiType}`;
    }


    static getByName(actionName: ApiActionName):? ApiAction {
        return ApiAction.byName[actionName];
    }

    static create(actionName: ApiActionName, actionDescription: ApiActionDescription): ApiAction {
        return ApiAction.byName[actionName] || new ApiAction(actionName, actionDescription);
    }
}
