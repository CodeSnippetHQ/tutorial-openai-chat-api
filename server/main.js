import express from 'express'
import * as path from 'path'
import bodyParser from 'body-parser'
import fetch from 'node-fetch'
import * as dotenv from 'dotenv'

// load environment variables from .env file
dotenv.config();

// initialize express app
export const app = express()

// parse application/json request bodies
app.use(bodyParser.json())

// serve static files from client folder (js, css, images, etc.)
app.use(express.static(path.join(process.cwd(), 'client')))

// define a list of messages to be used as context for the chat
// using the global scope that way it can be used elsewhere on the server, if needed
// (this use of `global` shouldn't be done in a "real" app)
global.messages = [
    {
        role: "system",
        content: "You are part of the team Absolute Zero #12096. Your job is to answer any questions the judges may have about the team in the pit"
    },
    {
        role: "system",
        content: "Absolute Zero is a First Tech Challenge Team Located in Sterling, VA and have the won first place Inspire at their 3rd qualifier at Harrisonsburg."
    },
    {
        role: "system",
        content: "You must talk in short sentences."
    },
    
];

// create http post endpoint that accepts user input
// and sends it to OpenAI Chat API
// then returns the response to the client
app.post('/api/openai', async (req, res) => {
    const { message } = req.body;

    // store user message in global message state
    const userMessage = { role: "user", content: message };

    // add to global messages list
    global.messages.push(userMessage);

    // send a request to the OpenAI API with the user's prompt
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        // construct the request payload
        // using the entire chat history (global.messages)
        // sending an external request to the OpenAI API
        body: JSON.stringify({
            model: 'gpt-4',
            messages: global.messages,
            // the maximum number of tokens/words the bot should return
            // in response to a given prompt
            max_tokens: 100,
        }),
    });

    if (!response.ok) {
        // if the request was not successful, parse the error
        const error = await response.json();

        // log the error for debugging purposes
        console.error('OpenAI API Error:', error);

        // return an error response to the client
        return res.json({ status: 'error', data: null });
    }

    // parse the response from OpenAI as json
    const data = await response.json();

    // get the bot's answer from the OpenAI API response
    const botAnswer = data?.choices?.[0]?.message?.content

    // create the bot message object
    const botMessage = { role: "assistant", content: botAnswer };

    // store bot message in global message state
    global.messages.push(botMessage);

    // send the bot's answer back to the client
    return res.json({ status: 'success', data: botAnswer });
});

// set the port to listen on
// which is either the port specified in the .env
// or 3000 if no port is specified
const PORT = process.env.PORT || 3000;

// start the express server
app.listen(PORT, () => console.log(`Server listening on localhost:${PORT}`));

