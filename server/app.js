const auth = require('./auth');
const error = require('koa-error');
const Koa = require('koa');
const morgan = require('koa-morgan');
const Router = require('koa-router');
const session = require('koa-session');
const ts = require('./ts-api');
const views = require('koa-views');
const path = require('path');

const app = new Koa();
const router = new Router();

// nicer error pages for development
app.use(error());

// create session - needed by passport for authentication
// random key used so oauth dance is performed every time
// TODO: implement refresh token strategy and use a constant key
app.keys = [Math.random().toString().slice(2)];
app.use(session(app));

// hookup middleware for authentication with Tradeshift
app.use(auth(app));

// log HTTP requests
app.use(morgan('dev'));

// template for app served to the browser
app.use(views(__dirname, {
	map: { hbs: 'handlebars' },
	extension: 'hbs',
}));

app.use(require('koa-static')(__dirname + '../build'));

// single endpoint for the app that serves the view template with a message
router.get('/', async (ctx) => {
	// use this to see app working without connecting to Tradeshift
	// ctx.state.message = 'Hello, world!';

	// use this to see calls to the Tradeshift API working
	const data = await ts.getAccount(ctx);
	ctx.state.companyName = data.CompanyName;
	ctx.state.country = data.Country;
	ctx.state.keys = Object.keys(data);

	// render the message in the view
	await ctx.render('view');
});

router.get('/googleV', async ctx => {
	console.log('ctx here', ctx);
	ctx.body = 'koa body';
	ctx.response = 'koa response';
})

// add routes to the app
app.use(router.routes());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

module.exports = app;
