angular.module('recipes.services', [])

  .factory('authFactory', ['$http', '$ionicHistory', '$location', '$q', '$timeout', '$rootScope', '$window', function($http, $ionicHistory, $location, $q, $timeout, $rootScope, $window) {
    
    var baseUrl = 'http://localhost:8888/api/';

    var authFactory = {
      User: {
        a: null,
        b: JSON.parse($window.localStorage['userData'] || '{}')
      },
      LogIn: function(data) {
        return $http.post(baseUrl + 'login', data).success(function(data) {
                  authFactory.User.a = data;
                  $window.localStorage['userData'] = JSON.stringify(data);
                  authFactory.User.b = JSON.parse($window.localStorage['userData'] || '{}');
                  $ionicHistory.nextViewOptions({
                      disableBack: true
                  });
                  $location.path('/tab/home');
              }).error(function(error) {
                  console.log(error);
              });
      },
      CreateUser: function(data) {
        console.log(data);
        return $http.post(baseUrl + 'create' , data).success(function(data) {
                authFactory.User.a = data;
                $window.localStorage['userData'] = JSON.stringify(data);
                $ionicHistory.nextViewOptions({
                    disableBack: true
                });
                $location.path('/tab/home');
            }).error(function(error) {
                console.log(error);
            });
      },
      LogOut: function() {
        return $http.get(baseUrl + 'logout').success(function(data) {
          $ionicHistory.clearCache();
          $ionicHistory.clearHistory();
          console.log(data);
          $window.localStorage.clear();
          $location.path('/login');
        }).error(function(data) {
          console.log(data);
        });
      },
      Check: function(){ 
        var deferred = $q.defer(); 
        $http.get(baseUrl + 'loggedin').success(function(user){ 
          if (user !== '0') {
            deferred.resolve(); 
          } else { 
            $rootScope.message = 'You need to log in.'; 
            deferred.reject(); 
            $timeout(function() {
              $location.path('/login');
            });
          } 
        }); 
        return deferred.promise; 
      }
    };
    return authFactory;

  }])

  .factory('feedFactory', ['$http', '$q', function($http, $q) {

    var baseUrl = 'http://localhost:8888/api/';

    return {
      getFeed: function(username) {
        return $http.get(baseUrl + username + '/feed');
      },
      getActivity: function(username) {
        return $http.get(baseUrl + username + '/activity');
      },
      postToFeed: function(data) {
        return $http.post(baseUrl + 'feed', data);
      }
    }

  }])

  .factory('recipeFactory', ['$http','$q', function($http, $q) {
    
    var baseUrl = 'http://localhost:8888/api/';

    return {
      getRecipes: function() {
        return $http.get(baseUrl + 'recipes');
      },
      getRecipe: function(id) {
        var dfd = $q.defer();
        var getTheRec = function(id) {
          return $http.get(baseUrl + 'recipes/' + id);
        };
        dfd.resolve(getTheRec(id));
        return dfd.promise;
      },
      postRecipe: function(data) {
        return $http.post(baseUrl + 'recipes', data);
      },
      getBookRecipes: function(username) {
        var dfd = $q.defer();
        var getTheRecs = function(username) {
          return $http.get(baseUrl + username + '/bookRecipes');
        };
        dfd.resolve(getTheRecs(username));
        return dfd.promise;
      },
      getForkRecipes: function(username) {
        var dfd = $q.defer();
        var getTheRecs = function(username) {
          return $http.get(baseUrl + username + '/forkRecipes');
        };
        dfd.resolve(getTheRecs(username));
        return dfd.promise;
      },
      getRecipeSearchResults: function(query) {
        if (!query) {
          query = "no-search";
        }
        return $http.get(baseUrl + 'search-recipes/' + query);
      },
      postComment: function(id, data) {
        return $http.put(baseUrl + 'recipes/' + id + '/comment', JSON.stringify(data));
      }
    };
    
  }])

  .factory('userFactory', ['$http','$q', '$window', function($http, $q, $window) {

    var baseUrl = 'http://localhost:8888/api/';

    return {
      getUser: function(username) {
        var dfd = $q.defer();
        var getTheUser = function(username) {
          return $http.get(baseUrl + 'users/' + username);
        }
        dfd.resolve(getTheUser(username));
        return dfd.promise;
      },
      updateUser: function(data) {
        var dfd = $q.defer();
        var updateTheUser = function(data) {
          $http.put(baseUrl + 'users/' + data._id, JSON.stringify(data))
          .success(function(data) {
            $window.localStorage['userData'] = JSON.stringify(data);
          })
          .error(function(data){
            console.log(data);
          });
        };
        dfd.resolve(updateTheUser(data));
        return dfd.promise;
      },
      getPeopleSearchResults: function(query) {
        if (!query) {
          query = "no-search";
        }
        return $http.get(baseUrl + 'search-people/' + query);
      }
    };

  }])

  .factory('scrapeFactory', ['$http', function($http) {

    var baseUrl = 'http://localhost:8888/api/';

    return {
      scrape: function(url) {
        return $http.get(baseUrl + 'scrape/' + url);
      }
    }

  }])

  .factory('arrayFactory', [function() {
    return {
      remove: function(arr) {
        var what, a = arguments, L = a.length, ax;
              while (L > 1 && arr.length) {
                  what = a[--L];
                  while ((ax= arr.indexOf(what)) !== -1) {
                      arr.splice(ax, 1);
                  }
              }
              return arr;
      }
    }

  }]);



