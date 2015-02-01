angular.module('app').factory('checkUser', ['$resource', function ($resource) {
    return $resource('/api/user', {}, {
        get: {method: 'get'}
    });
}]);