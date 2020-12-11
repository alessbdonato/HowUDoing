var express = require('express');
const path = require('path');
var bodyParser = require('body-parser');
var session = require('express-session');
var sql = require("mysql");
const multer = require("multer");
var app = express();
const router = express.Router();
const port = 3000;
var idCurrentUser;
var zoneInteresse = [];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(express.static(__dirname)); //dico al servizio di utilizzare i file statici in questo percorso
app.set('view engine', 'ejs'); //preparo il servizio a renderizzare i template .ejs


//definisco i dati di configurazione per il database
var dbConfig = {
	user: 'root',
	password: '',
	server: 'localhost',
	database: 'db_hud'
};

//se
app.use(session({
	secret: 'asdgfva5',
	resave: true,
	saveUninitialized: true,
})); 

app.use(router); //preparo il servizio ad utilizzare il reindirizzarmento da un url ad una pagina



//tentativo di connessione al database
var con = sql.createConnection(dbConfig);
con.connect(function(err) {
	if (err) throw err;
	console.log("DB correttamente connesso!");
});



app.get('/', (req, res) => {
	
 	res.redirect('/homepage');

});



app.delete("/delevents/:eventID", (req, result) => {
	con.query(`DELETE FROM post WHERE id = ${req.params.eventID}`, (err, res) => {
		if (err) {
			console.log("error: ", err);
			result.send(null);
			return;
		}
		if (res.affectedRows == 0) {
			result({
				kind: "not_found"
			}, null);
			return;
		}
		console.log("deleted customer with id: ", req.params.eventID);
		result(null, res);
	});
});

//GET Event with id
app.get("/events/:eventID", (req, result) => {
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
		result.send("Event not found");
	});
});

//UPDATE Event with id from FORM

app.put("/updatevents/:eventID", (req, result) => {
	con.query(`UPDATE post SET full_text = ?, price =  ? WHERE id = ${req.params.eventID}`, [req.query.newname, req.query.newprice], (err, res) => {
		if (err) {
			console.log("error: ", err);
			result.send(err);
			return;
		}
		if (res.affectedRows == 0) {
			result.send("not_found");
			return;
		}
		console.log("updated customer: ", res);
		result.send(res[0]);
	})
});

app.post("/create_event", (req, res)  => {
	var queryCords = req.body.latitude + ";" + req.body.longitude + ";" + req.body.rad;
	console.log(req.session)
	var query = "INSERT INTO post (event_data,fk_event_type,event_title,limit_people,price,full_text,zone,fk_organizer) VALUES ('" + req.body.event_data + "','" + req.body.event_type + "','" + req.body.event_title + "','" + req.body.limit_people + "','" + req.body.price + "','" + req.body.full_text + "','" + queryCords + "','"+ req.session.iduser+"')";
	console.log(query)
	executeQuery(res, query,"/homepage");
});



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
		})
	} else {
		console.log("EFFETTUA IL LOGIN")
		//res.send('Please login to view this page!');
		res.sendFile(path.join(__dirname, 'index.html'));
	}
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
 if (req.session.loggedin){
 	res.redirect('/homepage');
 }else{
	res.sendFile(path.join(__dirname, 'index.html'));
}
});


app.get('/logout', (req, res) => {
	 req.session.destroy(() => {
   req.session =  null;
   res.redirect("/"); 
  });
});


app.get('/about', (req, res) => {
	res.render(path.join(__dirname, 'about.ejs'), {
				isLoggedIn: req.session.loggedin,
				user: req.session.username,
			});
});



app.get('/myprofile', (req, res) => {
	var bufferBase64 =  Buffer.from(req.session.pic.data).toString('base64');

  
	res.render(path.join(__dirname, 'profile.ejs'), {
				isLoggedIn: req.session.loggedin,
				user: req.session.username,
				name : req.session.name,
				surname : req.session.surname,
				age : req.session.age,
				bio : req.session.bio,
				pic : bufferBase64
			});
 			console.log(bufferBase64);


});


app.get('/registration', (req, res) => {
	res.sendFile(path.join(__dirname, 'rgst_form.html'));
});

var executeQuery = function(res, query, action = null) {
	con.query(query, function(err, result) {
		if (err) {
			console.log("Eccezione durante l'esecuzione della query nel database -> " + err);
			res.send(err);
		} else {
			res.redirect(action);
		}
	});
}

app.post("/authregistrer", function(req, res) {
	var queryCords = req.body.latitude + ";" + req.body.longitude + ";" + req.body.rad
	var query = "INSERT INTO user (name,age,surname,gender,mail,pw,username,zone) VALUES ('" + req.body.first_name + "','" + req.body.age + "','" + req.body.last_name + "','" + req.body.gender + "','" + req.body.email + "','" + req.body.pw + "','" + req.body.username + "','" + queryCords + "')";
	console.log(query)
	executeQuery(res, query,"/login");
});


app.post("/edit", function(req, res) {
	console.log("EDITED")
	var query = "UPDATE user SET name = '" + req.body.first_name + "', surname = '" + req.body.last_name + "', age = '" + req.body.age + "', bio = '" + req.body.bio + "', picture = '" + req.body.profile_photo + "' WHERE id = '" + req.session.iduser + "' ";
	console.log(query)
	executeQuery(res, query,"/myprofile");
	
});






app.post('/auth', function(request, response) {
	var username = request.body.email;
	var password = request.body.pw;
	if (username && password) {
		con.query('SELECT * FROM user WHERE mail = ? AND pw = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = JSON.parse(JSON.stringify(results[0].username));
				request.session.name = JSON.parse(JSON.stringify(results[0].name));
				request.session.surname = JSON.parse(JSON.stringify(results[0].surname));
				request.session.age = JSON.parse(JSON.stringify(results[0].age));
				request.session.bio = JSON.parse(JSON.stringify(results[0].bio));
				request.session.pic = JSON.parse(JSON.stringify(results[0].picture));
				request.session.iduser = JSON.parse(JSON.stringify(results[0].id));
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