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

/* eslint max-len: 0 */

"use strict";
// Lyrebird Vocal Avatar API init
const AvatarAPI = require("./avatar");
const avatar = new AvatarAPI(
  process.env.LYREBIRD_AVATAR_URL,
  process.env.LYREBIRD_CLIENT_ID,
  process.env.LYREBIRD_CLIENT_SECRET
);

//Public Cloud storage init
const https = require("https");
const googleStorage = require("@google-cloud/storage");
const storage = googleStorage({
  projectId: process.env.FIREBASE_PROJECT_ID,
  keyFilename: "serviceAccountKey.json"
});
const bucket = storage.bucket("zawiya-mtl.appspot.com");
const BUCKET_URL = "https://storage.googleapis.com/zawiya-mtl.appspot.com";
const { ssml } = require("./utils");

const SAMPLE_JOKES = [
  "There are 10 types of people in this world, those who understand binary and those who don't",
  "Why did the developer go broke? Because he used up all his cache",
  "I changed my password to incorrect. So whenever I forget what it is the computer will say Your password is incorrect"
];

const generateJokes = token => {
  SAMPLE_JOKES.forEach(async joke => {
    await avatar.generate(token, joke);
  });
};

const getGeneratedJokes = token => {
  avatar.getGenerated(token);
};

const getVoicifiedJokes = async token => {
  const len = SAMPLE_JOKES.length;
  const audios = await avatar.getGenerated(token);
  let promises = [];
  for (let i = 0; i < len; i++) {
    promises.push(
      redirectSignedUrlToPublicCloudStorage(
        getJokeKey(audios[i].text),
        audios[i].url
      )
    );
  }
  return Promise.all(promises);
};

const getJokeKey = joke => {
  return joke
    .toLowerCase()
    .split(" ")
    .slice(0, 3)
    .join("_");
};

const redirectSignedUrlToPublicCloudStorage = (key, url) => {
  return new Promise(function(resolve, reject) {
    const remoteReadStream = bucket.file(key + ".wav").createWriteStream({
      metadata: {
        contentType: "audio/wav"
      }
    });
    const request = https.get(url, response => {
      if (response) {
        response
          .pipe(remoteReadStream)
          .on("error", function(err) {
            console.log(`${err}`);
            reject(key);
          })
          .on("finish", function() {
            console.log(`${key} piped to ${url}`);
            resolve(key);
          });
      }
    });
  });
};

const baseResponses = {
  askJoke: "Ask me for a joke."
};

const completeResponses = {
  didNotUnderstand: `Sorry, I didn't understand you. ${baseResponses.askJoke}.`,
  welcome:
    `Welcome! ${baseResponses.askJoke} ` + `You can say "tell me a joke".`,

  /**
   * @param {array} jokeKeys
   * @return {string}
   */
  getRandomJoke: jokeKeys => {
    console.log("getRandomJoke");
    const aRandomJoke = jokeKeys[(jokeKeys.length * Math.random()) << 0];
    console.log(`${BUCKET_URL}/${aRandomJoke}.wav`);
    return ssml`<speak>
       This is one of Mouhamadou's funniest joke
       <break time="1s"/>
       <audio src="${BUCKET_URL}/${aRandomJoke}.wav">
         <desc>A random joke from Mouhamadou.</desc>
         The joke failed to load.
       </audio>
       <break time="1s"/>
       <audio src="https://actions.google.com/sounds/v1/human_voices/man_laugh_and_knee_slap.ogg">
         <desc>Laughing.</desc>
         Laughing man failed to load.
       </audio>
       This joke was created using Lyrebird Vocal Avatar API. To learn more please visit www.lyrebird.ai
       <break time="1s"/>
     </speak>
     `;
  },
  /**
   * @return {string}
   */
  createMyVoice: () => {
    return ssml`<speak>
       To create your digital voice, please visit www.lyrebird.ai
     </speak>
     `;
  },

  /**
   * @return {string}
   */
  whoAmI: () => {
    return ssml`<speak>
     <audio src="https://storage.googleapis.com/zawiya-mtl.appspot.com/mouhamadou_.wav">
       <desc>Mouhamadou presentation</desc>
       Laughing man failed to load Mouhamadou who am I
     </audio>
     <break time="1s"/>
       This voice was created using Lyrebird Vocal Avatar API. To learn more about it, please visit www.lyrebird.ai
     </speak>
     `;
  }
};

module.exports = { completeResponses, getVoicifiedJokes, generateJokes };
