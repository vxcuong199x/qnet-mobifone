const bodyParser = require('body-parser');
const CONFIG = require('./config/config');

const app = require('express')();
app.disable('x-powered-by');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({extended: true, limit: '50mb'}));

// app.use(require('./common/checkPermission'));
app.use(require('./handler/index'));

// error handler
app.use((e, req, res, next) => {
  if (e && !res.headersSent) {
    if (e.hasOwnProperty('CODE') || e.hasOwnProperty('resultCode')) {
      console.error(e.stack || e);
      res.status(200).json(e.stack || e);
    } else {
      res.status(200).json(Object.assign({}, CONFIG.EC.SYSTEM_ERROR, {sub_msg: 'System errors'}));
    }
  }
});

// not found
app.use((req, res, next) => {
  if (!res.headersSent)
    res.status(404).json({ec: 404, url: req.originalUrl});
});

app.listen(process.env.port, function () {
  console.log(`CMS module '${process.env.module}' listening on port ${process.env.port}`);
});

process.on('uncaughtException', function (e) {
  process.exit(1);
});
