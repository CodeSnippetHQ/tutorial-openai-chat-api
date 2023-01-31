// handle when the user submits a question through the form
async function handleSubmitQuestion(question) {

    // input validation
    if (!question) {
        return alert('Please enter your support question');
    }

    // add the user's question to the DOM
    addUserQuestionToDialogueBox(question);

    // fetch request to openai completions api that logs the response
    const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
    });

    // parse the response as json
    const { data } = await response.json();
    return data
}

// add the user's question to the dialogue box
function addUserQuestionToDialogueBox(question) {
    // create a new li element
    const userQuestion = document.createElement('li');

    // add user-specific styling to element
    userQuestion.classList.add('bg-indigo-500', 'text-white', 'rounded', 'p-2', 'w-fit', 'self-end', 'break-words');

    // add the user's question to the element
    userQuestion.innerText = question;

    // add the li element to the DOM
    document.getElementById('dialogue').appendChild(userQuestion);

    // clear the input for the next question
    document.getElementById('prompt-input').value = '';
}

// add the chatbot's response to the dialogue box
function addBotResponseToDialogueBox(response) {
    // create a new li element
    const botResponse = document.createElement('li');

    // add user-specific styling to element
    botResponse.classList.add('bg-gray-500', 'text-white', 'rounded', 'p-2', 'w-fit', 'self-start');

    // add the user's response to the element
    botResponse.innerText = response.trim();

    // add the li element to the DOM
    document.getElementById('dialogue').appendChild(botResponse);

    // clear the input for the next response
    document.getElementById('prompt-input').value = '';
}

// when the window loads, add an event listener to the form
// that calls the handleSubmitQuestion function when the form is submitted
window.onload = () => document.getElementById('prompt-form').addEventListener('submit', (e) => {
    // prevent the form from refreshing the page
    e.preventDefault();

    // get the value of the input
    const question = document.getElementById('prompt-input').value;

    // call the function that handles the fetch request to our backend
    handleSubmitQuestion(question).then((data) => {
        // add the chatbot's response to the DOM when the fetch request is complete
        addBotResponseToDialogueBox(data);
    });
});
