
const config = require('./config');
const puppeteer = require('puppeteer');
const sleep = require('sleep-promise');

const BASE_URL = 'https://netflix.com';
const LOGIN_URL = 'https://netflix.com/login';


let browser = null;
let page = null;

const netflix = {

    initialize: async () => {

        browser = await puppeteer.launch({
            headless: config.HEADLESS,
            devtools: config.DEVTOOLS,
        });

        page = await browser.newPage();

        //await page.goto(BASE_URL);

    },

    login: async (username, password, profile=null) => {

        await page.goto(LOGIN_URL);
        await page.waitFor('#id_userLoginId');
        await page.type('#id_userLoginId', username, {delay: 25});
        await page.type('#id_password', password, {delay: 25});
        await page.click('button[type="submit"][data-uia="login-submit-button"]');
        //await page.waitForNavigation();

        if(profile == null || profile == ""){
            await page.click('.profile-icon:nth-child(1)');
        }else{
            await page.waitForXPath('//span[contains(., "'+profile+'")]');
            const [p] = await page.$x('//span[contains(., "'+profile+'")]');
            await p.click();
        }

        await page.waitForNavigation();

    },

    /**
     *
     * @param movieObject
     * @returns false or {link,title}
     */
    search: async (movieObject) => {

        if(movieObject.title == ""){
            return false;
        }

        let searchBoxSelector = 'input[type="search"]';

        let searchBoxHandle = await page.$(searchBoxSelector);
        if(searchBoxHandle == null){ // first search
            await page.click('div[class="searchBox"] button');
            await page.waitFor(searchBoxSelector);

        }else{
            searchBoxHandle.click();
            await page.evaluate(()=>document.querySelector('input[type="search"]').value = '');

        }

        await page.type(searchBoxSelector, movieObject.title,{delay: 100});
        await page.keyboard.press("Enter");
        await page.waitFor(3000);

        let suggestion = await page.$('span[class="suggestionsLabel"]');
        let cardElem = await page.$('#title-card-0-0');
        if( cardElem == null || suggestion != null ){
            return false;
        }else{
            let uri = await page.evaluate(()=>document.querySelector('#title-card-0-0 div a').getAttribute('href'));
            let title = await page.evaluate(()=>document.querySelector('#title-card-0-0 div a').getAttribute('aria-label'));
            return {
                searchObject:movieObject,
                searchResult:{
                    uri:  BASE_URL + uri.split('?')[0].replace('/watch/','/title/'),
                    title: title,
                }
            };
        }


    },

    end: async () => {
        await browser.close();
    }

};

module.exports = netflix;
