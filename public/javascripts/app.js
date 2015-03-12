(function(){
  var app = angular.module("PHR", ['ngRoute', 'ngCookies', 'nav-directives']);
  //Router to handle the views
  app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
    $routeProvider
    .when('/user/:username', {
      templateUrl: '../templates/profile.html',
      controller: 'UserController',
      controllerAs: 'userCtrl'
    })
    .when('/', {
      templateUrl:'/../templates/home.html',
      controller: 'HomeController'
    })
    .when('/add', {
      templateUrl: '/../templates/upload.html',
      controller: 'AddController'
    })
    .when('/by/upvote', {
      templateUrl: '/../templates/byupvotes.html',
      controller: 'ByUpvotesController'
    })
    .otherwise({redirectTo: '/'});

    //so weird hashes aren't in the urls
    $locationProvider.html5Mode({
      //enabled: true,
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

  app.controller('HomeController', function ($scope, $http) {
    
    // Get all of the playlists in the db sorted by date added
    $http.get('/api/playlists')
      .success(function (data){
      $scope.firstplaylist = data[0].title;
      $scope.playlists = data;
      console.log("The name is " + $scope.firstplaylist);
      })
      .error(function (data) {
      console.log("Error: " + data);
    });

    $scope.formData = {};

    $scope.addUpvote = function (playlist) {
      console.log(playlist);
      $http.post('/api/upvote', playlist)
      .success( function (data) {
        console.log($scope.playlists[0].upvotes);

        console.log("current upvotes: " + data.upvotes);
      })
      .error( function (data) {
        console.log("Error: " + data);
      });
    };

  });

  app.controller('AddController', function ($scope, $http) {
    // Empty object that the form data will populate
    $scope.formData = {};

    // Message for the user
    $scope.msg = "";

    // Add the playlist to the db
    $scope.addPlaylist = function () {

      $http.post('/api/playlists/add', $scope.formData) 
      .success( function (data) {
        $scope.formData = {};
        $scope.msg = "Congratulations! You have successfully added your playlist!";
      })
      .error( function (data) {
        console.log("Error: " + data);
        $scope.msg = "Couldn't post your new playlist!";
      });
    };

  });

  app.controller('ByUpvotesController', function ($scope, $http) {
    $http.get('/api/playlists/by/upvote')
    .success( function (data) {
      $scope.playlists = data;
      console.log(data[0].name);
    })
    .error( function (data) {
      console.log("Error: " + data);
    });
  });


})();
