/* global angular, moment */

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

app.controller('homepageCtrl', ['$scope', '$rootScope', '$http', '$location', 'checkUser', 'data',
    function ($scope, $rootScope, $http, $location, checkUser, data) {
        data.network.get(function (response) {
            console.log(response);
        });
    }
]);

app.controller('loginCtrl', ['$scope', function ($scope) {
    $scope.user = {};
    $scope.login = function () {
        console.log($scope);
    };
}]);

app.controller('signUpCtrl', ['$scope', function($scope){

}]);