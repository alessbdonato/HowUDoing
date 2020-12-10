var express = require('express');
const path = require('path');
var bodyParser = require('body-parser');
var session = require('express-session');
var sql = require("mysql");
var app = express();
var querySelectorAll = require('query-selector');
var jsdom = require("jsdom").jsdom;
const querystring = require('querystring');



const router = express.Router();
const port = 3000;
var zoneInteresse = [];

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(express.static(__dirname));

app.set('view engine', 'ejs');


var dbConfig = {
	user: 'root',
	password: '',
	server: 'localhost',
	database: 'db_hud'
};

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));



var con = sql.createConnection(dbConfig);
con.connect(function(err) {
	if (err) throw err;
	console.log("DB correttamente connesso!");
});

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'index.html'));
});














app.delete("/delevents/:eventID",  (req, result) => {
  con.query(`DELETE FROM post WHERE id = ${req.params.eventID}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result.send(null);
      return;
    }

    if (res.affectedRows == 0) {
      // not found Customer with the id
      result({ kind: "not_found" }, null);
      return;
    }

    console.log("deleted customer with id: ", req.params.eventID);
    result(null, res);
  });

});







//GET Event with id
app.get("/events/:eventID",  (req, result) => {
  con.query(`SELECT * FROM post WHERE id = ${req.params.eventID}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result.send(null);
      return;
    }
    if (res.length) {
      console.log("found event: ", res[0]);
      result.send(res[0]);
      return;
    }
    // not found Customer with the id
  	result.send("Event not found");
  });
});





 
//UPDATE Event with id from FORM

app.put("/updatevents/:eventID",  (req, result) => {
	
  con.query(`UPDATE post SET full_text = ?, price =  ? WHERE id = ${req.params.eventID}`,[req.query.newname,req.query.newprice] ,(err, res) => {
    if (err) {
        console.log("error: ", err);
        result.send(err);
        return;
      }
      if (res.affectedRows == 0) {
        // not found Customer with the id
        result.send("not_found");
        return;
      }

      console.log("updated customer: ", res);
      result.send(res[0]);
    }
)}
);










app.get('/homepage', (req, res) => {

	if (req.session.loggedin) {

		var latitude = req.session.zone.split(";")[0];
		var longitude = req.session.zone.split(";")[1];
		var radianti = req.session.zone.split(";")[2];

		var queryZone = "SELECT event_title,full_text,price,event_data,categoria,post.zone,name FROM post INNER JOIN user ON fk_organizer = user.id INNER JOIN eventtype on fk_event_type = eventtype.id_tipoevento";

		con.query(queryZone, function(errorZone, resultsZone) {
			var zonesent = [];
			if (resultsZone.length > 0) {
				resultsZone.forEach(function(row) {
					zonesent.push(getCloserEvents(row, latitude, longitude, radianti))
				});
				console.log(zonesent);
			}
			zonesent = zonesent.filter(function(el) {
				return el != undefined;
			});

			res.render(path.join(__dirname, 'HuD¿.ejs'), {
				isLoggedIn: req.session.loggedin,
				user: req.session.username,
				event: zonesent
			});

			console.log("homepage  raggiunta")
		})
	} else {

		res.send('Please login to view this page!');
	}

	//FINE GET HOMEPAGE
});


function getCloserEvents(stringCoords, our_lat, our_lng, our_rad) {
	var x = stringCoords.zone.split(";")[1];
	var y = stringCoords.zone.split(";")[0];
	var rad = stringCoords.zone.split(";")[2];
	if (((parseFloat(x) - parseFloat(our_lng)) * (parseFloat(x) - parseFloat(our_lng))) + ((parseFloat(y) - parseFloat(our_lat)) * (parseFloat(y) - parseFloat(our_lat))) < (parseFloat(our_rad) * parseFloat(our_rad))) {
		return stringCoords;
	}
}


app.get('/login', (req, res) => {
	res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/registration', (req, res) => {
	res.sendFile(path.join(__dirname, 'rgst_form.html'));
});


var executeQuery = function(res, query) {
	con.query(query, function(err, result) {
		if (err) {
			console.log("Eccezione durante l'esecuzione della query nel database -> " + err);
			res.send(err);
		} else {
			res.redirect("/login");
		}
	});
}


app.post("/authregistrer", function(req, res) {
	var queryCords = req.body.latitude + ";" + req.body.longitude + ";" + req.body.rad
	var query = "INSERT INTO user (name,age,surname,gender,mail,pw,username,zone) VALUES ('" + req.body.first_name + "','" + req.body.age + "','" + req.body.last_name + "','" + req.body.gender + "','" + req.body.email + "','" + req.body.pw + "','" + req.body.username + "','" + queryCords + "')";
	console.log(query)
	executeQuery(res, query);
});


app.post('/auth', function(request, response) {
	var username = request.body.email;
	var password = request.body.pw;
	if (username && password) {
		con.query('SELECT * FROM user WHERE mail = ? AND pw = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = JSON.parse(JSON.stringify(results[0].name));
				request.session.zone = JSON.parse(JSON.stringify(results[0].zone));
				response.redirect('/homepage');
			} else {
				response.send('Incorrect Username and/or Password!');
			}
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});








app.listen(port, () => {
	console.log(`Server in ascolto sul seguente endpoint: http://localhost:${port}`)
})