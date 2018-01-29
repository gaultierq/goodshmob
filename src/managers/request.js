
export class RequestManager {

    actions = new Map();


    createTracker(action: string, caller: any): RequestManagerTracker {
        let tracker = new RequestManagerTracker(this, action);
        this.actions.set(tracker, caller);
        return tracker;
    }

    //setState, and register tracker
    notify(tracker: RequestManagerTracker, status: string) {
        let caller = this.actions.get(tracker);
        if (!caller) throw "no caller found";
        const action: string = tracker.getAction();
        caller.setState({[action]: status});
    }
}

export class RequestManagerTracker {

    manager: RequestManager;
    action: string;

    constructor(manager: RequestManager, action: string) {
        this.manager =  manager;
        this.action = action;
    }

    fail() {
        this.manager.notify(this, 'ko')
    }

    success() {
        this.manager.notify(this, 'ok')
    }

    sending() {
        this.manager.notify(this, 'sending')
    }

    getAction(): string {
        return this.action;
    }
}
