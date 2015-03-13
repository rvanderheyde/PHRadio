(function(){
	var app = angular.module('nav-directives', ['ngCookies']);

	app.directive('navBar', ['$cookieStore', '$http', '$location', function($cookieStore, $http, $location){
		return {
			restrict: 'E',
			templateUrl: '../templates/nav.html',
			controller: function(){
				var user = this;
				this.username = $cookieStore.get('username');
				
				// console.log(this.username);

				$http.get('/session/username').success(function(data){
					//bake the cookie with username from server to control view.
					if (data !== 'No User'){
						console.log(data)
						var username = data.userName;
						$cookieStore.put('username', username);
						$cookieStore.put('spoifyId', data.spotId)
						user.username = username;
					} else {
						user.username = '';
					}
				}).error(function(data){
					alert(data);	
				});

				this.checkHome = function(){
					//change view on homepage
					var path = $location.path();
					if(path.length > 1){
						return true;
					} else {
						return false;
					}
				}

				this.eatCookie = function(){
					//eat the cookie!!(destroys it)
					var username = $cookieStore.get('username');
					$http.post('/session/end').success(function(data, status, headers, config){
						console.log(username);
						$cookieStore.remove('username');
						user.username = '';
					}).error(function(data,status,headers,config){
						alert("There was an err loggin out")
					})
				};
			},
			controllerAs:'nav'
		};
	}]);
})();