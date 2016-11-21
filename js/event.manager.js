function EventManager() {
    this.events = {};
}

EventManager.prototype.on = function (eventName, callback) {
    this.events[eventName + ''] = this.events[eventName + ''] || [];
    this.events[eventName + ''].push(callback);
};

EventManager.prototype.trigger = function (eventName, data) {
    var length;

    if (!this.events[eventName] || !this.events[eventName].length) {
        return;
    }

    length = this.events[eventName].length;

    if (length == 1) {
        this.events[eventName][0].call(null, data);

        return;
    }

    if (length > 1) {
        for (var i = 0; i < length; i++) {
            this.events[eventName][i].call(null, data);
        }
    }
};