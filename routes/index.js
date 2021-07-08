var express = require('express');
var router = express.Router();
var FormData = require('form-data');
const algoliasearch = require("algoliasearch");
var unirest = require('unirest');
var cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: 'dqyj1ilsr',
  api_key: '657113948944339',
  api_secret: '3LlhAX7HUzNMJXNYuiBUvqY8pQE',
  secure: true
});
ALGOLIA = {
  applicationId: 'Q3BGPXVKNU', searchKey: '7e743d00000d54cb8dcd1ce1946aa0b1',
  adminKey: '0cc2e861c379dac9fe9191510b7f8c3c'
}

client = algoliasearch(ALGOLIA.applicationId, ALGOLIA.searchKey);
userTableSearch = client.initIndex('user');
productTableSearch = client.initIndex('products');
admin = algoliasearch(ALGOLIA.applicationId, ALGOLIA.adminKey);
userTableManagement = admin.initIndex('user');
productTableManagement = admin.initIndex('products');


/* GET home page. */
router.get('/', function (req, res, next) {
  res.send("successs");
});
router.post('/login', function (req, res, next) {
  var Msg = {};
  try {
    userTableSearch.search('', {
      filters: 'email:' + req.body.email + ' AND password:' + req.body.password
    }).then(({hits}) => {
      console.log(hits);
      Msg = {
        success: hits && hits.length ? true : false,
        data: hits,
        code: 200
      }
      res.send(Msg);
    });
  } catch (err) {
    Msg = {
      success: false,
      data: [],
      code: 400
    }
    res.send(Msg);
  }
});
router.post('/get_item', function (req, res, next) {
  var Msg = {};
  try {
    productTableSearch.getObject(req.body.objectID).then((result) => {
      Msg = {
        success: true,
        data: result,
        code: 200
      }
      res.send(Msg);
    });
  } catch (err) {
    Msg = {
      success: false,
      data: [],
      code: 400
    }
    res.send(Msg);
  }

});
router.post('/get_product', function (req, res, next) {
  var Msg = {};
  try {
    console.log("req.body",req.body.page)
    client.clearCache()
    productTableSearch.search('',{
      page: req.body.page,
      hitsPerPage: 3
    }).then((result) => {
      Msg = {
        success: result.hits && result.hits.length ? true : false,
        data: result,
        code: 200
      }
      res.send(Msg);
    });
  } catch (err) {
    Msg = {
      success: false,
      data: [],
      code: 400
    }
    res.send(Msg);
  }
});

router.post('/delete_product', function (req, res, next) {
  var Msg = {};
  try {
    productTableManagement.deleteObject(req.body.objectID).then((result) => {
      console.log(result);
      if (result) {
        Msg = {
          success: true,
          data: result,
          code: 200
        }
      } else {
        Msg = {
          success: false,
          data: result,
          code: 400
        }
      }
      res.send(Msg);
    });
  } catch (err) {
    Msg = {
      success: false,
      data: [],
      code: 400
    }
    res.send(Msg);
  }
});

router.post('/update_product', function (req, res, next) {
  var Msg = {};
  try {
    if (req.body.Image) {
      var Image = req.body.Image
      cloudinary.uploader.upload(Image, function (error, result) {
        console.log(result);
        console.log(error)
        if (error) {
          Msg = {
            success: false,
            data: error,
            code: 400
          }
        }
        if (result && result.url) {
          req.body.Image = result.url
          saveProducts(req.body, (result) => {
            res.send(result);
          })
        }
      });
    } else {
      req.body.Image = req.body.UploadedImage;
      saveProducts(req.body, (result) => {
        res.send(result);
      })
    }

  } catch (err) {
    Msg = {
      success: false,
      data: [],
      code: 400
    }
    res.send(Msg);
  }
});

function saveProducts(params, callback) {
  var Msg = {};
  try {
    productTableManagement.saveObjects([params], {autoGenerateObjectIDIfNotExist: params.objectID ? false : true}).then(({objectIDs}) => {
      if (objectIDs) {
        Msg = {
          success: true,
          data: objectIDs,
          code: 200
        }
      } else {
        Msg = {
          success: false,
          data: [],
          code: 400
        }
      }
      callback(Msg)
    });
  } catch (err) {
    Msg = {
      success: false,
      data: err,
      code: 400
    }
    callback(Msg)
  }
}

module.exports = router;
