/* global angular, io */

var app = angular.module('app', ['ngMaterial', 'ngResource', 'ngRoute', 'ngMessages', 'highcharts-ng']);

app.config(['$routeProvider',function($routeProvider) {
    $routeProvider.when('/', {
        controller: 'homepageCtrl',
        templateUrl: 'template/index.html'
    }).when('/login', {
        controller: 'loginCtrl',
        templateUrl: 'template/login.html',
    }).when('/signup', {
        controller: 'signUpCtrl',
        templateUrl: 'template/signup.html'
    });
}]);

app.controller('homepageCtrl', ['$scope', '$rootScope', '$http', '$location', 'checkUser', function ($scope, $rootScope, $http, $location, checkUser) {
    var socket = io.connect('http://hostus.damn.so:23333');
    socket.on('data', function (data) {
        var d = [];
        angular.forEach(data, function (server) {
            var networkIn = [];
            angular.forEach(server.network, function (n) {
                networkIn.push(n.in/1024);
            });
            d.push({
                name: server.name,
                data: networkIn
            });
        });
        $scope.config = {
            options: {
                chart: {
                    type: 'line',
                }
            },
            title: {
                text: 'network in'
            },
            series: d,
            size: {
                width: 1000,
                height: 500
            }
        };
    });
}]);

app.controller('loginCtrl', ['$scope', function ($scope) {
    $scope.user = {};
    $scope.login = function () {
        console.log($scope);
    };
}]);

app.controller('signUpCtrl', ['$scope', function($scope){

}]);