var express   = require('express'),
    fs        = require('fs'),
    CSON      = require('cson'),
    router    = express.Router();

router.get('/', function (req, res) {
  res.render('index');
});

function grabCSON(file)
{
  var data = {};
  try {
    CSON.parseCSONFile(file,function(err,results)
    {
      if (results) data = results;
      if (err) data.error = "Error! Looks like there was a problem with the data.\n"+err;
    });
  } catch(e) {
    data.error = "Error! Looks like there was a problem finding the data file.\n"+e;
  }
  return data;
}

// add your routes here
router.get('/role/:name?', function (req, res, next)
{
  var name = req.params.name;
  if (!name) name = 'tom';

  req.data = {};
  req.data.general = grabCSON(__dirname + '/data/general.cson');
  req.data.user = grabCSON(__dirname + '/data/users/'+name+'.cson');

  req.url = '/role/';
  next();
});

// add your routes here
router.get('/location/:name?', function (req, res, next)
{
  var name = req.params.name;
  if (!name) name = 'leedsone';

  req.data = {};
  req.data.general = grabCSON(__dirname + '/data/general.cson');
  req.data.location = grabCSON(__dirname + '/data/locations/'+name+'.cson');

  req.url = '/location/';
  next();
});

module.exports = router;
