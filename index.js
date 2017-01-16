var express = require('express');
var bodyParser = require('body-parser');
var gpioInstance = require('gpiohelper.js');
var app = new express();
startUp();

// Listen for requests
var server = app.listen(app.get('port'), function () {
    var port = server.address().port;
    console.log('Server running on port ' + port);
});

//Toggle appliance state
function setApplianceState(pinNo, setState, response) {
    var gpio = new gpioInstance();
    gpio.write(pinNo, setState);
    var jsonResult = { "status": setState, "deviceId": pinNo };
    response.json(jsonResult);
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
        var gpio = new gpioInstance();
        var status = gpio.read(req.query.deviceId);
        if (status == -1) {
            status = 0;
        }
        var jsonResult = { "status": status, "deviceId": req.query.deviceId };
        res.json(jsonResult);
    });

    app.post("/", function (req, res) {
        var deviceId = req.body.deviceId;
        var gpio = new gpioInstance();
        gpio.setUp(deviceId, "out");
        var currentLEDStatus = gpio.read(deviceId);
        if (currentLEDStatus == 0 || currentLEDStatus == -1) {
            setApplianceState(deviceId, 1, res);
        }
        else {
            setApplianceState(deviceId, 0, res);
        }
    });
}

//Register all the startup related stuffs in this function
function startUp() {
    configureExternalModule();
    setUpHttpHandler();
    app.set('port', 9000);
}