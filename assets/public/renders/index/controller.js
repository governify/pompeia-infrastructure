$scope.tpaprojects = [];
$scope.notpaprojects = [];
$scope.finishloading = false;

$scope.displayItems = {
    "course": "",
    "loadedCourses": false,
    "statusMessage": '',
    "statusType": undefined,
    "creatingTPA": false,
    "showHidden": false
}

var firstLoad = true;
var defaultProject = '';

$scope.developmentScopeJSON = {};

var scopeManagerURL = "";
var domain = '';
$scope.domain = '';

const setPageAlert = (message, type) => {
    $scope.displayItems.statusMessage = message;
    $scope.displayItems.statusType = type;
}

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
    setPageAlert("Template file could not be loaded.", "error");
    console.log(err);
});

function loadProjects() {
    try {
        var scopeTpaprojects = {};
        var scopeNotpaprojects = {};

        if (firstLoad) {
            $http({
                method: 'GET',
                url: scopeManagerURL + '/scopes/development/courses'
            }).then((coursesResponse) => {
                $scope.developmentScopeJSON = [];

                // Add only not hidden projects
                for (let course of coursesResponse.data.scope) {
                    if ($scope.displayItems.showHidden || !course.hidden){
                        $scope.developmentScopeJSON.push(course);
                    }
                }

                $scope.displayItems.course = defaultProject ? defaultProject : $scope.developmentScopeJSON[0].classId;
                $scope.displayItems.loadedCourses = true;
                firstLoad = false;
                loadProjects();
            }, (err) => {
                setPageAlert("Scope Manager courses could not be loaded.", "error");
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
                            const projectAgreementId = project.agreementId ? project.agreementId : 'tpa-' + project.projectId;
                            var found = agreements.find(agreement => agreement.id === projectAgreementId);
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

                                // Clasify by owner
                                scopeTpaprojects = clasifyProject(project, scopeTpaprojects);
                            } else {
                                scopeNotpaprojects = clasifyProject(project, scopeNotpaprojects);
                            }
                        });

                        // This assign is for interval projects updating
                        $scope.tpaprojects = {...scopeTpaprojects};
                        $scope.tpaprojectskeys = Object.keys(scopeTpaprojects);
                        $scope.tpaprojectskeys = $scope.tpaprojectskeys.filter(item => item !== "Projects w/o owner");
                        $scope.tpaprojectskeys.push(Object.keys(scopeTpaprojects).filter(item => item === "Projects w/o owner")[0]);
                        $scope.notpaprojects = {...scopeNotpaprojects};
                        $scope.notpaprojectskeys = Object.keys(scopeNotpaprojects);
                        $scope.notpaprojectskeys = $scope.notpaprojectskeys.filter(item => item !== "Projects w/o owner");
                        $scope.notpaprojectskeys.push(Object.keys(scopeNotpaprojects).filter(item => item === "Projects w/o owner")[0]);
                        $scope.finishloading = true;
                    } catch (err) {
                        setPageAlert("Comparing registry projects failed.", "error");
                        $scope.finishloading = true;
                        console.log(err);
                    }
                }, (err) => {
                    setPageAlert("Error when obtaining registry agreements.", "error");
                    $scope.finishloading = true;
                    console.log(err);
                });
            }, (err) => {
                setPageAlert("Scope Manager courses could not be loaded.", "error");
                $scope.finishloading = true;
                console.log(err);
            });
        }
    } catch (err) {
        setPageAlert("Projects loading failed.", "error");
        $scope.finishloading = true;
        console.log(err);
    }
}

const clasifyProject = (project, container) => {
    if (project.owner === undefined || project.owner === "") {
        if (Object.keys(container).includes("Projects w/o owner")) {
            container["Projects w/o owner"].push(project);
        } else {
            container["Projects w/o owner"] = [];
            container["Projects w/o owner"].push(project);
        }
    } else {
        if (Object.keys(container).includes(project.owner)){
            container[project.owner].push(project);
        } else {
            container[project.owner] = [];
            container[project.owner].push(project);
        }
    }

    return container;
}

// For load course button
$scope.reloadProjects = function () {
    $scope.finishloading = false;
    loadProjects();
}

$scope.createTpa = function (project, openTab = true) {
    $scope.displayItems.creatingTPA = true;
    $http({
        method: 'GET',
        url: '$_[URL_EXT_ASSETS_MANAGER]/api/v1/public/renders/tpa/' + $scope.displayItems.course + '.json'
    }).then((tparesponse) => {
        try {
            const projectIdNumber = project.projectId;
            var tpa = JSON.parse(JSON.stringify(tparesponse.data).replace(/1010101010/g, projectIdNumber).replace(/2020202020/g, $scope.displayItems.course));

            tpa.id = project.agreementId ? project.agreementId : 'tpa-' + projectIdNumber;

            tpa.context.validity.initial = '2019-01-01';
            tpa.context.infrastructure.render = 'https://ui.' + domain + '/render?model=https://registry.' + domain + '/api/v6/agreements/' + tpa.id + '&view=/renders/tpa/default.html&ctrl=/renders/tpa/default.js';
            tpa.context.definitions.scopes.development.project.default = projectIdNumber;

            $http({
                method: 'POST',
                url: 'https://registry.' + domain + '/api/v6/agreements',
                data: tpa
            }).then(() => {
                setPageAlert("TPA created successfully.", "success");
                $scope.displayItems.creatingTPA = false;
                loadProjects();
                if (openTab) {
                    window.open("https://ui.$_[SERVICES_PREFIX]$_[DNS_SUFFIX]/render?model=http://registry.$_[SERVICES_PREFIX]$_[DNS_SUFFIX]/api/v6/agreements/" + tpa.id + "&view=$_[URL_INT_ASSETS_MANAGER]/api/v1/public/renders/tpa/default.html&ctrl=$_[URL_INT_ASSETS_MANAGER]/api/v1/public/renders/tpa/default.js", "_blank");
                }
                $scope.finishloading = true;
            }, (err) => {
                setPageAlert("There was a problem when sending TPA to registry.", "error");
                $scope.displayItems.creatingTPA = false;
                console.log(err);
            });
        } catch (err) {
            setPageAlert("Problem when creating TPA.", "error");
            $scope.displayItems.creatingTPA = false;
            console.log(err);
        }
    }, (err) => {
        setPageAlert("Problem when creating TPA.", "error");
        $scope.displayItems.creatingTPA = false;
        console.log(err);
    });
}

$scope.createAllTpas = (projects) => {
    for (const project of projects[Object.keys(projects)[0]]){
        $scope.createTpa(project, false);
    }
}

$scope.swapShowHidden = function () {
    $scope.displayItems.showHidden = !$scope.displayItems.showHidden;
    firstLoad = true;
    loadProjects();
}