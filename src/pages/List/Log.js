class LogStack {
    constructor() {
        this.logs = [];
        this.maxLength = 100;
        this.listeners = [];
    }

    getLogs() {
        return this.logs;
    }

    addLog(data) {
        
        this.logs.push({
            desc: data
        })
    }

    clearLogs() {
        this.logs = [];
    }

    notify() {
        this.listeners.forEach(fn => fn())
    }

    attach(cb) {
        this.listeners.push(cb)
    }
}