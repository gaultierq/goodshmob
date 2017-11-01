// @flow

export default class ApiAction {

    actionName: string;

    constructor(actionName) {
        this.actionName = actionName;
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
}