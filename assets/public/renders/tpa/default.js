$scope.allowModify = false;

// Display items and error alert
$scope.displayItems = {
    "statusMessage": '',
    "statusType": undefined,
    "scopeManagerInfo": {}
};

const setPageAlert = (message, type) => {
    if (type === "error" || $scope.displayItems.statusType !== "error") {
        $scope.displayItems.statusMessage = message;
        $scope.displayItems.statusType = type;
    }
}

//Calculate Metrics button modal
$scope.dateNowISO = new Date().toISOString().match(/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d/g)[0];
$scope.calculateMetrics = {
    "from": new Date(Date.parse("2019-03-15T00:00")),
    "to": new Date(Date.parse($scope.dateNowISO)),
    "agree": false,
    "message": "",
    "error": false
}

// Urls
var getLogsUrl = () => $scope.model.context.infrastructure.logs;
var getReporterUrl = () => $scope.model.context.infrastructure.reporter;
var getRegistryUrl = () => $scope.model.context.infrastructure.registry;
var getScopeManagerUrl = () => $scope.model.context.infrastructure.scopeManager;

// This function is called at the end of the code
const init = () => {
    try {

        $scope.urlReporterHttps = getReporterUrl();
        $scope.urlRegistryHttps = getRegistryUrl();

        if (!$scope.urlReporterHttps.startsWith("https") && $scope.urlReporterHttps.startsWith("http")) {
            $scope.urlReporterHttps = $scope.urlReporterHttps.replace("http", "https");
        }

        if (!$scope.urlRegistryHttps.startsWith("https") && $scope.urlRegistryHttps.startsWith("http")) {
            $scope.urlRegistryHttps = $scope.urlRegistryHttps.replace("http", "https");
        }

        //Get project Info from scopeManager
        getUrl(
            getScopeManagerUrl() + "/scopes/development/" + $scope.model.context.definitions.scopes.development.class.default + "/" + $scope.model.context.definitions.scopes.development.project.default,
            (err, data) => {
                if (data) {
                    if (data.code == 200) {
                        $scope.displayItems.scopeManagerInfo = data;
                    } else {
                        setPageAlert("No project found in ScopeManager with the specified scope (Some data will not be displayed).", "warn");
                    }
                }
                else {
                    setPageAlert("Error when retrieving information from Scope Manager (Some data will not be displayed).", "warn");
                }
                $scope.modelLoaded = $scope.modelLoaded == false ? true : false;
                $scope.$apply();
            }
        );

        //Get existing agreement from mongo
        getUrl(
            getRegistryUrl() + "/agreements/" + $scope.model.id,
            (err, data) => {
                if (data) {
                    console.info("Loaded agreement from mongo.")
                    $scope.model = data;
                    $scope.computersUsed = Object.keys($scope.model.context.definitions.computers);
                }
                else {
                    setPageAlert("No agreement found in mongo.", "error");
                    console.info("No agreement found in mongo, loaded default.");
                }
                $scope.modelLoaded = $scope.modelLoaded == false ? true : false;
                $scope.$apply();
            }
        );

        /* setTimeout(function () {
            $("#mapCompensations").hide();
            $("#opGrouperContainer").hide();
        }, 150); */

        /* STATUS */
        /* setInterval(function () {
            getUrl(getReporterUrl() + "/contracts/" + $scope.model.id + "/createPointsFromList", (err, data) => {
                if (data) {
                    $scope.fullSt = Math.floor(data["current"] / data["total"] * 100)
                    document.getElementById("progressFullStory").style.width = $scope.fullSt + "%"
                }
                else {
                    $scope.fullSt = false;
                }
    
                if (err) {
                    console.log("No full history being generated at this time.")
                } else {
                    console.log($scope.fullSt)
                }
                $scope.$apply();
            })
    
        }, 10000); */
    } catch (err) {
        $scope.modelLoaded = true;
        console.log(err);
        if (!$scope.model) {
            setPageAlert("Model could not be loaded.", "error");
        } else {
            setPageAlert("Undefined Error.", "error");
        }
        $scope.$apply();
    }
}

/**
 * GET request for https URLs
 * @param url 
 * @param callback 
 */
