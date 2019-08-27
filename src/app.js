const express = require('express');
const serveStatic = require('serve-static');
const rp = require('request-promise-native');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const endpoint = 'http://google.com';

function externalAuth(authToken) {
    return rp(endpoint)
}

function getAuthToken(req) {
    return req;
}

function checkUser(req, res, next) {
    const filename = path.basename(req.url);
    const extension = path.extname(filename);
    console.log(`The file ${filename} was requested with extension ${extension}`);

    const authToken = getAuthToken(req);

    externalAuth(authToken)
        .then(() => {
            next();
        })
}

app.use(checkUser);
app.use(serveStatic('guide'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

