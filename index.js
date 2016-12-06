var fs = require('fs');
var express = require('express');
var path = require('path');
var app = new express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

var options = {
    index: "nodefile.htm"
};

app.use('/', express.static('public', options));

app.use('/getLedStatus', function (req, res) {
    var status = getLedStatus();
    res.end(status);
});

app.post("/", function (req, res) {
    initiliazePins();
    var currentLEDStatus = getLedStatus();
    if (currentLEDStatus == 0 || currentLEDStatus == -1) {
        switchOn(res);
    }
    else {
        switchOff(res);
    }
});

// Define the port to run on
app.set('port', 9000);

// Listen for requests
var server = app.listen(app.get('port'), function () {
    var port = server.address().port;
    console.log('Server running on port ' + port);
});

function getLedStatus() {
    var ledStatus = "-1";
    if (fs.existsSync("/sys/class/gpio/gpio23/value")) {
        ledStatus = fs.readFileSync('/sys/class/gpio/gpio23/value').toString();
    }
    console.log("ledStatus : " + ledStatus);
    return ledStatus;
}

function initiliazePins() {
    if (!fs.existsSync("/sys/class/gpio/gpio23")) {
        fs.writeFileSync('/sys/class/gpio/export', '23');
        fs.writeFileSync('/sys/class/gpio/gpio23/direction', 'out');
        console.log("/sys/class/gpio/gpio23 : Not Present");
    }
    else    
    {
        console.log("/sys/class/gpio/gpio23 : Present");
    }
}

function switchOn(response) {
    fs.writeFileSync('/sys/class/gpio/gpio23/value', '1');
    response.end('OFF');
}

function switchOff(response) {
    fs.writeFileSync('/sys/class/gpio/gpio23/value', '0');
    response.end('ON');
}

