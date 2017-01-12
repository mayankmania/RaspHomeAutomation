var express = require('express');
var bodyParser = require('body-parser');
var gpioInstance = require('gpiohelper.js');
var app = new express();
var gpio = new gpioInstance();
startUp();

// Listen for requests
var server = app.listen(app.get('port'), function () {
    var port = server.address().port;
    console.log('Server running on port ' + port);
});

//Toggle appliance state
function switchOn(pinNo, response) {
    gpio.write(pinNo, 1);
    response.end('ON');
}

function switchOff(pinNo, response) {
    gpio.write(pinNo, 0);
    response.end('OFF');
}

//Configure external modules here
function configureExternalModule() {
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.use(bodyParser.json());

    var options = {
        index: "nodefile.htm"
    };

    app.use('/', express.static('public', options));
}

//Configure http request
function setUpHttpHandler() {
    app.use('/getLedStatus', function (req, res) {
        var status = gpio.read('16');
        res.end(status);
    });

    app.post("/", function (req, res) {
        gpio.setUp("16", "out");
        var currentLEDStatus = gpio.read("16");
        if (currentLEDStatus == 0 || currentLEDStatus == -1) {
            switchOn("16", res);
        }
        else {
            switchOff("16", res);
        }
    });
}

//Register all the startup related stuffs in this function
function startUp() {
    configureExternalModule();
    setUpHttpHandler();
    app.set('port', 9000);
}