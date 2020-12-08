				var express = require('express');
				const path = require('path');
				var bodyParser = require('body-parser');
				var session = require('express-session');
				var sql = require("mysql"); 
				var app = express();
				var querySelectorAll = require('query-selector');
				var jsdom = require("jsdom").jsdom;
				const router = express.Router();
				const port = 3000;
				var zoneInteresse = [];
				app.use(bodyParser.urlencoded({ extended: true })); 
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

				app.get('/homepage', (req, res) => {
					
				if (req.session.loggedin) {
					
					var latitude = req.session.zone.split(";")[0];
					var longitude = req.session.zone.split(";")[1];
					var radianti = req.session.zone.split(";")[2];
				
					var queryZone = "SELECT event_title,full_text,price,event_data,categoria,post.zone,name FROM post INNER JOIN user ON fk_organizer = user.id INNER JOIN eventtype on fk_event_type = eventtype.id_tipoevento";

					/*con.query(queryZone,function(errorZone, resultsZone) {
							if (resultsZone.length > 0) {
								getCloserEvents(resultsZone[3].zone,latitude,longitude,radianti)
									//console.log(resultsZone[0].zone)
									//console.log(latitude,longitude,radianti)
									
							}});
		*/

				con.query(queryZone,function(errorZone, resultsZone) {
					var zonesent= [];
					if (resultsZone.length > 0) {
								resultsZone.forEach(function(row){
								zonesent.push(getCloserEvents(row,latitude,longitude,radianti))							 
						});
								console.log(zonesent);
							}
					zonesent = zonesent.filter(function (el) { return el != undefined; });
		
					res.render(path.join(__dirname, 'HuD¿.ejs'), {
					  isLoggedIn: req.session.loggedin,
					  user : req.session.username,
					  event: zonesent

					});
						
					console.log("homepage  raggiunta")
					//getCloserEvents(zoneInteresse,latitude,longitude,radianti);
				})
				} else {

					res.send('Please login to view this page!');
				}





				//FINE GET HOMEPAGE
				});


				function getCloserEvents(stringCoords,our_lat,our_lng, our_rad){
					//(x - center_x)^2 + (y - center_y)^2 < radius^2
					
					var x = stringCoords.zone.split(";")[1];
					var y = stringCoords.zone.split(";")[0];
					var rad = stringCoords.zone.split(";")[2];
					//console.log(  ( (parseFloat(x) - parseFloat(our_lng) )  *  ( parseFloat(x) - parseFloat(our_lng) )  ) + ((parseFloat (y) - parseFloat(our_lat))* (parseFloat (y) - parseFloat(our_lat)))  < (parseFloat(our_rad)*parseFloat(our_rad)) ? true : false)
					if (((parseFloat(x) - parseFloat(our_lng))*(parseFloat(x) - parseFloat(our_lng))) + ((parseFloat (y) - parseFloat(our_lat))* (parseFloat (y) - parseFloat(our_lat)))  < (parseFloat(our_rad)*parseFloat(our_rad))){
						return stringCoords;
					}
				}


				app.get('/login', (req, res) => {
				  res.sendFile(path.join(__dirname, 'index.html'));
				});

				app.get('/registration', (req, res) => {
				  res.sendFile(path.join(__dirname, 'rgst_form.html'));
				});



					var executeQuery = function(res,query){
				    con.query(query,function(err,result){
				                if(err){
				                    console.log("Eccezione durante l'esecuzione della query nel database -> "+err);
				                    res.send(err);
				                }
				                else{
				                    res.redirect("/login");                   
				                }
				            });
					}


				


				app.post("/authregistrer", function(req , res){
					var queryCords = req.body.latitude+";"+req.body.longitude+";"+req.body.rad
				    var query = "INSERT INTO user (name,age,surname,gender,mail,pw,username,zone) VALUES ('"+req.body.first_name+"','"+req.body.age+"','"+req.body.last_name+"','"+req.body.gender+"','"+req.body.email+"','"+req.body.pw+"','"+req.body.username+"','"+queryCords+"')";
				    console.log(query)
				    executeQuery (res, query);
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
