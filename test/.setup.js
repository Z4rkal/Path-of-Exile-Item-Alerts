require("@babel/register")();

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