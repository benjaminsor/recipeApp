angular.module('recipes.directives', [])


.directive('activeState', function($state, $rootScope) {
	return {
		restrict: 'A',
		link: function(scope, elem, attr) {
			function activate() {
				var state = $state.current.name.split('.')[2];
				var statesToMatch = attr.activeState;
				if(state === statesToMatch) {
					elem.addClass('active');
				} else {
					elem.removeClass('active');
				}
			}
			$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
				activate();
			})
			activate();
		}
	}
})

.directive('activate', function($state, $rootScope) {
    return {
        restrict: 'A',
        link: function(scope, elem, attr) {
            elem.on('click', function() {
                elem.siblings().removeClass('active');
                if(!elem.hasClass('active')) {
                    elem.addClass('active');
                    scope.formData.image = elem.find('img').attr('src');
                } 
            })
        }
    }
})

.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });
                event.preventDefault();
            }
        });
    };
})

.directive('closeComment', function () {
    return {
    	restrict: 'A',
    	link: function(scope, elem, attr) {
    		var commentUser = scope.comment.user;
    		var loggedInUser = scope.user;
    		if(commentUser === loggedInUser.username) {
    			elem.removeClass('hide');
    		}
    	}
    }
})

.directive('activateForkList', function (authFactory) {
    return {
    	restrict: 'A',
    	link: function(scope, elem, attr) {
    		var forkList = scope.user.tryList;
            var bookList = scope.user.myBook;
    		function activate() {
    			elem.removeClass('active button-balanced');
    			angular.forEach(forkList, function(value) {
    				if(value === scope.item.recipe._id) {
    					elem.addClass('active button-balanced');
    					elem.unbind('click');
    				} 
    			}) 
                angular.forEach(bookList, function(value) {
                    if(value.r_id === scope.item.recipe._id) {
                        elem.addClass('active button-balanced button-clear').css('box-shadow','none').removeClass('button-light');
                        elem.find('i').removeClass('ion-fork').addClass('ion-ios-book');
                        elem.unbind('click');
                    } 
                })
    		}
    		elem.on('click', function() {
    			activate();
    		})
    		activate();
    	}
    }
})

.directive('commentLimit', function() {
	return {
		restrict: 'A',
		link: function(scope, elem, attr) {
			var limit = attr.commentLimit;
			var comments = scope.recipe.comments;
			console.log(comments.slice(-1));
		}
	}
})

