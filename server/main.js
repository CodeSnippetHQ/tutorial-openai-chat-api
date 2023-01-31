import express from 'express'
import * as path from 'path'
import bodyParser from 'body-parser'
import fetch from 'node-fetch'
import * as dotenv from 'dotenv'
import {enrichUserPromptWithContext} from "./utils.js";

// load environment variables from .env file
dotenv.config();

// initialize express app
export const app = express()

// parse application/json request bodies
app.use(bodyParser.json())

// serve static files from client folder (js, css, images, etc.)
app.use(express.static(path.join(process.cwd(), 'client')))

// create http post endpoint that accepts user input
// and sends it to OpenAI Completions API
// then returns the response to the client
app.post('/api/openai', async (req, res) => {
    const { question } = req.body;

    // send a request to the OpenAI API with the user's prompt
    const response = await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        // construct the request payload
        // to be sent to the OpenAI API,
        // passing in an 'enriched' version
        // of the user's prompt
        body: JSON.stringify({
            model: 'text-davinci-003',
            prompt: enrichUserPromptWithContext(question),
            // the maximum number of tokens/words the bot should return
            // in response to a given prompt
            max_tokens: 100,
        }),
    });
    // parse the response from OpenAI as json
    const data = await response.json();
    res.json({ data: data.choices[0].text });
});

// set the port to listen on
// which is either the port specified in the .env
// or 3000 if no port is specified
const PORT = process.env.PORT || 3000;

// start the express server
app.listen(PORT, () => console.log(`Server listening on localhost:${PORT}`));

