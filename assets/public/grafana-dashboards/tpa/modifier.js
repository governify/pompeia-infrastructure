
'use strict';

//Course Dates initialization
const courseDates = {
  "CS169-f16": {
    "from": "2016-10-01T00:00:00.000Z",
    "to": "2016-12-31T00:00:00.000Z"
  },
  "CS169-f17": {
    "from": "2017-10-01T00:00:00.000Z",
    "to": "2017-12-31T00:00:00.000Z"
  },
  "CS169-s19": {
    "from": "2019-03-01T00:00:00.000Z",
    "to": "2019-06-01T00:00:00.000Z"
  }
}

const logicalOperators = ["<", ">", "=", "<=", ">="]

function modifyJSON(jsonDashboard, agreement, dashboardName){
  // Dashboard to return
  let modifiedDashboard = {...jsonDashboard};
  modifiedDashboard.panels = [];

  // Y pos offest. Increases for each guarantee
  let yOffset = 0

  // Create panels for each guarantee and add them to the dashboard
  for (let guarantee of agreement.terms.guarantees){
    // Create panels and replace with values from the agreement guarantee
    let newPanels = JSON.stringify(jsonDashboard.panels);
    // TODO - Threshold direction (operators)
    newPanels = newPanels.replace(/"###GUARANTEE.THRESHOLD###"/g, guarantee.of[0].objective.split(" ")[guarantee.of[0].objective.split(" ").length - 1]);
    newPanels = newPanels.replace(/###GUARANTEE.NAME###/g, guarantee.id);

    //Adjust y pos
    newPanels = JSON.parse(newPanels);
    for (let panel of newPanels) {
      if (panel.yaxes) {
        if(guarantee.id.includes("PERCENT")) {
          panel.yaxes[0].max = 100;
          panel.yaxes[0].min = 0;
        }
      }
      panel.gridPos.y += yOffset;
      panel.id += yOffset; // If all IDs are the same the panels overlap
    }
    yOffset += 9; // This value is the sum of the h values of the row (the highest value on its row)

    //Add the panels to the modified dashboard
    modifiedDashboard.panels = modifiedDashboard.panels.concat(newPanels);
  }

  //Adjust date
  const courseDate = courseDates[agreement.context.definitions.scopes.development.class.default]
  if (courseDate !== undefined){
    modifiedDashboard.time.from = courseDate.from;
    modifiedDashboard.time.to = courseDate.to;
  } else {
    modifiedDashboard.time.from = "2017-01-01T00:00:00.000Z";
    modifiedDashboard.time.to = new Date().toISOString();    
  }

  // Substitute remaining attributes
  modifiedDashboard = JSON.stringify(modifiedDashboard);
  modifiedDashboard = modifiedDashboard.replace(/###COURSE.ID###/g, agreement.context.definitions.scopes.development.class.default);
  modifiedDashboard = modifiedDashboard.replace(/###AGREEMENT.ID###/g, agreement.id);

  return JSON.parse(modifiedDashboard);
}

module.exports.modifyJSON = modifyJSON;