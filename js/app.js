var app = angular.module('groceryListApp', ['ngRoute']);

app.config(function ($routeProvider, $locationProvider) {
	$locationProvider.hashPrefix('');
	$routeProvider
		.when('/',{
			templateUrl: 'views/groceryList.html',
			controller: 'HomeController'
		})
		.when('/addItem', {
			templateUrl: 'views/addItem.html',
			controller: 'GroceryListItemController'
		})
		.when('/addItem/edit/:id', {
			templateUrl: 'views/addItem.html',
			controller: 'GroceryListItemController'
		})
		.otherwise({
			redirectTo: '/'
		});
});

app.service('GroceryService', function ($http) {
	var groceryService = {};

	if(localStorage.getItem('groceryService.groceryItems') === null){
		groceryService.groceryItems = [];
	} else {
		groceryService.groceryItems = JSON.parse(localStorage.getItem('groceryService.groceryItems'));
	}

	for (var item in groceryService.groceryItems) {
		groceryService.groceryItems[item].date = new Date(groceryService.groceryItems[item].date);
	}

	groceryService.getNewId = function () {

		groceryService.newId = groceryService.groceryItems.length + 1;

		return groceryService.newId;

	};

	groceryService.findById = function (id) {
		for (var item in groceryService.groceryItems) {
			if (groceryService.groceryItems[item].id === id) {
				return groceryService.groceryItems[item];
			}
		}
	};

	groceryService.removeItem = function (entry) {

		var index = groceryService.groceryItems.indexOf(entry);
		groceryService.groceryItems.splice(index, 1);

		groceryService.saveToLocalStorage();

	};

	groceryService.markCompleted = function (entry) {

		entry.completed = !entry.completed;

		groceryService.saveToLocalStorage();
	};

	groceryService.saveToLocalStorage = function () {
		localStorage.setItem('groceryService.groceryItems', JSON.stringify(groceryService.groceryItems));
	};

	groceryService.save = function (entry) {

		var updatedItem = groceryService.findById(entry.id);

		if (updatedItem) {

			updatedItem.completed = entry.completed;
			updatedItem.itemName = entry.itemName;
			updatedItem.date = entry.date;
			console.log(groceryService.groceryItems);

			groceryService.saveToLocalStorage();

		} else {

			entry.id = groceryService.getNewId();
			groceryService.groceryItems.push(entry);
			console.log(groceryService.groceryItems);

			groceryService.saveToLocalStorage();
		}
	};

	return groceryService;
});

app.controller('HomeController', ['$scope', 'GroceryService', function ($scope, GroceryService) {

    $scope.groceryItems = GroceryService.groceryItems;

	$scope.removeItem = function (entry) {
		GroceryService.removeItem(entry);
	};
	$scope.markCompleted = function (entry) {
		GroceryService.markCompleted(entry);
	};
	$scope.$watch(function () { return GroceryService.groceryItems; }, function (groceryItems) {
		$scope.groceryItems = groceryItems;
	});

}]);

app.controller('GroceryListItemController', ['$scope', '$routeParams', '$location', 'GroceryService', function ($scope, $routeParams, $location, GroceryService){
	$scope.edit = false;

	if (!$routeParams.id) {
		$scope.groceryItem = { "id":0, "completed": false, "itemName": '', "date": new Date() };

	} else {
		$scope.groceryItem = _.clone(GroceryService.findById(parseInt($routeParams.id)));
		$scope.edit = true;
	}

	$scope.save = function () {
		GroceryService.save( $scope.groceryItem );
		$location.path('/');
	};

}]);

app.directive('mfGroceryItem', function () {
	return{
		restrict: 'E',
		templateUrl: 'views/groceryItem.html'
	};
});
