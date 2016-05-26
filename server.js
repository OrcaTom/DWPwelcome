var path          = require('path'),
    express       = require('express'),
    browserSync   = require('browser-sync'),
    nunjucks      = require('express-nunjucks'),
    favicon       = require('serve-favicon'),
    moment        = require('moment'),
    // basicAuth     = require('basic-auth-connect'),
    // bodyParser    = require('body-parser'),
    // cookieParser  = require('cookie-parser'),
    port          = (process.env.PORT || 3000),
    app           = express(),

    // routing and extras
    routes        = require(__dirname + '/lib/default-routes.js'),
    app_routes    = require(__dirname + '/app/routes.js'),
    // staff_routes  = require(__dirname + '/app/views/staffui/routes.js'),
    // fdbck_routes  = require(__dirname + '/app/views/feedback/routes.js'),
    // user_data     = require(__dirname + '/lib/user_data.js'),

    // Grab environment variables specified in Procfile or as Heroku config vars
    username = process.env.USERNAME,
    password = process.env.PASSWORD,
    env = process.env.NODE_ENV || 'development';

/*
  Authenticate against the environment-provided credentials,
  if running the app in production (Heroku, effectively)
*/
// if (env === 'production') {
//   if (!username || !password) {
//     console.log('Username or password is not set, exiting.');
//     process.exit(1);
//   }
//   app.use(express.basicAuth(username, password));
// }


/*
  Setting up the templating system, nunjucks etc.
*/
app.set('view engine', 'html');
app.set('views', [__dirname + '/app/views/', __dirname + '/lib/']);
nunjucks.setup({
    autoescape: true,
    watch: true,
    noCache: true,
}, app, function(env)
{
  env.addFilter('slugify', function(str) {
      return str.replace(/[.,-\/#!$%\^&\*;:{}=\-_`~()’]/g,"").replace(/ +/g,'_').toLowerCase();
  });
  env.addFilter('check', function(str,checkee,output) {
      return str == checkee ? output : '';
  });
  env.addFilter('classify', function(str,checkee,output) {
      return str.split(' ')[0].toLowerCase();
  });
  env.addFilter('sanssuffix', function(str) {
      return str.replace(".html","");
  });
  env.addFilter('date', function(date) {
      return moment(date).format("Do MMM YYYY");
  });
});


/*
  Middleware to serve static assets.
*/
app.use('/public', express.static(__dirname + '/public'));
app.use('/public', express.static(__dirname + '/govuk_modules/govuk_template/assets'));
app.use('/public', express.static(__dirname + '/govuk_modules/govuk_frontend_toolkit'));
app.use('/public/images/icons', express.static(__dirname + '/govuk_modules/govuk_frontend_toolkit/images'));
app.use(favicon(path.join(__dirname, 'govuk_modules', 'govuk_template', 'assets', 'images','favicon.ico')));


/*
  Support for parsing data in POSTs.
*/
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended:true}));
// app.use(cookieParser());
// app.use(user_data.form_to_cookie());


/*
  Send assetPath to all views.
*/
app.use(function (req, res, next) {
  res.locals.asset_path="/public/";
  next();
});


/*
  Routers
*/
if (typeof(routes) != "function") {
  console.log(routes.bind);
  console.log("Warning: the use of bind in routes is deprecated - please check the prototype kit documentation for writing routes.")
  routes.bind(app);
} else {
  console.log('Using routes');
  app.use(app_routes);    // these have to come first.
  // app.use(staff_routes);  // these have to come first.
  // app.use(fdbck_routes);  // these have to come first.
  app.use(routes);        // these come last because they mop up!
}


/*
  Start the app.
  Use browserSync if we're in development.
*/
if (env === 'production') {
  app.listen(port);
} else {
  app.listen(port,function()
  {
    browserSync({
      proxy:'localhost:'+port,
      port:port+1,
      ui:false,
      files:['public/**/*.{js,css,png}','app/views/**/*.html'],
      ghostmode:{clicks:true, forms: true, scroll:true},
      open:false,
    });
  });
}

console.log('');
console.log('Listening on port ' + port);
console.log('');
