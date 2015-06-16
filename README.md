# buffered-queue

A simple to use buffering queue as Node.js module (no dependencies), which flexibly buffers objects, strings, integers etc. until either a maximum size is reached, or an interval has come to an end.

## Installation

You can simply install this module by running 

`npm install buffered-queue --save`

from the command line withing your project's folder.

## Usage

The module can be required by

    var Queue = require('buffered-queue');
    var q = new Queue(name, options);

There are two optional parameters, the `name` of the queue and the configuration `options` object.

### Basic configuration
```
var q = new Queue('pageviews', {
    size: 3,               // The maximum size before the queue is flushed (default: 10)
    flushTimeout: 1000,    // The timeout in milliseconds after the queue is flushed (default: 5000ms)
    verbose: true         // Whether debug info should be logged to console.log or not (default: false)
});
```

### Add items to the queue

Basically you can add every type except functions to the queue. It's advisable that you use the same type though, or, if not, use a custom result function which handles the streamlining process (see below). 

#### Objects
```
q.add({foo: "bar"});
```

#### Strings
```
q.add("This is a test!");
```

### Queue flush

If the queue flushes, a `flush` event is triggered. If can be received as follows:

```
q.on("flush", function(data, name){
    console.log(data);
});
```

### The "Custom result function"

You can also pass a function within the `options` object, which is then used to control the result once the flush is triggered. If there's no such function configured, the queue will just return the array in which it stored the items. 

#### Example

The result function below will uppercase all items (considered they're strings):

```
var q = new Queue('test', {
    customResultFunction: function(items) {
        var temp = [];
        items.forEach(function(item, index, array) {
            temp.push(item.toUpperCase());
        });
        return temp;
    }
});

```

### Complete example

Think about a use case where you receive input from a process, and want to log the results only after 3 seconds have passed, or 5 items have been added.  

```
var Queue = require('buffered-queue');

var q = new Queue('example', {
    size: 5,
    flushTimeout: 3000,
    verbose: true,
    customResultFunction: function(items) {
        var temp = [];
        items.forEach(function(item, index, array) {
            temp.push(item.toUpperCase());
        });
        return temp.join('\n');
    }
});

q.on("flush", function(data, name){
    console.log(data);
});

q.add("Message 1");
q.add("Message 2");
q.add("Message 3");
q.add("Message 4");

setTimeout(function() {
    q.add("Message 5");
    q.add("Message 6");
}, 4000);
```

The output will be the following:

```
Queue (example): Added item:  Message 1
Queue (example): Maximum Queue size not reached. Currently 1 of 5 in queue!
Queue (example): Added item:  Message 2
Queue (example): Maximum Queue size not reached. Currently 2 of 5 in queue!
Queue (example): Added item:  Message 3
Queue (example): Maximum Queue size not reached. Currently 3 of 5 in queue!
Queue (example): Added item:  Message 4
Queue (example): Maximum Queue size not reached. Currently 4 of 5 in queue!
Queue (example): The timeout triggered a Queue flush! 4 items are in the Queue.
MESSAGE 1
MESSAGE 2
MESSAGE 3
MESSAGE 4
Queue (example): Added item:  Message 5
Queue (example): Maximum Queue size not reached. Currently 1 of 5 in queue!
Queue (example): Added item:  Message 6
Queue (example): Maximum Queue size not reached. Currently 2 of 5 in queue!
Queue (example): The timeout triggered a Queue flush! 2 items are in the Queue.
MESSAGE 5
MESSAGE 6
```