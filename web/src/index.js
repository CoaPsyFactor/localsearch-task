const { resolve: ResolvePath } = require('path');
const express = require('express');
const application = express();
console.log(ResolvePath('./public'));

application.use(express.static('public'));
application.use(express.static('public/scripts'));
application.use(express.static('public/styles'));

application.listen(3001, () => {
    console.log('Public web server listening on port 3001');
});