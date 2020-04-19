
const config = require('./config');
const puppeteer = require('puppeteer');
const sleep = require('sleep-promise');

const BASE_URL = 'https://www.imdb.com/';

let browser = null;
let page = null;

const imdb = {

    initialize: async () => {

        browser = await puppeteer.launch({
            headless: config.HEADLESS,
            devtools: config.DEVTOOLS,
        });

        page = await browser.newPage();

        //await page.goto(BASE_URL);

    },

    getListings: async (imdbUrl) => {

        await page.goto(imdbUrl);

        let listingHandleArray =  await page.$$(('div.lister-item-content'));

        let listingArray = [];
        for (let elmHandle of listingHandleArray) {
            let title = null,
                year = null,
                imdbRating = null;
            try {
                title = await elmHandle.evaluate(node => node.querySelector('h3 a').innerText);
                year = await elmHandle.evaluate(node => node.querySelector('.lister-item-year').innerText);
                imdbRating = await elmHandle.evaluate(node => node.querySelector('.ratings-imdb-rating').innerText);
                listingArray.push({
                    title: title,
                    year: year,
                    imdbRating: imdbRating
                });
            } catch (error) {
                console.error('Error getting info on imdb listing: ' + title);
                console.error(error);
                //console.error(elmHandle);
            }
        }

        return listingArray;

    },

    end: async () => {
        await browser.close();
    }

};

module.exports = imdb;