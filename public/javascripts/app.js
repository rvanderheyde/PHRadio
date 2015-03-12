(function(){
  var app = angular.module("PHR", ['ngRoute', 'ngCookies', 'nav-directives']);
  //Router to handle the views
  app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
    $routeProvider.when('/user/:username', {
      templateUrl: '../templates/profile.html',
      controller: 'UserController',
      controllerAs: 'userCtrl'
    }).when('/',{
      templateUrl: '../templates/home.html',

    }).otherwise({
      templateUrl: '../templates/404.html',
      controller: 'soundTest',
      controllerAs: 'sound'
    });

    //so weird hashes aren't in the urls
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });
  }]);  

  //Controller for the profile page
  app.controller('UserController', ['$http','$location', function($http, $location){
    var stuff = this;
    stuff.page = {};
    var path = $location.path();
    //get the data to populate the page
    $http.get(path).success(function(data, status){
      console.log(data);
      if (data.playlists){
        console.log("FUCK")
        stuff.page = data;
      } else {
        var url = "https://api.spotify.com/v1/users/" + data.spotifyId +"/playlists";
        $http.get(url).success(function( obj, status){
          var playlists = obj.items;
          stuff.page = data;
          stuff.page.playlists = playlists;
          console.log(stuff.page.playlists)
        }).error(function(data, status){ console.log(status); })
      }
    }).error(function(data, status){ console.log(status); });
  }]);

  app.controller('soundTest', ['$http', '$sce', function($http, $sce){
    var page = this;
    this.url = '';
    var testUrl = 'https://soundcloud.com/simply-seema/up-up-away';
    $http.get('/secret/secret').success(function(data, status){
      var resolvePath = 'http://api.soundcloud.com/resolve.json?url=https://soundcloud.com/nblrr/taylorswift-blank-space&client_id=' + data.secret;
      var secret = data.secret;
      // var path = 'http://api.soundcloud.com/tracks/13158677.json?client_id=' + data.secret;
      $http.get(resolvePath).success(function(data,status){
      // $http.get(path).success(function(data, status){
        page.url = data.stream_url+'?client_id='+secret;
      }).error(function(data,status){ console.log(status); })
    }).error(function(data,status){ console.log(status); });

    this.trustSrc = function(src) {
      return $sce.trustAsResourceUrl(src);
    }
      
  }]);

})();
