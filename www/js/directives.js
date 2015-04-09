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

.directive('forkActive', function() {
    return {
        restrict: 'A',
        link: function(scope, elem, attr) {
            var forkedList = scope.user.tryList;
            var bookedList = scope.user.myBook;
            var toggleClass = function() {
                if (forkedList.indexOf(scope.item.recipe._id) > -1) {
                    elem.addClass('active');
                } else {
                    elem.removeClass('active');
                }
            };
            elem.on('click', function() {
                toggleClass();
            });
            toggleClass();
            
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

