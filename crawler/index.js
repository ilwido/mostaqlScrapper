import Cheerio from 'cheerio';
import Axios from 'axios';
import Fs from 'fs';

import { readJsonFile, getProjectIdFromUrl, coloredLog } from './util';

const BASE_URL = 'https://mostaql.com/projects?page={{page}}&sort=latest';

const DATA_FILE_PATH = './data.json';

const MAX_PAGE = 2;

const SELECTOS = {
    title:
        '.projects-table > tbody > tr:nth-child({{id}}) > td.details-td.clickable > h5 > span > a',
};

const saveLastProjectId = id => {
    // get it
    const data = readJsonFile(DATA_FILE_PATH);
    // chnage it
    data['lastProjectId'] = id.toString();
    // save it
    Fs.writeFile(DATA_FILE_PATH, JSON.stringify(data), function(err) {
        if (err) {
            return console.log(err);
        }
    });
};

const getProjectsPerPage = async params => {
    let page = BASE_URL.replace('{{page}}', params.page).toString();

    if (params.logger) coloredLog('Crawling: ' + page, 'green');

    return Axios.get(page)
        .then(response => {
            const results = [];
            const $ = Cheerio.load(response.data);
            const projects = $('.projects-table tr').toArray();
            for (let index = 0; index < projects.length; index++) {
                const project = $(
                    SELECTOS.title.replace('{{id}}', index + 1).toString(),
                );
                const title = project.text();
                const url = project[0].attribs.href;
                const id = getProjectIdFromUrl(url);
                results.push({
                    id,
                    title,
                    url,
                });
                if (results.length == projects.length) {
                    return results;
                }
            }
        })
        .catch(err => {
            console.log(err);
        });
};

const initCrawler = async params => {
    const dataFile = readJsonFile(DATA_FILE_PATH);

    const lastProjectId = dataFile.lastProjectId;

    const results = [];

    let page = 1;

    while (true) {
        let targetProjectFound = false;
        await getProjectsPerPage({ page, ...params })
            .then(data => {
                results.push(...data);
                data.map(el => {
                    if (el.id == lastProjectId) {
                        targetProjectFound = true;
                    }
                });
            })
            .catch(err => {
                console.log(err);
            });

        if (page == MAX_PAGE || targetProjectFound) break;

        page++;
    }

    return results;
};

const init = params => {
    return new Promise((resolve, reject) => {
        if (typeof params != 'object') {
            coloredLog('Error: params must be an object.', 'red');
            //reject('Error: params must be an object.');
            return false;
        }

        if (params.logger) {
            coloredLog('[!] Initialize The Crawler', 'green');
            coloredLog('Tags: ' + params.tags, 'cyan');
        }

        initCrawler(params)
            .then(projectsArray => {
                const keywords = params.tags.split(',');

                let results = projectsArray.filter(project => {
                    let found = false;
                    keywords.map(tag => {
                        if (project.title.includes(tag)) found = true;
                    });
                    return found;
                });

                if (params.logger) coloredLog('[!] Done.', 'green');

                // save last project id
                saveLastProjectId(results[0].id || '');

                if (results.length == 0)
                    coloredLog('[!] Projects Not Found.', 'green');

                resolve(results);
            })
            .catch(err => {
                reject(err);
            });
    });
};

export default init;
