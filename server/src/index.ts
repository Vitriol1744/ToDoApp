import express, { Request, Response } from 'express';
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const Sequelize = require('sequelize');
import {Model, UniqueConstraintError} from 'sequelize'
import * as path from "path";
const db = require('./models');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookieParser = require("cookie-parser");

const livereload = require("livereload");

const liveReloadServer = livereload.createServer();
const connectLivereload = require("connect-livereload");

liveReloadServer.watch(path.join(__dirname, 'public'));

const sequelize = new Sequelize('todoapp', 'root', '',
	{
		host: 'localhost',
		dialect: 'sqlite'
	});

sequelize.authenticate()
	.then(() => console.log('Connection has been established successfully.'))
	.catch((err: Error) => console.error('Unable to connect to the database:\n', err));

const app = express();
app.use(morgan('combined'))
app.use(bodyParser.json())
// {credentials: true, origin: true, withCredentials: true }
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(cookieParser());
app.use(connectLivereload())

liveReloadServer.server.once("connection", () => {
	setTimeout(() => {
		liveReloadServer.refresh("/");
	}, 100);
});

async function validateUser(password: string, hash: string): Promise<boolean>
{
	let ret = false;
	await bcrypt
		.compare(password, hash)
		.then((status: boolean) => ret = status)
		.catch((err: Error) => console.error(err.message))
	return ret;
}

async function hashPassword(password: string)
{
	let userHash = '';
	await bcrypt
		.hash(password, 10)
		.then((hash: string) =>
		{
			userHash = hash
			console.log(hash);
			console.log(userHash);
		})
		.catch((err: Error) => console.error(err.message));

	return userHash;
}

app.post('/register', async(req : Request, res : Response) =>
{
	const  password = req.body.password;

	req.body.password = await hashPassword(password);
	console.log(`password: ${password}, hashed: ${req.body.password}`);
	return await db.User.create(req.body)
		.then((user: typeof db.User) => res.send({message: 'Your user was registered!', log: `Your user was registered!, following data was submitted to the database: ${JSON.stringify(user)}`}))
		.catch((err: UniqueConstraintError) =>
		{
			let message;
			const fields = ((err.fields as unknown) as string[]);
			if (fields.includes('email'))
				message = ('user with this email already exists');
			else if (fields.includes('phone'))
				message = ('user with this phone number already exists');

			console.log('***There was an error registering a user');
			return res.status(403).send({ message: 'Failed to register user!\n'+message, log: `Failed to register user!\n ${err}`})
		});
});
app.post('/login', async (req: Request, res: Response) =>
{
	try
	{
		const { email, password } = req.body
		const user = await db.User.findOne(
		{
			where: { email: email }
		})

		if (!user)
		{
			console.log('failed to find user!');
			return res.status(403).send(
			{
				message: 'The login information was incorrect',
				log: 'status: failure',
				status: false
			})
		}
		const isPasswordValid = await validateUser(password, user.password)
		if (!isPasswordValid)
		{
			console.log('invalid password');
			return res.status(403).send({
				message: 'The login information was incorrect',
				log: 'status: failure',
				status: false
			})
		}
		else
			console.log('Successfully logged in!');
		const userJson = JSON.stringify(user);
		console.log(userJson)
		const token = await jwt.sign(userJson, 'secret')

		res.cookie('userToken', token, { maxAge: 7*24*60*60*1000, httpOnly: true, sameSite: "none", secure: true })
			.send({
			message: 'Successfully logged in!',
			log: 'status: success',
			userToken: token,
			status: true
		});
	}
	catch (err)
	{
		console.log(err);
		res.status(500).send({
			message: 'An error has occurred trying to log in',
			log: 'status: failure',
			status: false
		})
	}
});
app.post('/verify', async (req: Request, res: Response) =>
{
	let userData;
	console.log(req.cookies['userToken']);
	await jwt.verify(req.cookies['userToken'], 'secret', (err: unknown, decoded: unknown) =>
	{
		console.log(JSON.stringify(decoded));
		userData = decoded;
	});
	userData != undefined ? res.send({ status: true }) : res.status(403).send({ status: false });
	// console.log(userData);
	// const status = userData != undefined;
	// console.log(status);
	// res.send({ status: status })
});
app.post('/get_todos', async (req: Request, res: Response) =>
{
	let userData;
	await jwt.verify(req.cookies['userToken'], 'secret', (err: unknown, decoded: unknown) => userData = decoded)
	// console.log ('userData', JSON.stringify(userData));
	const user = await db.User.findOne(
		{
	// @ts-ignore
			where: { email: userData["email"] }
		});


	interface Task
	{
		name: string,
		description: string,
		priority: number
	};
	interface Project
	{
		name: string,
		description: string,
		tasks: Task[]
	}

	let projectsList: Project[] = [];
	const projects = await db.Project.findAll({ where: { userID: user.id }});
	for (const project of projects)
	{
		let current: Project;
		// @ts-ignore
		// let tasks: { name: string, description: string, priority: number}[];
		let todos: Task[] = [];
		const tasks = await db.Task.findAll({ where: { projectID: project.id }});
		for (const task of tasks)
		{
			todos.push({name: task.name, description: task.description, priority: task.priority});
			console.log(JSON.stringify(task));
		}
		current = { name: project.name, description: project.description, tasks: todos };
		projectsList.push(current);
	}

	res.send({projects: projectsList});
	console.log(JSON.stringify(projectsList));
	// console.log(JSON.stringify(user));
	// console.log(JSON.stringify(projects));
})
app.post('/logout', async (req: Request, res: Response) =>
{
	console.log('logging out...');
	res.clearCookie('userToken').header('Refresh:0').send();
})

sequelize.sync().then(() =>
{
	const port: number = 3000;
	app.listen(port);
	console.log(`Server started at port ${port}`);
})
