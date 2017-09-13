import i18n from '../i18n/i18n'


export function timeSince(lower, upper?) {

    upper = upper ? upper : new Date();

    const seconds = Math.floor((upper - lower) / 1000);

    let interval = Math.floor(seconds / 31536000);

    if (interval >= 1) {
        return i18n.t("util.time.since_years", {count: interval});
    }
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
        return i18n.t("util.time.since_months", {count: interval});
    }
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
        return i18n.t("util.time.since_days", {count: interval});
    }
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
        return i18n.t("util.time.since_hours", {count: interval});
    }
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
        return i18n.t("util.time.since_minutes", {count: interval});
    }
    return i18n.t("util.time.since_seconds", {count: interval});
}


