
const config = require('./config');
const puppeteer = require('puppeteer');
const netflix = require('./netflix');
const imdb = require('./imdb');
const fs = require('fs');

(async () => {

    if(!config.NETFLIX_USERNAME || !config.NETFLIX_PASSWORD){
        console.error('Netflix credentials missing in config.js');
        process.exit(1);
    }

    if(!config.IMDB_URL){
        console.error('Imdb url missing in config.js');
        process.exit(1);
    }

    await imdb.initialize();

    let imdbObjects = await imdb.getListings(config.IMDB_URL);

    await imdb.end();

    if(imdbObjects.length == 0){
        throw "Could not get listings from imdb watchlist, make sure it is public";
    }

    await netflix.initialize();

    await netflix.login(config.NETFLIX_USERNAME, config.NETFLIX_PASSWORD, config.NETFLIX_PROFILE);

    let resultArray = [];

    for(let imdbObject of imdbObjects.slice(0,config.SEARCH_LIMIT) ){
        let result = false ;
        try{
            result = await netflix.search(imdbObject);
        }catch(error){
            console.error(error);
            console.error(imdbObject);
        }

        if(result != false){
            resultArray.push(result);
        }else{
            // do something later
        }
    }

    await netflix.end();

    let outputJSON = resultArray.length > 0 ? JSON.stringify(resultArray) : 'No listing found' ;
    fs.writeFileSync('output.json', outputJSON);
    let outputTxt = resultArray.length > 0 ? resultArray.map(x=>x.searchResult.uri+'('+x.searchResult.title+')').join("\n") : 'No listing found' ;
    fs.writeFileSync('output.txt', outputTxt);

    console.log(outputTxt);

})();
