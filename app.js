var express = require('express');
var app = express();
var fs = require('fs'); //require filesystem module
var io = require('socket.io')(http) //require socket.io module and pass the http object (server)
var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
var LED = new Gpio(4, 'out'); //use GPIO pin 4 as output
var bodyParser = require('body-parser');
var methodOverride =require('method-override')
var mongoose = require('mongoose');
const axios = require('axios');

// App config
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

app.use(methodOverride("_method"));



app.get("/", function(req, res){
	
	axios.get('https://api.openweathermap.org/data/2.5/weather?q=tbilisi&appid=6089f6509a50304980cd0037f70fe8b1&units=metric')
  .then(response => {

	
	res.render("home", {weatherData : response.data});
  })
  .catch(error => {
    console.log(error);
  });

})


io.sockets.on('connection', function (socket) {// WebSocket Connection
  var lightvalue = 0; //static variable for current status
  socket.on('light', function(data) { //get light switch status from client
    lightvalue = data;
    if (lightvalue != LED.readSync()) { //only change LED if status has changed
      LED.writeSync(lightvalue); //turn LED on or off
    }
  });
});

process.on('SIGINT', function () { //on ctrl+c
  LED.writeSync(0); // Turn LED off
  LED.unexport(); // Unexport LED GPIO to free resources
  process.exit(); //exit completely
});


app.listen(3000,function(){
	console.log("server is running")
})

