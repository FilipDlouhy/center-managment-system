## Center managment system

## System architecture

System on the backend side is composed of 4 microservices and one api-gateway through which all api-requests go. How it works ?
Sample request: /api/center/create-center first part is name of the micro-service where request wil go and second part will be transformed to kebab case so in this case createCenter and that is the message by which the coresponding function is assigned to request. Backend also has common module which has rmq contsatns database entities and common functions.UI is in react and all request are comming to the port 3000, ui has two sides admin and user side, user can create and delete tasks and admin can create and delete centers also admin sees evertyhing that happens in the system.Nginx configuration sets up a reverse proxy to route traffic to your backend and frontend services. All requests to /api/ are routed to the backend service, and all other requests are routed to the frontend service. Nginx also handles connection upgrades for WebSockets and logs errors and access data.

## Database

Database has 4 entities(tables) user which has one to many relationship tasks. Properties of the entity are id:number, name:string, password:string, email:string, admin:bool.

Task entity(table) it has many to one relationship to front and user. id:number, description:string, status:string, createdAt:date, whenAddedToTheFront:date, processedAt:number
whenAddedToTheFront is property by which next wask thath will be processed by the center is chosen.
status represents if it is scheduled or not in the front, is being processed by the front or is already done.
processedAt:represent number of miliseconds when task will be done and by it and createdAt if task is unscheduled is selected next task to the front.

Front entity(table) it has many one to one relationship to center  
id:number,
maxTasks: number, maximum number of tasks which can front have
taskTotal: number, tasks which are in the front
timeToCompleteAllTasks:number timeToCompleteAllTasks with taskTotal is used to find least tasks or lest time to complete them all

Center entity(table) it has one to one relationship with the front
id:number,
name:string

If you want to acces db through mysql workbench for example add port to docker-compose

## How download system

# Prerequisites

If you dont have https://docs.docker.com/compose/install

## Installation

1. Run `git clone https://github.com/Rajce23/center-managment-system.git`
2. Run `cd center-managment-system`
3. Run `docker compose build`
4. Run `docker compose run backend npm install`
5. Run `docker compose run frontend npm install` if this fails than delete node_modules and run this command again
6. Run `docker compose up`
7. Open `http://localhost/`
8. Run `node .\initiSystem.js ` this script simulates users requerements

## How to use the app

# Backend endpoint testing

If you want to test api endopints they are all im rqm lib module. Every object has property that looks like this createCenter and enpoint allways looks like this: /apiPrefix/nameOfTHeService/nameOfThePropInRmqMessageObject. Use Postman or any other tool you want to test. If you want to change time that tasks takes to complete or how many tasks user has it is in lib/database/length.constant.ts

# Frontend

When you start frontend after you ran script for simulating requierements you can login as christopher62@yahoo.com with password 1234 to use user side or if you want to use admin than admin@dmin.com and pasword is 1234
User can create task and see its state if it is scheduled, unscheduled, doing
or done. As a user you can also create task and watch its progress. As admin you can see all users and their tasks as well as centers and their load and you can create and delete centers.

# Tasks generating

When you initially install the system you can only invoke initSystem.js once because it would fail on adding admin user also you can do `node .\createCenter.js` which generates centers if you have too much tasks center when created is automattically filled with unscheduled tasks or `node .\generateRequerementsAndUsers.js` which generates users with one task

## Problems for me

Overall architecture: I strugelled a bit how to do it before i landed on the 4 microservice and api gateway solution.

Docker: This the greatest challange for me in this project nad by the end of this i still dont 100% know how to use it.
