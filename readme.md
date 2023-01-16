Simple CRUD API

[Task](https://github.com/AlreadyBored/nodejs-assignments/blob/main/assignments/crud-api/assignment.md)

## Install packages

`npm install`

## Run

Run the application in development mode

`npm run start:dev`

Run the application in production mode

`npm run start:prod`

Run cluster mode with load balancer and one in-memory-database for all workers

`npm run start:multi`

Run tests scenarios for API

`npm run test`  or  `npm test`

## API

Required fields


name — user's name [type: string]

age — user's age [type:number]

hobbies — user's hobbies [type: array of strings]


`GET api/users` - to get all users

`GET api/users/${userId}` - to get user by id (uuid)

`POST api/users` - to create record about new user and store it in database

`PUT api/users/${userId}` - to update existing user (all fields required)

`DELETE api/users/${userId}` - to delete existing user from database
