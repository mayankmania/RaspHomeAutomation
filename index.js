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
        index: "index.htm"
    };

    app.use('/', express.static('public', options));
}

//Configure http request handler
function setUpHttpHandler() {
    app.use('/getLedStatus', function (req, res) {
        var status = gpio.read(req.query.deviceId);
        res.end(status);
    });

    app.post("/", function (req, res) {
        var deviceId = req.body.deviceId;
        gpio.setUp(deviceId, "out");
        var currentLEDStatus = gpio.read(deviceId);
        if (currentLEDStatus == 0 || currentLEDStatus == -1) {
            switchOn(deviceId, res);
        }
        else {
            switchOff(deviceId, res);
        }
    });
}

//Register all the startup related stuffs in this function
function startUp() {
    configureExternalModule();
    setUpHttpHandler();
    app.set('port', 9000);
}