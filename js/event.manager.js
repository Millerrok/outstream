
function EventManager() {
    this.events = {};
}

EventManager.prototype.on = function (eventName, callback) {
    this.events[eventName + ''] = callback;
};

EventManager.prototype.trigger = function (eventName, data) {
    var callback = this.events[eventName];

    if (!callback) {
        return;
    }

    callback.call(null, data);
};