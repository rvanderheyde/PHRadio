(function(){
  var app = angular.module("PHR", ['ngRoute', 'ngCookies', 'nav-directives']);
  //Router to handle the views
  app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
    $routeProvider.when('/user/:username', {
      templateUrl: '../templates/profile.html',
      controller: 'UserController',
      controllerAs: 'userCtrl'
    }).otherwise({redirectTo: '/'});

    //so weird hashes aren't in the urls
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });
  }]);  

  //Controller for the profile page
  app.controller('UserController', ['$http', function($http){
    var stuff = this;
    stuff.page = {};
    var path = $location.path();
    //get the data to populate the page
    $http.get(path).success(function(data, status){
      stuff.page = data;
    }).error(function(data, status){ console.log(status); });
  }]);


})();
