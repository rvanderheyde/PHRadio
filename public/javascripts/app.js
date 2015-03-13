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
    }).when('/user/:userId/playlist/:playlistId', {
      templateUrl: '../../../templates/playlist.html',
      controller: 'PlaylistController',
      controllerAs: 'PlaylistCtrl'
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


  app.controller('PlaylistController', ['$http','$location','$sce', function($http, $location,$sce){
    var page = this;
    var path = $location.path();
    var splitString = path.split('/')
    var userId = splitString[2];
    var playlistId = splitString[4];
    this.url='https://embed.spotify.com/?uri=spotify:user:'+userId+':playlist:'+playlistId;
    this.trustSrc = function(src) {
      return $sce.trustAsResourceUrl(src);
    }
    this.secs = 0;
    // $http.get(path).success(function(data,status){
    //   page.songs = data;
    // }).error(function(data,status){ console.log(status); })
    this.startPlaylist = function(songName){
      var time = new Date();
      var secsI = time.getSeconds();
      this.secs = 0;
      while (true){
        if (this.secs>60){
          page.songs.songName.appear = false;
        }
        var secs = time.getSeconds();
        if(secs-secsI>0){
          this.secs = secs-secsI;
        } else {
          this.secs = 60+secs-secsI;
        } 
      }
    };
  }])
  //Controller for the profile page
  app.controller('UserController', ['$http','$location', function($http, $location){
    var stuff = this;
    stuff.page = {};
    var path = $location.path();
    //get the data to populate the page
    $http.get(path).success(function(data, status){
      stuff.id = data.spotifyId;
      console.log(data);
        var url = "https://api.spotify.com/v1/users/" + data.spotifyId +"/playlists";
        var req = {
          method: "GET",
          url: url,
          headers: {
            Authorization: "Bearer " + data.token
          }
        };
        console.log(req)
        $http(req).success(function( obj, status){
          var playlists = obj.items;
          stuff.page = data;
          stuff.page.playlistsSpot = playlists;
          
          console.log(stuff.page.playlistsSpot)
          $http.post('/api/playlists', {playlistsSpot: stuff.page.playlistsSpot}).success(function(obj,status){
            stuff.page.playlists = obj;
          })
        }).error(function(data, status){ console.log(status); }) 
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

  app.controller('HomeController', function ($scope, $http) {
    
    // Get all of the playlists in the db sorted by date added
    $http.get('/api/playlists')
      .success(function (data){
        if(data[0]){
          $scope.firstplaylist = data[0].title;
          $scope.playlists = data;
          console.log("The name is " + $scope.firstplaylist);
        }
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

    var user_id = 'wizzler';

    $http.get('https://api.spotify.com/v1/me')
      .success( function(data) {
        $scope.msg = "Your public playlists: ";
        $scope.userPlaylists = data;
      })
      .error( function (data) {
        console.log("Error: " + data);
        $scope.msg = "Couldn't get the current user's public playlists";
      });

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

  app.controller('ByUpvotesController', function ($scope, $http, $location) {
    $location.path("/");
    // Get the playlists sorted by the number of upvotes 
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
