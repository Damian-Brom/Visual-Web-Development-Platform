import http from 'http';
import fs from 'fs/promises';
import url from 'url';
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import querystring from 'querystring';
import ejs from 'ejs';

const PORT = 8000;
const JWT_SECRET = '123456';
const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'appdb';

// MongoDB setup
let db;
(async () => {
    try {
        const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        db = client.db(DB_NAME);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
    }
})();

const serveFile = async (filePath, contentType, res) => {
    try {
        const data = await fs.readFile(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    } catch (err) {
        console.error('Failed to serve file', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
};

const renderFile = async (filePath, data, res) => {
    try {
        const template = await fs.readFile(filePath, 'utf-8');
        const rendered = ejs.render(template, data);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(rendered);
    } catch (err) {
        console.error('Failed to render file', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
};

const handleRegister = async (req, res) => {
    try {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', async () => {
            const { username, password } = querystring.parse(body);
            const existingUser = await db.collection('users').findOne({ username });
            if (existingUser) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Username already exists');
                return;
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            await db.collection('users').insertOne({
                username,
                password: hashedPassword,
                pages: [] // Initialize pages as an empty array
            });
            res.writeHead(302, { 'Location': '/login' });
            res.end();
        });
    } catch (err) {
        console.error('Failed to handle register', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
};

const handleLogin = async (req, res) => {
    try {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', async () => {
            const { username, password } = querystring.parse(body);

            if (!db) {
                console.error('Database connection is not established');
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
                return;
            }

            const user = await db.collection('users').findOne({ username });
            if (!user || !(await bcrypt.compare(password, user.password))) {
                console.error('Invalid credentials');
                await renderFile('public/login.html', { errorMessage: 'Invalid username or password' }, res);
                return;
            }

            const token = jwt.sign({ userId: user._id }, JWT_SECRET);
            res.writeHead(302, {
                'Set-Cookie': cookie.serialize('token', token, { httpOnly: true }),
                'Location': '/homepage'
            });
            res.end();
        });
    } catch (err) {
        console.error('Failed to handle login', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
};

const handleLogout = (req, res) => {
    try {
        res.writeHead(302, {
            'Set-Cookie': cookie.serialize('token', '', { httpOnly: true, maxAge: 0 }),
            'Location': '/login'
        });
        res.end();
    } catch (err) {
        console.error('Failed to handle logout', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
};

const requireAuth = async (req, res, next) => {
    try {
        const cookies = cookie.parse(req.headers.cookie || '');
        const token = cookies.token;
        if (!token) {
            res.writeHead(302, { 'Location': '/login' });
            res.end();
            return;
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
        if (!req.user) {
            res.writeHead(302, { 'Location': '/login' });
            res.end();
            return;
        }
        next();
    } catch (err) {
        console.error('Failed to require auth', err);
        res.writeHead(302, { 'Location': '/login' });
        res.end();
    }
};

const handle404 = async (res) => {
    try {
        await serveFile('public/404.html', 'text/html', res);
    } catch (err) {
        console.error('Failed to serve 404 page', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
};

const savePageContent = async (req, res) => {
    try {
        const cookies = cookie.parse(req.headers.cookie || '');
        const token = cookies.token;
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = new ObjectId(decoded.userId);

        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', async () => {
            const { pageId, pageTitle, content, threeJsElements } = JSON.parse(body);

            const result = await db.collection('users').updateOne(
                { _id: userId, 'pages.pageId': pageId },
                { $set: { 'pages.$.content': content, 'pages.$.pageTitle': pageTitle, 'pages.$.threeJsElements': threeJsElements } }
            );

            if (result.matchedCount === 0) {
                await db.collection('users').updateOne(
                    { _id: userId },
                    { $push: { pages: { pageId, pageTitle, content, threeJsElements } } }
                );
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
        });
    } catch (err) {
        console.error('Failed to save page content', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
};

const loadPageContent = async (req, res) => {
    try {
        const cookies = cookie.parse(req.headers.cookie || '');
        const token = cookies.token;
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = new ObjectId(decoded.userId);
        const pageId = req.url.split('?')[1];

        const user = await db.collection('users').findOne({ _id: userId });
        if (user && user.pages) {
            const page = user.pages.find(p => p.pageId === pageId);
            if (page) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ pageTitle: page.pageTitle, content: page.content, threeJsElements: page.threeJsElements }));
                return;
            }
        }
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('No page content found');
    } catch (err) {
        console.error('Failed to load page content', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
};

const loadPages = async (req, res) => {
    try {
        const cookies = cookie.parse(req.headers.cookie || '');
        const token = cookies.token;
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = new ObjectId(decoded.userId);

        const user = await db.collection('users').findOne({ _id: userId });
        if (user && user.pages) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ pages: user.pages }));
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('No pages found');
        }
    } catch (err) {
        console.error('Failed to load pages', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
};

const deletePageContent = async (req, res) => {
    try {
        const cookies = cookie.parse(req.headers.cookie || '');
        const token = cookies.token;
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = new ObjectId(decoded.userId);
        const pageId = new URL(req.url, `http://${req.headers.host}`).searchParams.get('pageId');

        await db.collection('users').updateOne(
            { _id: userId },
            { $pull: { pages: { pageId } } }
        );
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
    } catch (err) {
        console.error('Failed to delete page content', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
};

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    if (req.method === 'GET') {
        if (pathname === '/') {
            await renderFile('public/home.html', {}, res);
        } else if (pathname === '/login') {
            await renderFile('public/login.html', { errorMessage: '' }, res); // Ensure errorMessage is set
        } else if (pathname === '/style_login.css') {
            await serveFile('public/style_login.css', 'text/css', res);
        } else if (pathname === '/style_main.css') {
            await serveFile('public/style_main.css', 'text/css', res);
        } else if (pathname === '/style_preview.css') {
            await serveFile('public/style_preview.css', 'text/css', res);
        } else if (pathname === '/script.js') {
            await serveFile('public/script.js', 'application/javascript', res);
        } else if (pathname === '/script_preview.js') {
            await serveFile('public/script_preview.js', 'application/javascript', res);
        } else if (pathname === '/register') {
            await serveFile('public/register.html', 'text/html', res);
        } else if (pathname === '/style_register.css') {
            await serveFile('public/style_register.css', 'text/css', res);
        } else if (pathname === '/homepage') {
            requireAuth(req, res, async () => {
                const user = req.user;
                await renderFile('public/main.html', { username: user.username }, res);
            });
        } else if (pathname === '/preview') {
            requireAuth(req, res, async () => {
                const user = req.user;
                await renderFile('public/preview.html', { username: user.username }, res);
            });
        } else if (pathname === '/loadPageContent') {
            await loadPageContent(req, res);
        } else if (pathname === '/loadPages') {
            await loadPages(req, res);
        } else {
            await handle404(res);
        }
    } else if (req.method === 'POST') {
        if (pathname === '/register') {
            await handleRegister(req, res);
        } else if (pathname === '/login') {
            await handleLogin(req, res);
        } else if (pathname === '/logout') {
            handleLogout(req, res);
        } else if (pathname === '/savePageContent') {
            await savePageContent(req, res);
        } else {
            await handle404(res);
        }
    } else if (req.method === 'DELETE') {
        if (pathname === '/deletePageContent') {
            await deletePageContent(req, res);
        } else {
            await handle404(res);
        }
    } else {
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Method Not Allowed');
    }
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});