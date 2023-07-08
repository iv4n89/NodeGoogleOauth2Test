import express from 'express';
import { google } from 'googleapis';

const app = express();
app.set('views', 'src/views');
app.set('view engine', 'pug');
app.engine('pug', require('pug').__express);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const oauth2Client = new google.auth.OAuth2(
    '499622090501-c12grai49i929s098fkvejs5oj8hu24k.apps.googleusercontent.com',
    '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',
    'http://localhost:8080/auth/google/callback'
);

const redirectUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['email', 'profile']
});

let auth = false;

app.get('/', async function (req, res) {
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    if (auth) {
        const userInfo = await oauth2.userinfo.v2.me.get();
        res.render('index', { buttonSpan: 'Sign out', url: 'http://localhost:8080/logout', userInfo: userInfo.data });
    } else {
        res.render('index', { buttonSpan: 'Sign in', url: redirectUrl, userInfo: {} });
    }
});

app.get('/auth/google/callback', async function (req, res) {
    const code = req.query.code as string;
    if (code) {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        auth = true;
    }
    res.redirect('/');
});

app.get('/logout', (req, res) => {
    oauth2Client.revokeCredentials().then(r => console.log('revoke', r));
    auth = false;
    res.redirect('/');
});

app.listen(8080, () => {
    console.log('Server running on port 8080');
});
