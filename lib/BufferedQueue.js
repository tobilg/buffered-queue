'use strict';

var EventEmitter = require('events').EventEmitter;

/**
 * Constructor
 */
var BufferedQueue = function BufferedQueue(name, options) {

    // call parent constructor
    EventEmitter.call(this);

    //Check whether supplied argument is a function or not
    function isFunction(functionToCheck) {
        var getType = {};
        return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
    }

    // Array for queue items
    this.Items = [];

    //Local properties
    this._name = (name ? name : Math.random().toString(16).slice(2));
    this._size = (options && 'size' in options) ? options.size : 10;
    this._flushTimeout = (options && 'flushTimeout' in options) ? options.flushTimeout : 5000;
    this._verbose = (options && 'verbose' in options) ? options.verbose : false;
    this._useCustomResultFunction = false;

    //Custom result function handling
    if (options && 'customResultFunction' in options && isFunction(options.customResultFunction)) {
        this._useCustomResultFunction = true;
        this._customResultFunction = options.customResultFunction;
    }

    // Trigger for the timed Queue flush
    this.intervalId = null;

};

/**
 * Inherit from `EventEmitter.prototype`.
 */
BufferedQueue.prototype = Object.create(EventEmitter.prototype, {
    name: {
        get: function () {
            return this._name;
        }
    },
    size: {
        get: function () {
            return this._size;
        }
    },
    flushTimeout: {
        get: function () {
            return this._flushTimeout;
        }
    },
    verbose: {
        get: function () {
            return this._verbose;
        }
    },
    json: {
        get: function () {
            return JSON.stringify(this.Items);
        }
    },
    requests: {
        get: function () {
            return this.Items;
        }
    },
    maxQueueSizeReached: {
        get: function () {
            var bool = this.Items.length >= this._size;
            if (bool) {
                // Trigger Queue flush
                if (this._verbose) console.log('Queue (' + this._name + '): Maximum Queue size reached!');
            } else {
                //do nothing
                if (this._verbose) console.log('Queue (' + this._name + '): Maximum Queue size not reached. Currently ' + this.Items.length + ' of ' + this._size + ' in queue!');
            }
            return bool;
        }
    },
    add: {
        value: function (request, infos) {

            this.Items[this.Items.length] = request;

            if (this._verbose) console.log('Queue (' + this._name + '): Added item: ', request);

            // Execute Queue if Queue Size is reached
            if (this.maxQueueSizeReached) {
                this.onFlush();
            } else {
                this.startTimeout();
            }
        }
    },
    flushItems: {
        value: function () {
            //Erase contents of Items array
            this.Items.length = 0;
        }
    },
    recurringQueue: {
        value: function () {
            // Check if there's some work to do
            if (this.Items.length > 0) {
                if (this._verbose) console.log('Queue (' + this._name + '): The timeout triggered a Queue flush! ' + this.Items.length + ' items are in the Queue.');
                // Trigger Queue flush
                this.onFlush();
            } else {
                if (this._verbose) console.log('Queue (' + this._name + '): The timeout triggered a Queue flush, but there are no items!');
            }
        }
    },
    onFlush: {
        value: function () {
            this.stopTimeout();
            this.emit('flush', (this._useCustomResultFunction ? this._customResultFunction(this.Items) : this.Items), this.name);
            this.flushItems();
        }
    },
    startTimeout: {
        value: function () {
            if (!this.intervalId) {
                var callback = this.recurringQueue.bind(this);
                this.intervalId = setTimeout(callback, this._flushTimeout);
            }
        }
    },
    stopTimeout: {
        value: function () {
            if (this.intervalId) {
                clearTimeout(this.intervalId);
                this.intervalId = null;
            }
        }
    }
});

/**
 * Expose `BufferedQueue`.
 */
module.exports = BufferedQueue;

/**
 * Library version.
 */
exports.version = '0.1.0';