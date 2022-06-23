## Description

Generic TS based message-service to provide functionality for chatting between users through chat rooms, 
with additional features like activity logs and user ban functionality

## Installation

```bash
$ git clone <this-repo>
$ npm install
```

## Running the app

```bash
$ docker build -t message-service .
$ docker-compose up
```

Then proceed to usage section

Alternatively, if you would like to run the app locally, and node_modules fail to install, it might be a node version issue (I used node 12.18.1)
In this case, install nvm with:

```bash
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
```

Then follow the instructions provided to make 'nvm' command available within your terminal
Then,

```bash
$ nvm install 12.18.1
$ nvm use 12.18.1
$ npm i
$ npm run dev
```

and run a mongo container within docker

Important: Use an IDE like webstorm to set up a run configuration and provide an ENV value for ACCESS_TOKEN_SECRET_KEY

## Usage

Simply visit the [swagger documentation](http://localhost:3000/documentation) to see all available endpoints and their required parameters

You can connect to the mongodb instance within a GUI for mongo with connection string 'mongodb://localhost:27017'

## Standard User Story:
- Use the register endpoint to create user; Create at least 2 users in this manner to test for chat functionality.
- With the retrieved access token, use this token for authorization to use other endpoints
- Click on the 'Lock' icon next to each endpoint within swagger, and enter the access token. You are now authorized to use any endpoint.
- Use the 'create room' endpoint to create a chat room
- Use the 'send message' endpoint with your created room's ID and send a message to a specific recipient.
- Use the 'Get users messages' endpoint to see your user's messages
- Conversely, test the 'block user' endpoint and block a specific username from sending you a message.
- Use the 'send message' endpoint to send a message to the user that just blocked you, and you will see an exception that the user blocked you.
- For any successful or unsuccessful logins, the logging middleware will create activity logs
- Use the 'Get logs' endpoint to see your user's logs
- Structured logging of any HTTP responses on the console is handled with a custom logging middleware

Optionally, if you would like to test real-time/socket functionality within the chat, simply use the optional client repo: message-client.
Edit the index.html file in the following way: Enter your access token in the input field with ID 'token', and enter your roomId in the input field with ID 'room'.
Open the index.html in a browser. Any messages you send will be processed by the server and will now show up on the client side.

I've added comments within the code base for any other shortcomings in the system design that would be detrimental in a production grade repo.

In the interest of meeting the deadline, I did not have time to include unit/integration/e2e tests. I apologize for this. 
Feel free to check the 'xanpool-assignment' repo within my bitbucket workspace for an example of test integrations.

