const express = require('express');
const bodyParser = require('body-parser');
const knex = require('knex');
const cors = require('cors');

const app = express();
const db = knex ({
	client: 'pg',
	connection: {
		connectionString: process.env.DATABASE_URL,
		ssl: true
})

app.use(bodyParser.json());
app.use(cors());


//controllers
app.get('/', (req,res) => {
	res.send('Back-end is working!')
})

app.post('/register', (req,res) => {
	const {ign} = req.body;
	db('players')
	.insert({
		ign: ign,
		joined: new Date()
	})
	.returning('*')
	.then(player => {
		res.json(player[0])
	})	
})

app.get('/worldboss', (req,res) => {
	db.select('ign').from('players').orderBy('id').then(data => res.json(data))
})


app.get('/viewapproved', (req,res) => {
	db.select('ign').from('approved').orderBy('ign').then(data => res.json(data))
})


app.get('/viewpending', (req,res) => {
	db.select('ign').from('pending').orderBy('id').then(data => res.json(data))
})

app.post('/admin', (req,res) => {
	const { username, password } = req.body;
	if (!username || !password){
		return res.status(400).json('incorrect form submission');
	}
	db.select('username', 'password').from('admin')
		.where('password', '=', password)
		.then(data => {
			if (password === data[0].password) {
				return db.select('*').from('admin')
					.where('username', '=', username)
					.then(user => {
						res.json(user[0])
					})
					.catch(err => res.status(400).json('unable to get user'))
				}
			}
		)
})

app.post('/insertapproved', (req,res) => {
	const {ign} = req.body;
	db('approved')
	.insert({
		ign: ign,
		joined: new Date()
	})
	.returning('*')
	.then(player => {
		res.json(player[0])
	})	
})

app.post('/insertpending', (req,res) => {
	const {ign} = req.body;
	db('pending')
	.insert({
		ign: ign,
		joined: new Date()
	})
	.returning('*')
	.then(player => {
		res.json(player[0])
	})	
})

app.get('/clearapproved', (req,res) => {
	db('approved').truncate().then(data => res.json('approved cleared'))
})

app.get('/clearpending', (req,res) => {
	db('pending').truncate().then(data => res.json('pending cleared'))
})

app.get('/clearparticipants', (req,res) => {
	db('players').truncate().then(data => res.json('participants cleared'))
})

app.post('/generatecode', (req,res) => {
	const {code} = req.body;
	db('generatedcodes')
	.insert({
		code: code
	})
	.returning('*')
	.then(data => {
		res.json(data[0])
	})	
})

app.get('/latestcode', (req,res) => {
	db.select('code').from('generatedcodes').orderBy('id', 'desc').limit(1).then(data => res.json(data))
})

app.get('/randomize', (req,res) => {
	db.select('ign').from('players').orderBy(knex.raw('RANDOM()')).then(data => res.json(data))
})


app.listen(process.env.PORT || 3000, () => {
	console.log(`App is runnin on port ${process.env.PORT}`)
});