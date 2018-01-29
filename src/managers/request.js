
export class RequestManager {

    //tracker => caller
    actions = new Map();

    //{action: "createComment", caller: #hashObject, status: "Sending"}
    events = [];
/*
    {

    }
* */

    createTracker(action: string, caller: any): RequestManagerTracker {
        let tracker = new RequestManagerTracker(this, action);
        this.actions.set(tracker, caller);
        return tracker;
    }

    isSending(action: string, caller: any) {
        return this.isLast(caller, action, 'sending');
    }

    isSuccess(action: string, caller: any) {
        return this.isLast(caller, action, 'ok');
    }

    isFail(action: string, caller: any) {
        return this.isLast(caller, action, 'ko');
    }

    isLast(caller, action, stat) {
        let events = this.getEvents(caller, action);
        let last;
        return (last = _.last(events)) && last.status === stat;
    }

    getEvents(caller, action, predicate?: () => boolean) {
        return this.events
            .filter(desc => desc.caller === caller && desc.action === action && (!predicate || predicate()));
    }

    //setState, and register tracker
    notify(tracker: RequestManagerTracker, status: string, options?: ?*) {
        let caller = this.actions.get(tracker);
        if (!caller) throw "no caller found";
        const action: string = tracker.getAction();
        caller.setState({[action]: status});

        this.events.push({
            action,
            caller,
            status,
            date: Date.now(),
            options
        });
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

    success(options?: ?*) {
        this.manager.notify(this, 'ok', options)
    }

    sending() {
        this.manager.notify(this, 'sending')
    }

    getAction(): string {
        return this.action;
    }
}
