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
app.use(express.static('public'));
// app.use('/static', express.static('public'))
var MyAppModel = mysqlModel.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'my_bank',
});


//Setup our model based on tables from our DB
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


// Authentication middleware
app.use(function(req,res,next){
	if(req.session && req.session.customer){
		cur_customer = new Customer();
		//console.log(req.session.customer.email);
		cur_customer.find('first', {where: "email = '"+req.session.customer.email+"' " }, function(err, rows) {
			if(!rows){
				//console.log("heere in !rows");
				next();  
			}else{
				//console.log("heere in rows");
				req.customer = rows;
				delete req.customer.password;
				req.session.customer = req.customer ; 
				res.locals.customer = req.customer ;
			}
			next();
		});
	}else{
		//console.log("heere in final next");
		next();
	}
});

//requireLogin middleware
function requireLogin(req,res,next){
	 if(!req.customer){
		 console.log("heere in require login");
		 res.redirect('login');
	 }else{
		 next();
	 }
}

//Define Routes 
app.get('/',function(req,res){
  res.render('index.ejs');
});
app.get('/index.ejs',function(req,res){
  res.render('index.ejs');
});
app.get('/products.ejs',function(req,res){
  res.render('products.ejs');
});
app.get('/insurance',function(req,res){
  res.render('insurance.ejs');
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
				req.session.customer = rows;
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
				res.render('signup.ejs',{message:err.code});
			}
			else{
				req.session.customer=customer;
				req.session.actype=req.body.actype;
				res.redirect('/account'); 
			}
	});	
	
});

app.get('/account',requireLogin,function(req,res){
  account = new Account();
	account.find('first', {where: "c_id = "+req.session.customer.c_id }, function(err, rows) {
		if(!rows){
			new_account = new Account({
				account_number:Math.floor(Math.random()*10000000),
				acc_type :req.session.actype,
				balance: 0,
				c_id: req.session.customer.c_id
			});
			
			new_account.save(function(er,ok){
				if(er){
					console.log(er);
				}else{
					res.redirect('/account');
				}
			});
		}
		else{
			console.log(rows);
			res.locals.account = rows;
			res.render('account.ejs');
		}
	});
});

app.get('/transaction',requireLogin,function(req,res){
	 transaction = new Transaction();
		account = new Account();
		account.find('first', {where: "c_id = "+req.session.customer.c_id }, function(err, row) {
		if(!row){
			console.log("Nothing found");
		}
		else{
			transaction.find('all',{where : "a_id = "+row.a_id},function(errs,rows){
				if(!rows){
					res.locals.transactions='';
				}else{
					res.locals.transactions=rows;	
					res.render('transaction.ejs');
				}
			});

			console.log(res.locals.account);
			
		}
	});
 
});

app.get('/logout',function(req,res){
  req.session.reset();
  res.redirect('/');
});


app.listen(port);
console.log('The magic happens on port ' + port);