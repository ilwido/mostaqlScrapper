import MostaqlCrawler from './crawler';

(() => {
    // set your tags
    const tags = 'تطبيق, برمجة, ios, android, موقع';

    MostaqlCrawler({
        tags,
        logger: true,
    })
        .then(data => {
            console.log(data);
        })
        .catch(err => {
            console.log(err);
        });
})();
