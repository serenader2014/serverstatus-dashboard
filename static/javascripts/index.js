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
    var socket = io.connect('http://localhost:23333');
    socket.on('data', function (data) {
        console.log(data);
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