require("@babel/register")();
process.env.NODE_ENV = 'TEST';

const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');

const rawCData = require('./lib/rawCData');
const leagueData = require('./lib/leagueData');
const testId = require('./lib/testId');
const stashData1 = require('./lib/stashData1');
const stashData2 = require('./lib/stashData2');
const stashData3 = require('./lib/stashData3');
const stashData4 = require('./lib/stashData4');
const stashData5 = require('./lib/stashData5');
const md1 = require('./lib/mockStash1');
const md2 = require('./lib/mockStash2');
const md3 = require('./lib/mockStash3');
const md4 = require('./lib/mockStash4');
const md5 = require('./lib/mockStash5');
const md6 = require('./lib/mockStash6');
const md7 = require('./lib/mockStash7');
const md8 = require('./lib/mockStash8');
const md9 = require('./lib/mockStash9');
const md10 = require('./lib/mockStash10');

const mock = new MockAdapter(axios);

mock
    .onGet('https://api.poe.watch/get?category=currency&league=Legion')
    .reply(200, rawCData);

mock
    .onGet('https://api.pathofexile.com/leagues?type=main&offset=4&compact=1&limit=1')
    .reply(200, leagueData)
    .onGet('https://api.poe.watch/id')
    .reply(200, testId);

//Mocks for the 5 chunks of actual data from the GGG API
mock
    .onGet('https://www.pathofexile.com/api/public-stash-tabs?id=447010774-463577235-436918901-500591518-475195838')
    .reply(200, stashData1)
    .onGet('https://www.pathofexile.com/api/public-stash-tabs?id=447010817-463577289-436918925-500591543-475195882')
    .reply(200, stashData2)
    .onGet('https://www.pathofexile.com/api/public-stash-tabs?id=447010848-463577326-436918960-500591589-475195909')
    .reply(200, stashData3)
    .onGet('https://www.pathofexile.com/api/public-stash-tabs?id=447010903-463577356-436918984-500591644-475195931')
    .reply(200, stashData4)
    .onGet('https://www.pathofexile.com/api/public-stash-tabs?id=447010944-463577396-436919033-500591682-475195991')
    .reply(200, stashData5)
    //This one is to handle the next change id of chunk 5 just in case it gets called somehow
    .onGet('https://www.pathofexile.com/api/public-stash-tabs?id=447010984-463577428-436919073-500591734-475196036')
    .reply(500, 'All done :)');

//Mocks for the 10 chunks of mock stash data to test removing items and adding new items to tabs
mock
    .onGet('https://www.pathofexile.com/api/public-stash-tabs?id=mock-1')
    .reply(200, md1)
    .onGet('https://www.pathofexile.com/api/public-stash-tabs?id=mock-2')
    .reply(200, md2)
    .onGet('https://www.pathofexile.com/api/public-stash-tabs?id=mock-3')
    .reply(200, md3)
    .onGet('https://www.pathofexile.com/api/public-stash-tabs?id=mock-4')
    .reply(200, md4)
    .onGet('https://www.pathofexile.com/api/public-stash-tabs?id=mock-5')
    .reply(200, md5)
    .onGet('https://www.pathofexile.com/api/public-stash-tabs?id=mock-6')
    .reply(200, md6)
    .onGet('https://www.pathofexile.com/api/public-stash-tabs?id=mock-7')
    .reply(200, md7)
    .onGet('https://www.pathofexile.com/api/public-stash-tabs?id=mock-8')
    .reply(200, md8)
    .onGet('https://www.pathofexile.com/api/public-stash-tabs?id=mock-9')
    .reply(200, md9)
    .onGet('https://www.pathofexile.com/api/public-stash-tabs?id=mock-10')
    .reply(200, md10)
    .onGet('https://www.pathofexile.com/api/public-stash-tabs?id=all-done')
    .reply(500, 'All done :)');

//Setup code taken from enzyme docs
const { JSDOM } = require('jsdom');

const jsdom = new JSDOM(`<!DOCTYPE html>
<html lang='en'>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.css' />
    <!-- <link rel='stylesheet' href='css/style.css' /> -->
    <link rel="icon" type="image/png" href="https://cdn1.iconfinder.com/data/icons/flags-of-the-world-2/128/trans-flag-circle-512.png">
    <title>Mortgage Calculator</title>
</head>

<body>
    <div id="root"></div>
    <script src="bundle.js"></script>
</body>
</html>`);

const { window } = jsdom;

function copyProps(src, target) {
  Object.defineProperties(target, {
    ...Object.getOwnPropertyDescriptors(src),
    ...Object.getOwnPropertyDescriptors(target),
  });
}

global.window = window;
global.document = window.document;
global.navigator = {
  userAgent: 'node.js',
};
global.requestAnimationFrame = function (callback) {
  return setTimeout(callback, 0);
};
global.cancelAnimationFrame = function (id) {
  clearTimeout(id);
};
copyProps(window, global);