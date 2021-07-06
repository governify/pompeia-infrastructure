$scope.displayMessage = false;
$scope.message = "";
$scope.responseCode = "";
$scope.scriptResponse = "";
$scope.form = {
    scriptText : "",
    scriptConfig : undefined
}

var buildTestPayload = (scriptText,scriptConfig) => {
    let config = JSON.parse(scriptConfig)
    return { 
        "scriptText" : scriptText,
        "scriptConfig" : config
    }
}

$scope.testScript = function() {
    $scope.displayMessage = true;
    if ($scope.form.scriptText !== "" && $scope.form.scriptConfig !== "") {
        //Building payload
        try{
            var payload= buildTestPayload($scope.form.scriptText,$scope.form.scriptConfig);
        }catch(err){
            console.log(err);
            $scope.message = "badFields";
            $scope.taskTestResponse = "Bad JSON configuration";
            return;
        }
        
        // Test Task
        let url = "$_[infrastructure.external.director.default]/api/v1/tasks/test";
        
        $http.post(url,payload).then(response => {
            $scope.message = "ok";
            $scope.taskTestResponse = "Script successfully tested";
            $scope.responseCode = response.status.toString();
            $scope.scriptResponse = JSON.stringify(response.data);
        }).catch(err => {
            $scope.message = "error";
            $scope.taskTestResponse = "Script unsuccessfully tested";
            $scope.responseCode = 500;
            console.log(err);
        })
    }else{
        $scope.message = "badFields";
        $scope.taskTestResponse = "You must fill in all the fields";
    }
}


$scope.loadFile = function() {
    let f = document.getElementById('file').files[0];
    if(f.type.match('^text/plain') || f.type.match('^text/javascript')){
        let reader = new FileReader();
        reader.addEventListener('load', function (e) {
            let data = e.target.result;
            $scope.$apply(function(){$scope.form.scriptText = data;});;
        });
        reader.readAsBinaryString(f);
    }
}