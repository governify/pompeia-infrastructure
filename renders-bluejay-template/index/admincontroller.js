$scope.date = new Date().toISOString();
$scope.tpaprojects = [];
$scope.notpaprojects = [];
$scope.finishloading = false;
$scope.deftpa = '';

var domain = '';

$scope.tpaprojects = [];
$scope.notpaprojects = [];

$http({
    method: 'GET',
    url: './renders/tpa/template.json'
}).then(tparesponse => {
    if (tparesponse.data.context.infrastructure.registry !== 'http://registry.1212121212/api/v6') {
        domain = tparesponse.data.context.infrastructure.registry.replace('http://registry.', '');
        domain = domain.replace('/api/v6', '');
        $scope.deftpa = JSON.stringify(tparesponse.data, null, 4);
        loadProjects();
    }
});

function loadProjects() {
    $scope.tpaprojects = [];
    $scope.notpaprojects = [];
    $http({
        method: 'GET',
        url: 'https://www.pivotaltracker.com/services/v5/projects?account_ids=233155',
        headers: {
            'X-TrackerToken': JSON.parse($scope.deftpa).context.definitions.computers.pivotaltracker.config.ptkey
        }
    }).then(projectresponse => {
        $http({
            method: 'GET',
            url: 'https://registry.' + domain + '/api/v6/agreements'
        }).then(regresponse => {
            var projects = projectresponse.data;
            var agreements = regresponse.data;
            projects.forEach(project => {
                var found = agreements.find(agreement => agreement.id === 'tpa-' + project.id);
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
                    $scope.tpaprojects.push(project);
                } else {
                    $scope.notpaprojects.push(project);
                }
            });
            $scope.finishloading = true;
        });
    });
}

function setEditorAgreement() {
    if (document.getElementById("editorAgreementJSON")) {
        document.getElementById("editorAgreementJSON").value = $scope.deftpa;
    } else {
        setTimeout(function () {
            setEditorAgreement();
        }, 500);
    }
}
setEditorAgreement();

$scope.editAgreement = function (agreement) {
    delete agreement._id;
    delete agreement._v;
    document.getElementById("editorAgreementJSON").value = JSON.stringify(agreement, null, 4);
}

$scope.submitAgreement = function () {
    var agreementData = document.getElementById("editorAgreementJSON").value;
    var agreementName = JSON.parse(agreementData).id;
    var tpa = JSON.parse(agreementData.replace(/1010101010/g, agreementName));
    tpa.context.infrastructure.render = 'https://ui.' + domain + '/render?model=https://registry.' + domain + '/api/v6/agreements/' + agreementName + '&view=/renders/tpa/default.html&ctrl=/renders/tpa/default.js';
    var existing = false;
    for (var pr of $scope.tpaprojects) {
        if (pr.registryagreement.id == agreementName) {
            existing = true;
            break;
        }
    }
    if (existing) {
        $http({
            method: 'DELETE',
            url: 'https://registry.' + domain + '/api/v6/agreements/' + agreementName
        }).then(() => {
            $http({
                method: 'POST',
                url: 'https://registry.' + domain + '/api/v6/agreements',
                data: tpa
            }).then(() => {
                window.alert("The TPA was successfully updated");
            });
        });
    }
    else {
        $http({
            method: 'POST',
            url: 'https://registry.' + domain + '/api/v6/agreements',
            data: tpa
        }).then(() => {
            window.alert("The TPA was successfully created");
        });

    }
}
