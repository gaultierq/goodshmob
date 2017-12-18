// @flow


export type ApiActionName = string;

export default class ApiAction {

    actionName: ApiActionName;

    static byName = {};

    //deprecated, use create
    constructor(actionName:ApiActionName) {
        this.actionName = actionName;
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

    toString() {
        return this.name();
    }

    static composeName(actionName: string, apiType: string): string {
        return `${actionName}_${apiType}`;
    }


    static getByName(actionName: ApiActionName):? ApiAction {
        return ApiAction.byName[actionName];
    }

    static create(actionName: ApiActionName): ApiAction {
        return ApiAction.byName[actionName] || new ApiAction(actionName);
    }
}