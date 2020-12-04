var express = require('express')
const path = require('path')
var bodyParser = require('body-parser');
var sql = require("mysql");
var app = express();
const router = express.Router();
app.use(express.static(__dirname));
const port = 3000

app.use(bodyParser.urlencoded({ extended: true })); 

var dbConfig = {
    user: 'root',
    password: '',
    server: 'localhost',
    database: 'db_hud'
};


var con = sql.createConnection(dbConfig);
con.connect(function(err) {
  if (err) throw err;
  console.log("DB correttamente connesso!");
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
})

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
})
app.get('/registration', (req, res) => {
  res.sendFile(path.join(__dirname, 'rgst_form.html'));
})

var executeQuery = function(res,query){
    con.connect(dbConfig,function(err){
        if(err){
            console.log("Eccezione nel database -> "+err);
            res.send(err);
        }
        else{
            // create request object
            var request = new sql.Request();
            // Add parameters
            // query to the database
            con.query(query,function(err,result){
                if(err){
                    console.log("Eccezione durante l'esecuzione della query nel database -> "+err);
                    res.send(err);
                }
                else{
                    res.send(result);
                    con.close();
                }
            });
        }
    });
}



app.post("/authregistrer", function(req , res){
    var query = "INSERT INTO user (first_Name, last_name) VALUES ('"+req.body.first_name+"','"+req.body.last_name+"')";
    console.log(query)
    executeQuery (res, query);
});


app.listen(port, () => {
  console.log(`Server in ascolto sul seguente endpoint: http://localhost:${port}`)
})
