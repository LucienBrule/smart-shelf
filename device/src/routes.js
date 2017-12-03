var express = require('express'),
  api = require('./api.js'),
  firebase = require('firebase'),
  config = require.main.require('./config/config.js');
router = express.Router()

router.route('/api/get-firebase-config').get(api.get_firebase_config);
router.route('/api/test').get(api.test)
router.route('/api/get-device-info').get(api.get_device_info);
router.route('/api/update-auth-state').post(api.update_auth_state)
router.route('/api/test-data-store').get(api.test_data_store);
router.route('api/test-find-db').get(api.test_find_db);
router.route('/api/logout').get(api.make_restricted_area, api.logout);
router.route('/logout').get(api.make_restricted_area, api.logout, (req, res) => {
  console.log("redirecting them")
  res.redirect('/');
});
router.route('/').get((req, res) => {
  res.render('index.html', {
    title: "Smart Shelf",
    client_id: config.oauth.client_id
  });
});
router.route('/dashboard').get(api.make_restricted_area, (req, res) => {
  res.render('dashboard.html', {
    appName: "Smart Shelf",
    pageName: "Dashboard",
    device: config.device,
    user: api.get_user_info(),
    stats: [{
      "title": "Device Configuration",
      "stat": JSON.stringify(config.device)
    }]
  });
});
module.exports = router;
