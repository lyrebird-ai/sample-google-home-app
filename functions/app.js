// Copyright 2018, Lyrebird, Inc.
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

"use strict";

const app = require("actions-on-google").dialogflow({ debug: true });
const { ssml } = require("./utils");
const {
  completeResponses,
  getVoicifiedJokes,
  generateJokes
} = require("./jokes");

let jokeKeys;
const welcome = async conv => {
  const token = conv.user.access.token;
  if (!token) {
    return conv.ask("You need to sign in before using the app.");
  }
  // Getting the last 3 generated jokes
  await generateJokes(token);
  const voicifiedJokes = getVoicifiedJokes(token);
  return voicifiedJokes
    .then(keys => {
      conv.ask(completeResponses.welcome);
      jokeKeys = keys;
      return Promise.resolve();
    })
    .catch(err => {
      conv.ask("An error happened.");
      return Promise.resolve();
    });
};

const fallback = conv => {
  conv.ask(completeResponses.didNotUnderstand);
};

const tellJoke = conv => {
  conv.ask(completeResponses.getRandomJoke(jokeKeys));
};

const createMyVoice = conv => {
  conv.ask(completeResponses.createMyVoice());
};

const whoAmI = conv => {
  conv.ask(completeResponses.whoAmI());
};

app.intent("Welcome", welcome);
app.intent("Fallback", fallback);
app.intent("Tell me a joke", tellJoke);
app.intent("How can I create my voice", createMyVoice);
app.intent("Who Am I", whoAmI);


module.exports = app;
