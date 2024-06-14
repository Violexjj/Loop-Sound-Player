const mm = require('music-metadata');
const path = require('path');

const audioFilePath = path.join(__dirname, process.argv[2]);

mm.parseFile(audioFilePath)
    .then(metadata => {
        process.send({ metadata });
    })
    .catch(error => {
        process.send({ error: error.message });
    });
