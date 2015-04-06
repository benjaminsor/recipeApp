angular.module('recipes.controllers', [])

    .controller('tabCtrl', function($scope, authFactory) {
        $scope.user = authFactory.User.a || authFactory.User.b;

        $scope.notifications = 'ü';
        
    })

    .controller('loginCtrl', function($scope, $location, $rootScope, authFactory, $timeout, $ionicHistory, $window) {
        $scope.loginData = {};
        $scope.login = function() {
            $ionicHistory.clearCache();
            $ionicHistory.clearHistory();
            $window.localStorage.clear();
            var credentials = JSON.stringify($scope.loginData);
            authFactory.LogIn(credentials);
        };
        $scope.create = {};
        $scope.createUser = function() {
            $ionicHistory.clearCache();
            $ionicHistory.clearHistory();
            $window.localStorage.clear();
        	var newUser = JSON.stringify($scope.create);
            authFactory.CreateUser(newUser);
        };

        // ToDo: return promises for further actions
        // ToDo: Automatically add self to following list

    })

    .controller('HomeCtrl', function($scope, feedFactory, authFactory, feedFactory, $ionicTabsDelegate, $ionicPopup, arrayFactory, userFactory) {
        $scope.user = authFactory.User.a || authFactory.User.b;
        $scope.feed = {};

        var getFeed = function(username) {
            feedFactory.getFeed(username).success(function(data) {
                //ToDo: move this stuff to factory:
                var feed = [];
                var item = {};
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

                $scope.feed = feed;
                //console.log(feed);
            }).error(function(data) {
                console.log(data);
            }).finally(function() {
                $scope.$broadcast('scroll.refreshComplete');
            });
        };

        if($scope.user) {
            getFeed($scope.user.username);
        } else {
            authFactory.logOut();
        }

        var tabIndex = $ionicTabsDelegate.selectedIndex();  //move to factory!!! for all controllers..
        if (tabIndex === 0) {
            $scope.tab = 'home';
        } else if (tabIndex === 1) {
            $scope.tab = 'search';
        } else if (tabIndex === 2) {
            $scope.tab = 'addNew';
        } else if (tabIndex === 3) {
            $scope.tab = 'activity';
        } else {
            $scope.tab = 'profile';
        }

        $scope.doRefresh = function() {
            getFeed($scope.user.username);
        };

        $scope.$on('$ionicView.enter', function(){
            $scope.doRefresh();
        });

        var showAlert = function(x, y, z) {
            var alertPopup = $ionicPopup.alert({
                title: z,
                template: '<div style="text-align:center">' + x + ' ' + y + '!</div>',
                okType: 'button-balanced',
                okText: 'Got It'
            });
            alertPopup.then(function(res) {
                console.log(x + y + ': ' + z);
            });
        };

        $scope.addToTryList = function(recipe) {
            $scope.user.tryList.push(recipe._id);
            userFactory.updateUser($scope.user).then(function() {
                $scope.myBookAdd = true;
                $scope.tryListAdd = false;
                $scope.doRefresh();
                showAlert('Recipe', 'added', 'Try Later List');
            });
            var feedData = {
                username: $scope.user.username,
                date: new Date().getTime(),
                recipe: recipe._id,
                action: 'FORK'
            };
            feedFactory.postToFeed(feedData).success(function(data) {
                console.log(data);
            }).error(function(data) {
                console.log(data);
            });
        };

    })

    .controller('RecipeCtrl', function($scope, recipe, authFactory, userFactory, arrayFactory, $ionicPopup, $ionicTabsDelegate, recipeFactory, feedFactory) {
        $scope.user = authFactory.User.a || authFactory.User.b;
        $scope.recipe = recipe.data;
        $scope.myBookAdd = true;
        $scope.userNotes = '';

        var doRefresh = function(id) {
            recipeFactory.getRecipe(id).then(function(data) {
                 $scope.recipe = data.data;
            });
        };

        $scope.$on('$ionicView.enter', function(){
            doRefresh($scope.recipe._id);
        });

        if(recipe.data.source) {
            $scope.source = recipe.data.source.split('//')[1].split('.com')[0] + '.com';
        }
        
        var tabIndex = $ionicTabsDelegate.selectedIndex();  //move to factory!!! for all controllers..
        if (tabIndex === 0) {
            $scope.tab = 'home';
        } else if (tabIndex === 1) {
            $scope.tab = 'search';
        } else if (tabIndex === 2) {
            $scope.tab = 'addNew';
        } else if (tabIndex === 3) {
            $scope.tab = 'activity';
        } else {
            $scope.tab = 'profile';
        }

        angular.forEach($scope.user.myBook, function(value) {
            if (value.r_id === recipe.data._id) {
                $scope.myBookAdd = false;
                $scope.userNotes = value.userNotes;
            } 
        });

        var showAlert = function(x, y, z) {
           	var alertPopup = $ionicPopup.alert({
           		title: z,
             	template: '<div style="text-align:center">' + x + ' ' + y + '!</div>',
             	okType: 'button-balanced',
             	okText: 'Got It'
           	});
           	alertPopup.then(function(res) {
             	console.log(x + y + ': ' + z);
           	});
        };

        $scope.showBookpopup = function() {
            $scope.data = {};
            var myPopup = $ionicPopup.show({
                template: '<textarea ng-model="data.userNotes" placeholder="Add custom notes here..."></textarea>',
                title: 'Recipe Book',
                scope: $scope,
                buttons: [
                    {
                        text: 'OK',
                        type: 'button-balanced',
                        onTap: function(e) {
                            return $scope.data.userNotes;
                        }
                    }
                ]
            });
            myPopup.then(function(res) {
                addToMyBook($scope.data.userNotes);
            });
        };

        var addToMyBook = function(notes) {
            var newBookEntry = {
                r_id: recipe.data._id,
                userNotes: notes
            };
            $scope.user.myBook.push(newBookEntry);
            arrayFactory.remove($scope.user.tryList, recipe.data._id);
            userFactory.updateUser($scope.user).then(function() {
                doRefresh($scope.recipe._id);
                $scope.myBookAdd = false;
            });
            var feedData = {
                username: $scope.user.username,
                date: new Date().getTime(),
                recipe: $scope.recipe._id,
                action: 'BOOK'
            };
            feedFactory.postToFeed(feedData).success(function(data) {
                console.log(data);
            }).error(function(data) {
                console.log(data);
            });
        };

        // To Do: move to array factory
        var removeFromBook = function() {
            for(var i = 0; i < $scope.user.myBook.length; i++) {
                var obj = $scope.user.myBook[i];
                if($scope.user.myBook[i].r_id === recipe.data._id) {
                    $scope.user.myBook.splice(i, 1);
                    i--;
                }
            }
        };

        $scope.removeFromMyBook = function() {
            //To do: clean this up into factory???
            removeFromBook();
            userFactory.updateUser($scope.user).then(function() {
                $scope.myBookAdd = true;
                showAlert('Recipe', 'Removed', 'My Recipe Book');
                doRefresh($scope.recipe._id);
            });
        };

        $scope.addToTryList = function() {
            $scope.user.tryList.push(recipe.data._id);
            //To do: clean this up into factory???
            removeFromBook();
            userFactory.updateUser($scope.user).then(function() {
                $scope.myBookAdd = true;
                showAlert('Recipe', 'added', 'Try Later List');
                doRefresh($scope.recipe._id);
            });
            var feedData = {
                username: $scope.user.username,
                date: new Date().getTime(),
                recipe: $scope.recipe._id,
                action: 'FORK'
            };
            feedFactory.postToFeed(feedData).success(function(data) {
                console.log(data);
            }).error(function(data) {
                console.log(data);
            });
        };
        
        $scope.removeFromTryList = function() {
            arrayFactory.remove($scope.user.tryList, recipe.data._id);
            userFactory.updateUser($scope.user).then(function() {
                $scope.tryListAdd = true;
                showAlert('Recipe', 'removed', 'Try Later List');
            });
        };

        $scope.openRecipe = function() {

            //_self: cordova web view
            //_system: system browser - recommended
            //_blank: inAppBrowser

            window.open($scope.recipe.source, '_self', 'location=no'); return false;
        };

        $scope.RData = {};
        $scope.addComment = function() {
            var comment = {
                user: $scope.user.username,
                date: new Date().getTime(),
                content: $scope.RData.newComment
            };
            $scope.recipe.comments.push(comment);
            recipeFactory.postComment($scope.recipe._id, $scope.recipe).success(function(data) {
                console.log('Comment posted: ', data);
                doRefresh($scope.recipe._id);
                $scope.RData.newComment = '';
            }).error(function(data) {
                console.log('Comment failed to post: ', data);
            });
            var feedData = {
                username: $scope.user.username,
                date: new Date().getTime(),
                recipe: $scope.recipe._id,
                action: 'COMMENT'
            };
            feedFactory.postToFeed(feedData).success(function(data) {
                console.log(data);
            }).error(function(data) {
                console.log(data);
            });
        };

        $scope.removeComment = function(comment) {
            for(var i = 0; i < $scope.recipe.comments.length; i++) {
                var obj = $scope.recipe.comments[i];
                if($scope.recipe.comments[i]._id === comment._id) {
                    $scope.recipe.comments.splice(i, 1);
                    i--;
                }
            }
            recipeFactory.postComment($scope.recipe._id, $scope.recipe).success(function(data) {
                console.log('Comment removed: ', data);
                doRefresh($scope.recipe._id);
                showAlert('Comment', 'Removed', '');
            }).error(function(data) {
                console.log('Comment failed to remove: ', data);
            });
            
        }
             
    })

    .controller('activityCtrl', function($scope, authFactory, feedFactory, $ionicTabsDelegate) {
        $scope.user = authFactory.User.a || authFactory.User.b;

        feedFactory.getActivity($scope.user.username).success(function(data) {
            //var activity = [];
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
            })
            $scope.activity = data;
        }).error(function(data) {
            console.log(data);
        });

        var tabIndex = $ionicTabsDelegate.selectedIndex();  //move to factory!!! for all controllers..
        if (tabIndex === 0) {
            $scope.tab = 'home';
        } else if (tabIndex === 1) {
            $scope.tab = 'search';
        } else if (tabIndex === 2) {
            $scope.tab = 'addNew';
        } else if (tabIndex === 3) {
            $scope.tab = 'activity';
        } else {
            $scope.tab = 'profile';
        }

    })

    .controller('userCtrl', function($scope, authFactory, $ionicPopover, $sce, $ionicTabsDelegate, user, userFactory, arrayFactory, feedFactory) {
        $scope.user = user;
        var loggedInUser = authFactory.User.a || authFactory.User.b;

        if(loggedInUser.username === user.username) {
            $scope.me = true;
        } else {
            $scope.me = false;
        }

        for(var i = 0; i < loggedInUser.following.length;i++) {
            if(loggedInUser.following[i] === user.username) {
                $scope.following = true;
                break;
            } else {
                $scope.following = false;
            }
        }

        if(!$scope.user.image) {
            $scope.user.image = $sce.trustAsHtml('<i class="icon ion-ios-person"></i>');
        }

        var tabIndex = $ionicTabsDelegate.selectedIndex();  //move to factory!!! for all controllers..
        if (tabIndex === 0) {
            $scope.tab = 'home';
        } else if (tabIndex === 1) {
            $scope.tab = 'search';
        } else if (tabIndex === 2) {
            $scope.tab = 'addNew';
        } else if (tabIndex === 3) {
            $scope.tab = 'activity';
        } else {
            $scope.tab = 'profile';
        }

        $scope.follow = function() {
            loggedInUser.following.push($scope.user.username);
            $scope.user.followers.push(loggedInUser.username);
            userFactory.updateUser(loggedInUser).then(function() {
                $scope.following = true;
            });
            userFactory.updateUser($scope.user);
            var feedData = {
                username: loggedInUser.username,
                date: new Date().getTime(),
                user: $scope.user.username,
                action: 'FOLLOW'
            };
            feedFactory.postToFeed(feedData).success(function(data) {
                console.log(data);
            }).error(function(data) {
                console.log(data);
            });
        }

        $scope.unfollow = function() {
            arrayFactory.remove(loggedInUser.following, $scope.user.username);
            arrayFactory.remove($scope.user.followers, loggedInUser.username)
            userFactory.updateUser(loggedInUser).then(function() {
                $scope.following = false;
            });
            userFactory.updateUser($scope.user);
        }

        $scope.signOut = function() {
        	$scope.menu.hide();
        	authFactory.LogOut();
        };

        var menuTemplate = '<ion-popover-view><ion-content><ul class="list list-inset"><li class="item"><a>Edit Profile</a></li><li class="item"><a ng-click="signOut()">Sign Out</a></li></ul></ion-content></ion-popover-view>';

        $scope.menu = $ionicPopover.fromTemplate(menuTemplate, {
            scope: $scope
        });

        $scope.openMenu = function($event) {
            $scope.menu.show($event);
        };
        $scope.closeMenu = function() {
            $scope.menu.hide();
        };

    })

    .controller('recipeBookCtrl', function($scope, authFactory, rbRecipes, $ionicTabsDelegate) {
        $scope.user = authFactory.User.a || authFactory.User.b;
        $scope.recipes = rbRecipes.data;

        var tabIndex = $ionicTabsDelegate.selectedIndex();  //move to factory!!! for all controllers..
        if (tabIndex === 0) {
            $scope.tab = 'home';
        } else if (tabIndex === 1) {
            $scope.tab = 'search';
        } else if (tabIndex === 2) {
            $scope.tab = 'addNew';
        } else if (tabIndex === 3) {
            $scope.tab = 'activity';
        } else {
            $scope.tab = 'profile';
        }

        $scope.userNotes = '';
        var allRecipes = $scope.recipes;
        var user = $scope.user;
        angular.forEach(user.myBook, function(userbook) {
            angular.forEach(allRecipes, function(recipe) {
                if (userbook.r_id === recipe._id) {
                    $scope.userNotes = userbook.userNotes;
                } 
            });
        });

    })

    .controller('forkListCtrl', function($scope, authFactory, forkRecipes, $ionicTabsDelegate) {
        $scope.user = authFactory.User.a || authFactory.User.b;
        $scope.recipes = forkRecipes.data;

        var tabIndex = $ionicTabsDelegate.selectedIndex();  //move to factory!!! for all controllers..
        if (tabIndex === 0) {
            $scope.tab = 'home';
        } else if (tabIndex === 1) {
            $scope.tab = 'search';
        } else if (tabIndex === 2) {
            $scope.tab = 'addNew';
        } else if (tabIndex === 3) {
            $scope.tab = 'activity';
        } else {
            $scope.tab = 'profile';
        }

    })

    .controller('searchCtrl', function($scope, $ionicTabsDelegate, recipeFactory, userFactory, $sce, authFactory, arrayFactory) {
        var loggedInUser = authFactory.User.b;
        $scope.recipes = {};
        $scope.users = {};
        $scope.results;
        $scope.loaded = true;
        $scope.searchQuery = {};

        $scope.searchRecipes = function() {
            $scope.results = true;
            $scope.loaded = false;
            recipeFactory.getRecipeSearchResults($scope.searchQuery.recipes).success(function(data) {
                $scope.loaded = true;
                if (data.length) {
                    $scope.recipes = data;
                } else {
                    $scope.recipes = {};
                    $scope.results = false;
                }   
            }).error(function(data) {
                console.log('search failed: ', data);
            }); 
        };

        $scope.searchPeople = function() {
            $scope.results = true;
            $scope.loaded = false;
            userFactory.getPeopleSearchResults($scope.searchQuery.people).success(function(data) {
                $scope.loaded = true;
                if (data.length) {
                    $scope.users = data;
                } else {
                    $scope.users = {};
                    $scope.results = false;
                }     
            }).error(function(data) {
                console.log('search failed: ', data);
            }); 
        };
        
        $scope.image = $sce.trustAsHtml('<i class="icon ion-ios-person"></i>');

        var tabIndex = $ionicTabsDelegate.selectedIndex();  //move to factory!!! for all controllers..
        if (tabIndex === 0) {
            $scope.tab = 'home';
        } else if (tabIndex === 1) {
            $scope.tab = 'search';
        } else if (tabIndex === 2) {
            $scope.tab = 'addNew';
        } else if (tabIndex === 3) {
            $scope.tab = 'activity';
        } else {
            $scope.tab = 'profile';
        }

    })

    .controller('addNewCtrl', function($scope, authFactory, scrapeFactory, $ionicSlideBoxDelegate, $ionicPopup, $ionicLoading, recipeFactory, $location, arrayFactory, $ionicHistory, userFactory, feedFactory) {
        var user = authFactory.User.a || authFactory.User.b;
        
        $scope.formData = {
            username: user.username,
            category: '',
            meal: '',
            ethnicity: '',
            tags: [],
            notes: '',
            date: new Date().getTime()
        };
        $scope.scrapedData = {
            ingredients: [],
            directions: [],
            newDirection: '',
            newIngredient: ''
        };
        $scope.recipe = {};

        $scope.nextSlide = function() {
            $ionicSlideBoxDelegate.next();
        }

        $scope.prevSlide = function() {
            $ionicSlideBoxDelegate.previous();
        }

        $scope.urlNext = function() {
            $ionicLoading.show({
                template: 'Loading...'
            });
            var encodedUrl = encodeURIComponent($scope.formData.source);
            scrapeFactory.scrape(encodedUrl).success(function(data) {
                $scope.scrapedData.images = data.images;
                $scope.formData.name = data.name.replace(/\s+/g,' ').trim();
                $scope.scrapedData.ingredients = data.ingredients;
                $ionicLoading.hide();
                $scope.nextSlide();
            }).error(function(data){
                console.log('Failed to scrape:' + $scope.formData.url, data);
            });
        }

        $scope.removeIng = function(ing) {
            arrayFactory.remove($scope.scrapedData.ingredients, ing);
        }

        $scope.addIng = function() {
            $scope.scrapedData.ingredients.push($scope.scrapedData.newIngredient);
            $scope.scrapedData.newIngredient = '';
        }

        $scope.ingredientDone = function() {
            $scope.formData.ingredients = $scope.scrapedData.ingredients;
            $scope.nextSlide();
        }

        $scope.skipIng = function() {
            $scope.formData.ingredients = [];
            $scope.nextSlide();
        }

        $scope.removeDir = function(dir) {
            arrayFactory.remove($scope.scrapedData.directions, dir);
        }

        $scope.addDir = function(dir) {
            $scope.scrapedData.directions.push($scope.scrapedData.newDirection);
            $scope.scrapedData.newDirection = '';
        }

        $scope.directionDone = function() {
            $scope.formData.directions = $scope.scrapedData.directions;
            $scope.nextSlide();
        }

        $scope.postRecipe = function() {
            if($scope.recipe.tags) {
                var tagArray = $scope.recipe.tags.split(',');
                $scope.formData.tags = tagArray;
            }
            recipeFactory.postRecipe(JSON.stringify($scope.formData)).success(function(data) {
                console.log('Success!',data);
                var feedData = {
                    username: user.username,
                    date: new Date().getTime(),
                    recipe: data._id,
                    action: 'ADD'
                };
                feedFactory.postToFeed(feedData).success(function(data) {
                    console.log(data);
                }).error(function(data) {
                    console.log(data);
                });
                finishPopup(data._id);
            }).error(function(data) {
                console.log('Failed to add recipe!', data);
            });
            
        }

        var finishPopup = function(id) {
            $scope.data = {};
            var myPopup = $ionicPopup.show({
                title: 'Recipe Added!',
                template: 'Where do you want to put this recipe?',
                scope: $scope,
                buttons: [
                    {
                        text: 'Fork List',
                        type: 'button-balanced',
                        onTap: function(e) {
                            addToTryList(id);
                        }
                    },
                    {
                       text: 'Recipe Book',
                       type: 'button-balanced',
                       onTap: function(e) {
                           addToMyBook(id);
                       } 
                   }
                ]
            });
            myPopup.then(function(res) {
                $ionicHistory.goBack();
            });
        };

        var addToMyBook = function(id) {
            var newBookEntry = {
                r_id: id,
                userNotes: ''
            };
            user.myBook.push(newBookEntry);
            userFactory.updateUser(user).then(function() {
            });
        };

        var addToTryList = function(id) {
            user.tryList.push(id);
            userFactory.updateUser(user).then(function() {
            });
        };

    })