var getUrl = (url, callback) => {
    if (!url.startsWith("https") && url.startsWith("http")) {
        url = url.replace("http", "https");
    }
    $.get(url, function (data) {
        if (callback) {
            callback(null, data);
        }
    }).fail(function (err) {
        //console.error(err);
        if (callback) {
            callback(err, null);
        }
    });
};

/**
 * POST request for https URLs
 * @param url 
 * @param callback 
 */
var postUrl = (url, data, callback) => {
    if (!callback && data) {
        callback = data;
    }
    if (!url.startsWith("https") && url.startsWith("http")) {
        url = url.replace("http", "https");
    }

    var body = {
        url: url,
        type: "POST",
        contentType: "application/json; charset=utf-8",
        success: (data) => {
            if (callback) {
                callback(null, data);
            }
        }
    };

    if (data) {
        var rawContent = JSON.stringify(data);
        if (rawContent) {
            body["data"] = rawContent
                .replace(/&amp;/g, "&")
                .replace(/&gt;/g, ">")
                .replace(/&lt;/g, "<")
                .replace(/&quot;/g, '"');
        }
    }

    $.ajax(body).fail(function (err) {
        console.error(err);
        if (callback) {
            callback(err);
        }
    });
};

/**
 * DELETE request for https URLs
 * @param url 
 * @param callback 
 */
var deleteUrl = (url, data, callback) => {
    if (!callback && data) {
        callback = data;
    }
    if (!url.startsWith("https") && url.startsWith("http")) {
        url = url.replace("http", "https");
    }
    $.ajax({
        url: url,
        type: "DELETE",
        success: (data) => {
            if (callback) {
                callback(null, data);
            }
        }
    }).fail(function (err) {
        console.error(err);
        if (callback) {
            callback(err);
        }
    });
};

$scope.beautifyMetric = (metric) => { return JSON.stringify(metric, null, 1); }

/*var fetchAllActivity = (url, options, offset) => {
    var offsetUrl = url + "&offset=" + offset;

    return fetch(offsetUrl, options).then(x => {
        return x.json().then(data => {
            if (data.length != 0) {
                return fetchAllActivity(url, options, offset + data.length).then(newData => {
                    return data.concat(newData);
                });
            } else {
                return data;
            }

        });

    });
}


}*/



$scope.calculateEventsMetrics = function (id) {
    //Helper alert function
    const setModalAlert = (message, error = true) => { $scope.calculateMetrics.message = message; $scope.calculateMetrics.error = error; }

    try {
        setModalAlert("");
        
        if ($scope.calculateMetrics.agree) {

            if (!$scope.calculateMetrics.from || !$scope.calculateMetrics.to) {
                setModalAlert("Invalid date. They cannot exceed current time.");
            } else {                
                // Periods generation
                var firstDateOffset = new Date(Date.parse($scope.calculateMetrics.from.toISOString())).getTimezoneOffset();
                var firstDate = Date.parse($scope.calculateMetrics.from.toISOString()) - firstDateOffset * 60 * 1000;
                
                var lastDateOffset = new Date(Date.parse($scope.calculateMetrics.to.toISOString())).getTimezoneOffset();
                var lastDate = Date.parse($scope.calculateMetrics.to.toISOString()) - lastDateOffset * 60 * 1000;

                var periodDifference = lastDate - firstDate;

                if (periodDifference <= 0) {
                    setModalAlert("End date must be higher than start date.");
                } else {
                    var periods = [{ "from": new Date(firstDate).toISOString(), "to": new Date(lastDate - 1000).toISOString() }];

                    // POST
                    postUrl(getReporterUrl() + '/contracts/' + id + '/createPointsFromPeriods', { "periods": periods }, (err, data) => {
                        // Reporter not answering properly
                        /* if (err) {
                            console.log(err)
                            setModalAlert("Failed when creating points.");
                        } else {
                            setModalAlert("points created successfully!", false);
                        } */
                        setModalAlert("Points creation ended!", false);
                        $scope.$apply();
                    });

                    // Alert time estimation
                    setModalAlert("TPA data is being generated for the period.", false);
                }
            }
        } else {
            setModalAlert("You must agree to delete old information.");
        }
    } catch (err) {
        console.log(err)
        setModalAlert("Undefined error.");
    }
}

setTimeout(() => {
    init();
}, 300);


