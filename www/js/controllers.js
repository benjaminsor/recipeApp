angular.module('recipes.controllers', [])

    .controller('tabCtrl', function($scope, authFactory) {
        $scope.user = authFactory.User.a || authFactory.User.b;
        $scope.notifications = '';

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

    })

    .controller('HomeCtrl', function($scope, feedFactory, authFactory, $ionicPopup, arrayFactory, userFactory, tabRecognitionFactory, $ionicTabsDelegate) {
        $scope.user = authFactory.User.a || authFactory.User.b;
        $scope.feed = {};

        var getFeed = function(username) {
            feedFactory.getFeed(username).then(function(data) {
                $scope.feed = data;
            }).finally(function() {
                $scope.$broadcast('scroll.refreshComplete');
            });
        };

        if($scope.user) {
            getFeed($scope.user.username);
        } else {
            authFactory.logOut();
        }

        var tabIndex = $ionicTabsDelegate.selectedIndex();
        $scope.tab = tabRecognitionFactory.tab(tabIndex);

        $scope.doRefresh = function() {
            getFeed($scope.user.username);
            setTimeout(function() {
                $scope.loading = false;
            },500);
        };

        $scope.$on('$ionicView.leave', function(){
            $scope.loading = true;
        });

        $scope.$on('$ionicView.beforeEnter', function(){
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


        $scope.handleForkList = function(recipe) {
            if($scope.user.tryList.length) {
                if ($scope.user.tryList.indexOf(recipe._id) > -1) {
                    removeFromTryList(recipe);
                } else {
                    addToTryList(recipe);
                }
            } else {
                addToTryList(recipe); 
            }
        };

        var addToTryList = function(recipe) {
            $scope.user.tryList.push(recipe._id);
            userFactory.updateUser($scope.user).then(function() {
                showAlert('Recipe', 'forked', '');
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
            });
        };

        var removeFromTryList = function(recipe) {
            arrayFactory.remove($scope.user.tryList, recipe._id);
            userFactory.updateUser($scope.user).then(function() {
                showAlert('Recipe', 'removed', 'Fork List');
            });
        };

    })

    .controller('RecipeCtrl', function($scope, recipe, authFactory, userFactory, arrayFactory, $ionicPopup, recipeFactory, feedFactory, tabRecognitionFactory, $ionicTabsDelegate, $location) {
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
        
        var tabIndex = $ionicTabsDelegate.selectedIndex();
        $scope.tab = tabRecognitionFactory.tab(tabIndex);

        angular.forEach($scope.user.myBook, function(value) {
            if (value.r_id === recipe.data._id) {
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

        var checkListStatus = function() {
            if ($scope.user.tryList.indexOf($scope.recipe._id) > -1) {
                $scope.forkAd = true;
                $scope.bookAd = false;
            } else {
                $scope.forkAd = false;
            }  

            $scope.user.myBook.map(function(item) {
                if(item.r_id === $scope.recipe._id) {
                    $scope.bookAd = true;
                    $scope.forkAd = false;
                } else {
                    $scope.bookAd = false;
                }
            })
        };

        checkListStatus();

        $scope.handleBookList = function() {
            if($scope.user.myBook.length) {
                for (var i = 0; i < $scope.user.myBook.length; i++) {
                    if ($scope.user.myBook[i].r_id === $scope.recipe._id) {
                        $scope.bookAd = false;
                        removeFromMyBook();
                    } else {
                        $scope.bookAd = true;
                        showBookpopup();
                    }
                }
            } else {
                $scope.bookAd = true;
                showBookpopup(); 
            }
        };

        var showBookpopup = function() {
            $scope.forkAd = false;
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
            $scope.forkAd = false;
            userFactory.updateUser($scope.user).then(function() {
                doRefresh($scope.recipe._id);
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

        var removeFromMyBook = function() {
            //To do: clean this up into factory???
            removeFromBook();
            userFactory.updateUser($scope.user).then(function() {
                $scope.myBookAdd = true;
                showAlert('Recipe', 'Removed', 'My Recipe Book');
                doRefresh($scope.recipe._id);
            });
        };

        $scope.handleForkList = function() {
            if($scope.user.tryList.length) {
                if ($scope.user.tryList.indexOf($scope.recipe._id) > -1) {
                    $scope.forkAd = false;
                    removeFromTryList();
                } else {
                    $scope.forkAd = true;
                    addToTryList();
                }
            } else {
                $scope.forkAd = true;
                addToTryList(); 
            }
        };

        var addToTryList = function() {
            $scope.bookAd = false;
            $scope.user.tryList.push(recipe.data._id);
            //To do: clean this up into factory???
            removeFromBook();
            
            userFactory.updateUser($scope.user).then(function() {
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
        
        var removeFromTryList = function() {
            arrayFactory.remove($scope.user.tryList, recipe.data._id);
            userFactory.updateUser($scope.user).then(function() {
                showAlert('Recipe', 'removed', 'Try Later List');
            });
        };

        $scope.openRecipe = function() {

            //_self: cordova web view
            //_system: system browser - recommended
            //_blank: inAppBrowser

            window.open($scope.recipe.source, '_self', 'location=no'); return false;
        };

        $scope.goToComment = function() {
            var redirect = '/tab/' + $scope.tab + '/comments_' + $scope.recipe._id;
            $location.path(redirect);
        };



        if($scope.recipe.comments.length) {
            $scope.ifComments = true;
        } else {
            $scope.ifComments = false;
        }


        $scope.RData = {};
        $scope.addComment = function() {
            console.log($scope.RData);
            var comment = {
                user: $scope.user.username,
                date: new Date().getTime(),
                content: $scope.RData.newComment
            };
            $scope.recipe.comments.push(comment);
            recipeFactory.postComment($scope.recipe._id, $scope.recipe).success(function(data) {
                console.log('Comment posted: ', data);
                $scope.ifComments = true;
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
                if(!$scope.recipe.comments.length) {
                    $scope.ifComments = false;
                }
                //showAlert('Comment', 'Removed', '');
            }).error(function(data) {
                console.log('Comment failed to remove: ', data);
            });
            
        }
             
    })

    .controller('activityCtrl', function($scope, authFactory, feedFactory, tabRecognitionFactory, $ionicTabsDelegate) {
        $scope.user = authFactory.User.a || authFactory.User.b;
        $scope.feed = {};

        feedFactory.getActivity($scope.user.username).then(function(data) {
            $scope.activity = data;
        });

        var tabIndex = $ionicTabsDelegate.selectedIndex();
        $scope.tab = tabRecognitionFactory.tab(tabIndex);

    })

    .controller('userCtrl', function($scope, authFactory, $ionicPopover, $sce, tabRecognitionFactory, $ionicTabsDelegate, user, userFactory, arrayFactory, feedFactory) {
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

        var tabIndex = $ionicTabsDelegate.selectedIndex();
        $scope.tab = tabRecognitionFactory.tab(tabIndex);

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

    .controller('recipeBookCtrl', function($scope, authFactory, rbRecipes, tabRecognitionFactory, $ionicTabsDelegate) {
        $scope.user = authFactory.User.a || authFactory.User.b;
        $scope.recipes = rbRecipes.data;

        var tabIndex = $ionicTabsDelegate.selectedIndex();
        $scope.tab = tabRecognitionFactory.tab(tabIndex);

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

    .controller('forkListCtrl', function($scope, authFactory, forkRecipes, tabRecognitionFactory, $ionicTabsDelegate) {
        $scope.user = authFactory.User.a || authFactory.User.b;
        $scope.recipes = forkRecipes.data;

        var tabIndex = $ionicTabsDelegate.selectedIndex();
        $scope.tab = tabRecognitionFactory.tab(tabIndex);

    })

    .controller('searchCtrl', function($scope, recipeFactory, tabRecognitionFactory, $ionicTabsDelegate, recipes, userFactory, $sce, authFactory, arrayFactory) {
        var loggedInUser = authFactory.User.b;
        $scope.searchItems = {};
        $scope.results;
        $scope.source;
        $scope.loaded = true;
        $scope.searchQuery = {};
        $scope.recipes = recipes;
        var tabIndex = $ionicTabsDelegate.selectedIndex();
        $scope.tab = tabRecognitionFactory.tab(tabIndex);

        $scope.$watch("recipes", function(newValue, oldValue) {
            console.log($scope.recipes);    
        });



        $scope.searchRecipes = function() {
            $scope.results = true;
            $scope.loaded = false;
            recipeFactory.getRecipeSearchResults($scope.searchQuery.recipes).success(function(data) {
                $scope.loaded = true;
                if (data.length) {

                    for(var i = 0; i < data.length; i++) {
                        if(data[i].source) {
                            data[i].source = data[i].source.split('//')[1].split('.com')[0] + '.com';
                        }
                    }

                    $scope.searchItems = data;
                    
                } else {
                    $scope.searchItems = {};
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
                    $scope.searchItems = data;
                } else {
                    $scope.searchItems = {};
                    $scope.results = false;
                }     
            }).error(function(data) {
                console.log('search failed: ', data);
            }); 
        };
        
        $scope.image = $sce.trustAsHtml('<i class="icon ion-ios-person"></i>');

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

        $scope.disableSwipe = function() {
            $ionicSlideBoxDelegate.enableSlide(false);
        };


        
        
        

        $scope.nextSlide = function() {
            if ($ionicSlideBoxDelegate.$getByHandle()._instances[0].$$delegateHandle === 'maual') {
                if ($ionicSlideBoxDelegate.currentIndex() === 2) {
                    ingredientNext();
                } else if ($ionicSlideBoxDelegate.currentIndex() === 3) {
                    directionNext();
                } else if ($ionicSlideBoxDelegate.currentIndex() === 8) {
                   postRecipe();
                } else {
                    $ionicSlideBoxDelegate.next();
                }
            } else if ($ionicSlideBoxDelegate.$getByHandle()._instances[0].$$delegateHandle === 'website') {
                if ($ionicSlideBoxDelegate.currentIndex() === 0) {
                    urlNext();
                } else if ($ionicSlideBoxDelegate.currentIndex() === 3) {
                    ingredientNext();
                } else if ($ionicSlideBoxDelegate.currentIndex() === 8) {
                    postRecipe();
                } else {
                    $ionicSlideBoxDelegate.next();
                }
            } else {
                $ionicSlideBoxDelegate.next();
            }
        }

        $scope.prevSlide = function() {
            $ionicSlideBoxDelegate.previous();
        }

        var urlNext = function() {
            $ionicLoading.show({
                template: 'Retrieving Recipe Data...'
            });
            if($scope.formData.source) {
                var encodedUrl = encodeURIComponent($scope.formData.source);
                scrapeFactory.scrape(encodedUrl).success(function(data) {
                    if (!arrayFactory.objectEmpty(data)) {
                        $scope.scrapedData.images = data.images;
                        $scope.formData.name = data.name.replace(/\s+/g,' ').trim();
                        $scope.scrapedData.ingredients = data.ingredients; 
                        $ionicLoading.hide();
                        $ionicSlideBoxDelegate.next();
                    } else {
                        $ionicLoading.show({
                            template: 'Could Not Retrieve Recipe Data'
                        });
                        setTimeout(function() {
                            $ionicLoading.hide();
                            $ionicSlideBoxDelegate.next();
                        }, 2000);
                    }
                }).error(function(data){
                    console.log('Failed to scrape:' + $scope.formData.url, data);
                });
            } else {
                $ionicLoading.show({
                    template: 'You Must Enter a URL'
                });
                setTimeout(function() {
                    $ionicLoading.hide();
                }, 2000);
                console.log('Empty URL!');
            }
        }

        $scope.removeIng = function(ing) {
            arrayFactory.remove($scope.scrapedData.ingredients, ing);
            $ionicSlideBoxDelegate.update();
        }

        $scope.addIng = function() {
            $scope.scrapedData.ingredients.push($scope.scrapedData.newIngredient);
            $scope.scrapedData.newIngredient = '';
            $ionicSlideBoxDelegate.update();
        }

        var ingredientNext = function() {
            $scope.formData.ingredients = $scope.scrapedData.ingredients;
            $ionicSlideBoxDelegate.next();
        }

        $scope.skipIng = function() {
            $scope.formData.ingredients = [];
            $ionicSlideBoxDelegate.next();
        }

        $scope.removeDir = function(dir) {
            arrayFactory.remove($scope.scrapedData.directions, dir);
            $ionicSlideBoxDelegate.update();
        }

        $scope.addDir = function(dir) {
            $scope.scrapedData.directions.push($scope.scrapedData.newDirection);
            $scope.scrapedData.newDirection = '';
            $ionicSlideBoxDelegate.update();
        }

        var directionNext = function() {
            $scope.formData.directions = $scope.scrapedData.directions;
            $ionicSlideBoxDelegate.next();
        }

        $scope.getMainPic = function() {
            $scope.imgUrl = '';
            $scope.imageLoading = true;
            navigator.camera.getPicture(
                upload,
                function(message) {
                    alert('Failed to connect to camera!');
                },
                {
                    sourceType : Camera.PictureSourceType.PHOTOLIBRARY
                }
            );
            function upload(imageURI) {
                var baseUrl = 'https://recipe-service.herokuapp.com/api/';
                var ft = new FileTransfer();
                ft.upload(imageURI, encodeURI(baseUrl + 'file/upload'), win, fail);
            };
            function win(r) {
                console.log(r.response);
                $scope.imgUrl = r.response;
                $ionicSlideBoxDelegate.update();
            };
            function fail(error) {
                console.log(error.source);
            }; 
        }

        $scope.takeMainPic = function() {
            $scope.imgUrl = '';
            $scope.imageLoading = true;
            navigator.camera.getPicture(
                upload,
                function(message) {
                    alert('Failed to connect to camera!');
                }
            );
            function upload(imageURI) {
                var baseUrl = 'https://recipe-service.herokuapp.com/api/';
                var ft = new FileTransfer();
                ft.upload(imageURI, encodeURI(baseUrl + 'file/upload'), win, fail);
            };
            function win(r) {
                console.log(r.response);
                $scope.imgUrl = r.response;
                $ionicSlideBoxDelegate.update();
            };
            function fail(error) {
                console.log(error.source);
            };
        };

        var postRecipe = function() {
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

    

