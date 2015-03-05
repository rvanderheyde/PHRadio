(function(){
  var app = angular.module("wiki", ['ngRoute', 'ngCookies', 'nav-directives']);
  //Router to handle the views
  app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
    $routeProvider.when('/pages/:pagename', {
    }).otherwise({redirectTo: '/'});

    //so weird hashes aren't in the urls
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });
  }]);  
  //Controller for the edit page
  

})();
