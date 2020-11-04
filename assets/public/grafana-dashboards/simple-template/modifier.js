
'use strict';

const fs = require('fs');

module.exports.modifyJSON = modifyJSON;

function modifyJSON(jsonDashboard, agreement, dashboardName){
  //Dashboard JSON is received here, data (like thresholds) must be replaced with agreement data.
  return jsonDashboard;
}