angular.module('app')
    .factory('checkUser', ['$resource', function ($resource) {
        return $resource('/api/user', {}, {
            get: {method: 'get'}
        });
    }])
    .factory('data', ['$resource', function($resource){
        return {
            cpu: $resource('/api/cpu', {}, {
                get: {method: 'get', isArray: true}
            }),
            disk: $resource('/api/disk', {}, {
                get: {method: 'get', isArray: true}
            }),
            load: $resource('/api/load', {}, {
                get: {method: 'get', isArray: true}
            }),
            memory: $resource('/api/memory', {}, {
                get: {method: 'get', isArray: true}
            }),
            network: $resource('/api/network', {}, {
                get: {method: 'get', isArray: true}
            }),
            swap: $resource('/api/swap', {}, {
                get: {method: 'get', isArray: true}
            }),
        };
    }]);