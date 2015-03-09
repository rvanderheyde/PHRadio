(function(){
	var app = angular.module('nav-directives', ['ngCookies']);

	app.directive('navBar', ['$cookieStore', '$http', '$location', function($cookieStore, $http, $location){
		return {
			restrict: 'E',
			templateUrl: '../templates/nav.html',
			controller: function(){
				var user = this;
				this.username = $cookieStore.get('PHRname');
				if (this.username){
					this.soundcloud = $cookieStore.get('scId');
				} else {
					this.soundcloud = true;
				}
				console.log(this.username, this.soundcloud)

				$http.get('/session/username').success(function(data){
					//bake the cookie with username from server to control view.
					if (data !== 'error'){
						console.log(data)
						var username = data.userName;
						var soundcloud = data.soundcloud;
						$cookieStore.put('PHRname', username);
						$cookieStore.put('scId', soundcloud)
						user.username = username;
						user.soundcloud = soundcloud;
						if (user.soundcloud == ''){
							user.soundcloud = false;
						}
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
					var username = $cookieStore.get('PHRname');
					$http.post('/session/end').success(function(data, status, headers, config){
						console.log(username);
						$cookieStore.remove('PHRname');
						$cookieStore.remove('scId');
						user.username = '';
						user.soundcloud = true;
					}).error(function(data,status,headers,config){
						alert("There was an err loggin out")
					})
				};
			},
			controllerAs:'nav'
		};
	}]);
})();