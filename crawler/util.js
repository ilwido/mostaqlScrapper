import Fs from 'fs';

const readJsonFile = path => {
    return JSON.parse(Fs.readFileSync(path, 'utf8'));
};

const getProjectIdFromUrl = url => {
    return url ? url.split('project/')[1].split('-')[0] : false;
};

const coloredLog = (message, color) => {
    let selectedColor = '';

    switch (color) {
        case 'green':
            selectedColor = '\x1b[32m';
            break;
        case 'red':
            selectedColor = '\x1b[31m';
            break;
        case 'cyan':
            selectedColor = '\x1b[36m';
            break;
        default:
            selectedColor = '\x1b[30m';
            break;
    }

    console.log(selectedColor + '%s\x1b[0m', message);
};

export { readJsonFile, getProjectIdFromUrl, coloredLog };
