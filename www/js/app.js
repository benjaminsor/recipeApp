angular.module('recipes', ['ionic', 'recipes.controllers', 'recipes.services', 'recipes.directives'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $httpProvider, $ionicConfigProvider) {

  $ionicConfigProvider.views.transition('none');
  $ionicConfigProvider.tabs.position('bottom');

  $httpProvider.defaults.withCredentials = true;

  $stateProvider

  .state('tab', {
    url: "/tab",
    abstract: true,
    templateUrl: "templates/tabs.html",
    controller: "tabCtrl"
  })
  .state('login', {
    url: "/login",
    templateUrl: "templates/login.html",
    controller: "loginCtrl"
  })
  .state('create', {
    url: "/create",
    templateUrl: 'templates/create.html',
    controller: 'loginCtrl'
  })


  ////////////////////////////////////////HOME TAB/////////////////////////////////////////


  .state('tab.home', {
    url: "/home",
    views: {
      'tab-home': {
        templateUrl: "templates/home/home.html",
        controller: 'HomeCtrl'
      }
    },
    resolve: {
      loggedin: function(authFactory) {
        return authFactory.Check();
      }
    }
  })
  .state('tab.searchRecipes', {
    url:'/searchRecipes',
    views: {
      'tab-home': {
        templateUrl: 'templates/home/search.html',
        controller: 'searchCtrl'
      }
    },
    resolve: {
      loggedin: function(authFactory) {
        return authFactory.Check();
      },
      recipes: function() {
        return true;
      }
    }
  })
  .state('tab.searchPeople', {
    url:'/searchPeople',
    views: {
      'tab-home': {
        templateUrl: 'templates/home/search.html',
        controller: 'searchCtrl'
      }
    },
    resolve: {
      loggedin: function(authFactory) {
        return authFactory.Check();
      },
      recipes: function() {
        return false;
      }
    }
  })
  .state('tab.homeRecipe', {
    url: "/home-recipe/:recId",
    views: {
      'tab-home': {
        templateUrl: "templates/Recipe.html",
        controller: 'RecipeCtrl'
      } 
    },
    resolve: {
      recipe: function($stateParams, recipeFactory) {
        return recipeFactory.getRecipe($stateParams.recId);
      }
    }
  })
  .state('tab.homeComments', {
    url: '/home/comments_:recId',
    views: {
      'tab-home': {
        templateUrl: 'templates/comments.html',
        controller: 'RecipeCtrl'     
      }
    },
    resolve: {
      recipe: function($stateParams, recipeFactory) {
        return recipeFactory.getRecipe($stateParams.recId);
      }
    }
  })
  .state('tab.homeUser', {
    url: '/home/user/:username',
    views: {
      'tab-home': {
        templateUrl: 'templates/profile/profile.html',
        controller: 'userCtrl'
      }
    },
    resolve: {
      loggedin: function(authFactory) {
        return authFactory.Check();
      },
      user: function($stateParams, userFactory, authFactory, $location) {
        var loggedinUser = authFactory.User.b;
        return userFactory.getUser($stateParams.username).then(function(data) {
          if(data.data.username === loggedinUser.username) {
            return loggedinUser;
          } else {
            return data.data;
          }
        });
      }
    }
  })
  .state('tab.homeUser.tryList', {
    url:'/try-list',
    views: {
      'profile-list': {
        templateUrl: 'templates/profile/recipeList.html',
        controller: 'forkListCtrl'
      }
    },
    resolve: {
      loggedin: function(authFactory) {
        return authFactory.Check();
      },
      forkRecipes: function(recipeFactory, $stateParams) {
        var username = $stateParams.username;
        return recipeFactory.getForkRecipes(username);
      }
    }
  })
  .state('tab.homeUser.recipeBook', {
    url:'/recipe-book',
    views: {
      'profile-list': {
        templateUrl: 'templates/profile/recipeList.html',
        controller: 'recipeBookCtrl'
      }
    },
    resolve: {
      loggedin: function(authFactory) {
        return authFactory.Check();
      },
      rbRecipes: function(recipeFactory, $stateParams) {
        var username = $stateParams.username;
        return recipeFactory.getBookRecipes(username);
      }
    }
  })


  ////////////////////////////////////////ADD NEW TAB/////////////////////////////////////////


  .state('tab.addNew', {
    url:"/add-new",
    views: {
      'tab-addNew': {
        templateUrl: "templates/add-new/addNew.html",
        controller: 'addNewCtrl'
      }
    },
    resolve: {
      loggedin: function(authFactory) {
        return authFactory.Check();
      }
    }
  })
  .state('tab.addNewWebsite', {
    url:"/add-new-from-website",
    views: {
      'tab-addNew': {
        templateUrl: "templates/add-new/addNewWebsite.html",
        controller: 'addNewCtrl'
      }
    },
    resolve: {
      loggedin: function(authFactory) {
        return authFactory.Check();
      }
    }
  })
  .state('tab.addNewPicture', {
    url:"/add-new-from-picture",
    views: {
      'tab-addNew': {
        templateUrl: "templates/add-new/addNewPicture.html",
        controller: 'addNewCtrl'
      }
    },
    resolve: {
      loggedin: function(authFactory) {
        return authFactory.Check();
      }
    }
  })
  .state('tab.addNewManual', {
    url:"/add-new-manual",
    views: {
      'tab-addNew': {
        templateUrl: "templates/add-new/addNewManual.html",
        controller: 'addNewCtrl'
      }
    },
    resolve: {
      loggedin: function(authFactory) {
        return authFactory.Check();
      }
    }
  })


  ////////////////////////////////////////NOTIFICATION TAB/////////////////////////////////////////


  .state('tab.activity', {
    url:"/activity",
    views: {
      'tab-activity': {
        templateUrl: "templates/activity/activity.html",
        controller: 'activityCtrl'
      }
    },
    resolve: {
      loggedin: function(authFactory) {
        return authFactory.Check();
      }
    }
  })
  .state('tab.activityRecipe', {
    url: "/activity-recipe/:recId",
    views: {
      'tab-activity': {
        templateUrl: "templates/Recipe.html",
        controller: 'RecipeCtrl'
      } 
    },
    resolve: {
      recipe: function($stateParams, recipeFactory) {
        return recipeFactory.getRecipe($stateParams.recId);
      }
    }
  })
  .state('tab.activityComments', {
    url: '/activity/comments_:recId',
    views: {
      'tab-activity': {
        templateUrl: 'templates/comments.html',
        controller: 'RecipeCtrl'     
      }
    },
    resolve: {
      recipe: function($stateParams, recipeFactory) {
        return recipeFactory.getRecipe($stateParams.recId);
      }
    }
  })
  .state('tab.activityUser', {
    url: '/activity/user/:username',
    views: {
      'tab-activity': {
        templateUrl: 'templates/profile/profile.html',
        controller: 'userCtrl'
      }
    },
    resolve: {
      loggedin: function(authFactory) {
        return authFactory.Check();
      },
      user: function($stateParams, userFactory, authFactory, $location) {
        var loggedinUser = authFactory.User.b;
        return userFactory.getUser($stateParams.username).then(function(data) {
          if(data.data.username === loggedinUser.username) {
            return loggedinUser;
          } else {
            return data.data;
          }
        });
      }
    }
  })
  .state('tab.activityUser.tryList', {
    url:'/try-list',
    views: {
      'profile-list': {
        templateUrl: 'templates/profile/recipeList.html',
        controller: 'forkListCtrl'
      }
    },
    resolve: {
      loggedin: function(authFactory) {
        return authFactory.Check();
      },
      forkRecipes: function(recipeFactory, $stateParams) {
        var username = $stateParams.username;
        return recipeFactory.getForkRecipes(username);
      }
    }
  })
  .state('tab.activityUser.recipeBook', {
    url:'/recipe-book',
    views: {
      'profile-list': {
        templateUrl: 'templates/profile/recipeList.html',
        controller: 'recipeBookCtrl'
      }
    },
    resolve: {
      loggedin: function(authFactory) {
        return authFactory.Check();
      },
      rbRecipes: function(recipeFactory, $stateParams) {
        var username = $stateParams.username;
        return recipeFactory.getBookRecipes(username);
      }
    }
  })


  ////////////////////////////////////////PROFILE TAB/////////////////////////////////////////


  .state('tab.profileRecipe', {
    url:'/profile-recipe/:recId',
    views: {
      'tab-profile': {
        templateUrl: 'templates/Recipe.html',
        controller: 'RecipeCtrl'
      }
    },
    resolve: {
      loggedin: function(authFactory) {
        return authFactory.Check();
      },
      recipe: function($stateParams, recipeFactory) {
        return recipeFactory.getRecipe($stateParams.recId);
      }
    }
  })
  .state('tab.profileComments', {
    url: '/profile/comments_:recId',
    views: {
      'tab-profile': {
        templateUrl: 'templates/comments.html',
        controller: 'RecipeCtrl'     
      }
    },
    resolve: {
      recipe: function($stateParams, recipeFactory) {
        return recipeFactory.getRecipe($stateParams.recId);
      }
    }
  })
  .state('tab.profileUser', {
    url: '/profile/user/:username',
    views: {
      'tab-profile': {
        templateUrl: 'templates/profile/profile.html',
        controller: 'userCtrl'
      }
    },
    resolve: {
      loggedin: function(authFactory) {
        return authFactory.Check();
      },
      user: function($stateParams, userFactory, authFactory, $location) {
        var loggedinUser = authFactory.User.b;
        return userFactory.getUser($stateParams.username).then(function(data) {
          if(data.data.username === loggedinUser.username) {
            return loggedinUser;
          } else {
            return data.data;
          }
        });
      }
    }
  })
  .state('tab.profileUser.tryList', {
    url:'/try-list',
    views: {
      'profile-list': {
        templateUrl: 'templates/profile/recipeList.html',
        controller: 'forkListCtrl'
      }
    },
    resolve: {
      loggedin: function(authFactory) {
        return authFactory.Check();
      },
      forkRecipes: function(recipeFactory, $stateParams) {
        var username = $stateParams.username;
        return recipeFactory.getForkRecipes(username);
      }
    }
  })
  .state('tab.profileUser.recipeBook', {
    url:'/recipe-book',
    views: {
      'profile-list': {
        templateUrl: 'templates/profile/recipeList.html',
        controller: 'recipeBookCtrl'
      }
    },
    resolve: {
      loggedin: function(authFactory) {
        return authFactory.Check();
      },
      rbRecipes: function(recipeFactory, $stateParams) {
        var username = $stateParams.username;
        return recipeFactory.getBookRecipes(username);
      }
    }
  });


  $urlRouterProvider.otherwise('/tab/home');

});
