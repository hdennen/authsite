const express = require('express');
const serveStatic = require('serve-static');
const rp = require('request-promise-native');
const app = express();

const port = process.env.PORT || 3000; // prod port needs to be set for node as environment variable
const endpoint = 'https://betapistaging.hollywoodbets.net:443/api/punters/checkexistingclient?searchString=';

const ipMap = new Map();

function externalAuth(authToken) {
    const request = endpoint+authToken;

    options = {
        url: request,
        headers: {
            Accept: 'application/json',
        },
        json: true
    };

    return rp(options)
}

function validate(authRes) {
    return authRes.responseMessage === 'Success';
}

function redirect(res) {
    res.redirect('https://winningform-client.azurewebsites.net/');
}

function checkCache(ip) {
    return ipMap.has(ip);
}

function checkUser(req, res, next) {
    // must put token on query '?authToken='
    cachedValid = checkCache(req.ip);

    if (cachedValid) {
        next();
        return;
    }

    externalAuth(req.query.authToken)
        .then((authRes) => {
            const isValid = validate(authRes);

            if (isValid) {
                ipMap.set(req.ip, 1);
                next();
            } else redirect(res);
        })
        .catch((e) => {
            console.dir(e)
        });
}

app.use(checkUser);
app.use(serveStatic('guide'));
app.listen(port, () => {
    console.dir(`Listening on port ${port}`);
    console.dir(`validation endpoint: ${endpoint}`);
});

