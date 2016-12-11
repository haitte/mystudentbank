 // server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var session  = require('client-sessions');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var app = express();
var port = process.env.PORT || 3000;
var bcrypt = require('bcrypt-nodejs');
var flash    = require('connect-flash');
var mysqlModel = require('mysql-model');

app.use(session({
	cookieName: 'session',
	secret: 'bjsd7t3489ukjbfidsoihsdoif3e',
	duration: 30*60*1000,
	activeDuration: 5*60*1000
 } )); 

var MyAppModel = mysqlModel.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'my_bank',
});


//Setup our model
var Customer = MyAppModel.extend({
    tableName: "customer",
});

var Transaction = MyAppModel.extend({
    tableName: "transaction",
});

var Account = MyAppModel.extend({
    tableName: "account",
});

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());
app.set('view engine', 'ejs'); // set up ejs for templating

app.use(function(req,res,next){
	if(req.session && req.session.customer){
		cur_customer = new Customer()
		cur_customer.find('first', {where: "email = '"+req.body.email+"' " }, function(err, rows) {
			
		});
	}
});


//Define Routes
app.get('/',function(req,res){
  res.render('index.ejs');
});

app.get('/login',function(req,res){
	message = '';
  res.render('login.ejs',{message:message});
});

app.post('/login',function(req,res){
	customer = new Customer();
	customer.find('first', {where: "email = '"+req.body.email+"' " }, function(err, rows) {
  	if(!rows){
			res.render('login.ejs',{message:'Email not registered!'});
		}else{
			console.log(rows.password);
			if(bcrypt.compareSync(req.body.password, rows.password)){
				req.session.customer = rows.email;
				res.redirect('/account');
			}else{
				res.render('login.ejs',{message:'Wrong username or Password!!'});
			}
		}
	});
});

app.get('/signup',function(req,res){
  message = '';
  res.render('signup.ejs',{message:message});
});

app.post('/signup',function(req,res){
  customer = new Customer({
    first_name: req.body.fname,
    last_name: req.body.lname,
    city: req.body.city,
    email: req.body.email,
		password: bcrypt.hashSync(req.body.password,null,null),
		contact_no:req.body.contact,
		b_id:1
	});
	customer.save(function(err,ok){
			if(err){
				res.render('login.ejs',{message:err.code});
			}
			else{
				res.redirect('account.ejs');
			}
	});	
	
});

app.get('/account',function(req,res){
  message ='';
	if(req.session && req.session.customer){
		console.log("In Account");
		cur_customer  = new Customer();
		cur_customer.find('first', {where: "email = '"+req.session.customer+"' " }, function(err, rows){
			if(!rows){
				console.log("No customer found for"+req.session.customer.email);
				req.session.reset();
				res.redirect('/login');
			}else{
				res.locals.customer = rows;
				res.render('account.ejs');
			}
		});
	}else{
		res.redirect('/login');
	}
 
});

app.get('/transaction',function(req,res){
  message ='';
  res.render('transaction.ejs',{message:message});
});

app.get('/logout',function(req,res){
  req.session.reset();
  res.redirect('/');
});


app.listen(port);
console.log('The magic happens on port ' + port);