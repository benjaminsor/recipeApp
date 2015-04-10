angular.module('recipes.services', [])

  .factory('authFactory', ['$http', '$ionicHistory', '$location', '$q', '$timeout', '$rootScope', '$window', function($http, $ionicHistory, $location, $q, $timeout, $rootScope, $window) {
    //var baseUrl = 'https://recipe-service.herokuapp.com/api/';
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

    //var baseUrl = 'https://recipe-service.herokuapp.com/api/';
    var baseUrl = 'http://localhost:8888/api/';

    var buildFeed = function(username) {
      var feed = [];
      var item = {};
      $http.get(baseUrl + username + '/feed').success(function(data) {
        angular.forEach(data, function(item) {
          item.actions.sort(function(a, b) {
              a = new Date(a.date);
              b = new Date(b.date);
              return a>b ? -1 : a<b ? 1 : 0;
          });
          var actionLength;
          var actArray = [];
          angular.forEach(item.actions, function(action) {
              if(action.action === item.actions[0].action) {
                  actArray.push(action);
              }
          });
          var actionsNumber = [];
          angular.forEach(actArray, function(el){
              if($.inArray(el.username, actionsNumber) === -1) {
                  actionsNumber.push(el.username);
              } 
              actionLength = JSON.stringify(actionsNumber.length - 1);
          });
          var act = item.actions[0];
          if(act.action === 'FORK') {
              if(actionLength === '0') {
                  act.phrase = 'forked this';
              } else if(actionLength === '1') {
                  act.phrase = 'and ' + actionLength + ' other person forked this';
              } else {
                  act.phrase = 'and ' + actionLength + ' other people forked this';
              }
          } else if (act.action === 'COMMENT') {
              if(actionLength === '0') {
                  act.phrase = 'commented on this';
              } else if(actionLength === '1') {
                  act.phrase = 'and ' + actionLength + ' other person commented on this';
              } else {
                  act.phrase = 'and ' + actionLength + ' other people commented on this';
              }
          } else if (act.action === 'BOOK') {
              if(actionLength === '0') {
                  act.phrase = 'added this to their book';
              } else if(actionLength === '1') {
                  act.phrase = 'and ' + actionLength + ' other person added this to their book';
              } else {
                  act.phrase = 'and ' + actionLength + ' other people added this to their book';
              }
          } else if (act.action === 'ADD') {
              act.phrase = 'added a new recipe';
          }
          item.action = item.actions[0];
          item.number = actionLength;
          item.recipe = item.recipe;
          feed.push(item);
        });
      }).error(function(data) {
        feed = data;
        console.log(data);
      });
      return feed;
    };

    var buildActivity = function(username) {
      var activity = [];
      var item = {};
      $http.get(baseUrl + username + '/activity').success(function(data) {
        angular.forEach(data, function(item) {
            if(item.action === 'FORK') {
                item.phrase = 'forked your recipe:';
            } else if (item.action === 'BOOK') {
                item.phrase = 'added your recipe to their book:';
            } else if (item.action === 'COMMENT') {
                item.phrase = 'commented on your recipe:';
            } else if (item.action === 'FOLLOW') {
                item.phrase = 'started following you.';
            }
            activity.push(item);
        })
      }).error(function(data) {
        activity = data;
        console.log(data);
      });
      return activity;
    };

    return {
      getFeed: function(username) {
        var dfd = $q.defer();
        dfd.resolve(buildFeed(username));
        return dfd.promise;
      },
      getActivity: function(username) {
        var dfd = $q.defer();
        dfd.resolve(buildActivity(username));
        return dfd.promise;
      },
      postToFeed: function(data) {
        return $http.post(baseUrl + 'feed', data);
      }
    }

  }])

  .factory('recipeFactory', ['$http','$q', function($http, $q) {
    
    //var baseUrl = 'https://recipe-service.herokuapp.com/api/';
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

    //var baseUrl = 'https://recipe-service.herokuapp.com/api/';
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

    //var baseUrl = 'https://recipe-service.herokuapp.com/api/';
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

  }])

  .factory('tabRecognitionFactory', ['$ionicTabsDelegate', function($ionicTabsDelegate) {
    var tabIndex = $ionicTabsDelegate.selectedIndex();
    var tabName = function() {
      if (tabIndex === 0) {
          return 'home';
      } else if (tabIndex === 1) {
          return 'addNew';
      } else if (tabIndex === 2) {
          return 'activity';
      } else if (tabIndex === 3) {
          return 'profile';
      }
      return '';
    };
    return {
      tab: tabName()
    }

  }])

  .factory('Camera', ['$q','$cordovaCamera','$cordovaFileTransfer', function($q, $cordovaCamera, $cordovaFileTransfer) {

    //var baseUrl = 'https://recipe-service.herokuapp.com/api/';
    var baseUrl = 'http://localhost:8888/api/';

    var takeSaveImage = function() {
      var imgSrc;
      var imgUrl;

      $cordovaCamera.getPicture(function(result) {
        imgUrl = result;
      }, function(err) {
      }, options);

      $cordovaFileTransfer.upload(baseUrl + 'file/upload', imgUrl, options).then(function(result) {
        console.log(result);
        imgSrc = result;
      })

      return imgSrc;
    }

    return {
      getPicture: function(options) {
        var q = $q.defer();
        q.resolve(takeSaveImage());
        return q.promise;
      }
    }
  }])



