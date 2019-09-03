const express = require('express');
const serveStatic = require('serve-static');
const rp = require('request-promise-native');
const CronJob = require('cron').CronJob;

const app = express();
const port = process.env.PORT || 3000;

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

function isValid(authRes) {
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

    if (checkCache(req.ip)) {
        next();
        return;
    }

    if (!req.query.authToken) redirect(res);

    externalAuth(req.query.authToken)
        .then((authRes) => {

            if (isValid(authRes)) {
                ipMap.set(req.ip, new Date(Date.now()));
                next();
            } else redirect(res);
        })
        .catch((e) => {
            console.dir(e)
        });
}

let options = {
    extensions: ['htm', 'html'],
    index: 'index.htm'
};

app.use(checkUser);
app.use(serveStatic('guide', options));
app.listen(port, () => {
    console.dir(`Listening on port ${port}`);
    console.dir(`validation endpoint: ${endpoint}`);
});

new CronJob('* * * * *', () => {
    let now = new Date(Date.now());
    ipMap.forEach((item, key)  => {
        if (item > now) ipMap.delete(key);
    });
}, null, true, 'Africa/Johannesburg');

