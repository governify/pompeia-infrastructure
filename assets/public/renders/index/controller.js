$scope.tpaprojects = [];
$scope.notpaprojects = [];
$scope.finishloading = false;

$scope.displayItems = {
    "course": "",
    "loadedCourses": false,
    "statusMessage": '',
    "statusType": undefined,
    "creatingTPA": false
};


$scope.developmentScopeJSON = {};

var scopeManagerURL = "";
var domain = '';
$scope.domain = '';

/* Check if it is already set up */
$http({
    method: 'GET',
    url: '$_[URL_EXT_ASSETS_MANAGER]/api/v1/public/renders/tpa/template.json'
}).then(tparesponse => {
    scopeManagerURL = tparesponse.data.context.infrastructure.scopeManager;
    domain = tparesponse.data.context.infrastructure.registry.replace('http://registry.', '').replace('/api/v6', '');
    $scope.domain = domain;
    loadProjects();
}).catch(err => {
    $scope.displayItems.statusMessage = "Template file could not be loaded.";
    $scope.displayItems.statusType = "error";
    console.log(err);
});

function loadProjects() {
    try {
        var scopeTpaprojects = [];
        var scopeNotpaprojects = [];

        if ($scope.displayItems.course == "") {
            $http({
                method: 'GET',
                url: scopeManagerURL + '/scopes/development/courses'
            }).then((coursesResponse) => {
                $scope.developmentScopeJSON = coursesResponse.data.scope;
                $scope.displayItems.course = coursesResponse.data.scope[0].classId;
                $scope.displayItems.loadedCourses = true;
                loadProjects();
            }, (err) => {
                $scope.displayItems.statusMessage = "Scope Manager courses could not be loaded.";
                $scope.displayItems.statusType = "error";
                $scope.finishloading = true;
                console.log(err);
            });
        } else {
            $http({
                method: 'GET',
                url: scopeManagerURL + '/scopes/development/' + $scope.displayItems.course
            }).then(projectresponse => {
                $http({
                    method: 'GET',
                    url: 'https://registry.' + domain + '/api/v6/agreements'
                }).then((regresponse) => {
                    try {
                        var projects = projectresponse.data.scope.projects;
                        var agreements = regresponse.data;
                        projects.forEach(project => {
                            var found = agreements.find(agreement => agreement.id === 'tpa-' + project.projectId);
                            if (found) {
                                project.registryagreement = found;
                                project.urlReporterHttps = found.context.infrastructure.reporter;
                                if (!project.urlReporterHttps.startsWith("https") && project.urlReporterHttps.startsWith("http")) {
                                    project.urlReporterHttps = project.urlReporterHttps.replace("http", "https");
                                }
                                project.urlRegistryHttps = found.context.infrastructure.registry;
                                if (!project.urlRegistryHttps.startsWith("https") && project.urlRegistryHttps.startsWith("http")) {
                                    project.urlRegistryHttps = project.urlRegistryHttps.replace("http", "http");
                                }
                                scopeTpaprojects.push(project);
                            } else {
                                scopeNotpaprojects.push(project);
                            }
                        });

                        // This assign is for interval projects updating
                        $scope.tpaprojects = [...scopeTpaprojects];
                        $scope.notpaprojects = [...scopeNotpaprojects];
                        $scope.finishloading = true;
                    } catch (err) {
                        $scope.displayItems.statusMessage = "Comparing registry projects failed.";
                        $scope.displayItems.statusType = "error";
                        $scope.finishloading = true;
                        console.log(err);
                    }
                }, (err) => {
                    $scope.displayItems.statusMessage = "Error when obtaining registry agreements.";
                    $scope.displayItems.statusType = "error";
                    $scope.finishloading = true;
                    console.log(err);
                });
            }, (err) => {
                $scope.displayItems.statusMessage = "Scope Manager courses could not be loaded.";
                $scope.displayItems.statusType = "error";
                $scope.finishloading = true;
                console.log(err);
            });
        }
    } catch (err) {
        $scope.displayItems.statusMessage = "Projects loading failed.";
        $scope.displayItems.statusType = "error";
        $scope.finishloading = true;
        console.log(err);
    }
}

// For load course button
$scope.reloadProjects = function () {
    $scope.finishloading = false;
    loadProjects();
}

$scope.createTpa = function (project) {
    $scope.displayItems.creatingTPA = true;
    $http({
        method: 'GET',
        url: '$_[URL_EXT_ASSETS_MANAGER]/api/v1/public/renders/tpa/template.json'
    }).then((tparesponse) => {
        try {
            const projectIdNumber = project.projectId;
            var tpa = JSON.parse(JSON.stringify(tparesponse.data).replace(/1010101010/g, projectIdNumber).replace(/2020202020/g, $scope.displayItems.course));

            tpa.id = 'tpa-' + projectIdNumber;

            tpa.context.validity.initial = '2019-01-01';
            tpa.context.infrastructure.render = 'https://ui.' + domain + '/render?model=https://registry.' + domain + '/api/v6/agreements/tpa-' + projectIdNumber + '&view=/renders/tpa/default.html&ctrl=/renders/tpa/default.js';
            tpa.context.definitions.scopes.development.project.default = projectIdNumber;

            $http({
                method: 'POST',
                url: 'https://registry.' + domain + '/api/v6/agreements',
                data: tpa
            }).then(() => {
                $scope.displayItems.statusMessage = "TPA created successfully.";
                $scope.displayItems.statusType = "success";
                $scope.displayItems.creatingTPA = false;
                loadProjects();
                window.open("https://ui.$_[SERVICES_PREFIX]$_[DNS_SUFFIX]/render?model=http://registry.$_[SERVICES_PREFIX]$_[DNS_SUFFIX]/api/v6/agreements/tpa-" + projectIdNumber + "&view=$_[URL_INT_ASSETS_MANAGER]/api/v1/public/renders/tpa/default.html&ctrl=$_[URL_INT_ASSETS_MANAGER]/api/v1/public/renders/tpa/default.js", "_blank");
                $scope.finishloading = true;
            }, (err) => {
                $scope.displayItems.statusMessage = "There was a problem when sending TPA to registry.";
                $scope.displayItems.statusType = "error";
                $scope.displayItems.creatingTPA = false;
                console.log(err);
            });
        } catch (err) {
            $scope.displayItems.statusMessage = "Problem when creating TPA.";
            $scope.displayItems.statusType = "error";
            $scope.displayItems.creatingTPA = false;
            console.log(err);
        }
    }, (err) => {
        $scope.displayItems.statusMessage = "Problem when creating TPA.";
        $scope.displayItems.statusType = "error";
        $scope.displayItems.creatingTPA = false;
        console.log(err);
    });
}