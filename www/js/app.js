// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var myApp = angular.module('starter', ['ionic', 'firebase']).constant('FIREBASE_URL', 'https://hello-d30c1.firebaseio.com/')

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})
  .run(["$rootScope", "$state", function($rootScope, $state) {
    $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
      // We can catch the error thrown when the $requireSignIn promise is rejected
      // and redirect the user back to the home page
      if (error === "AUTH_REQUIRED") {
        $state.go("tabs.home");
      }
    });
  }])

.config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('tabs', {
      url: '/tab',
      abstract: true,
      templateUrl: 'templates/tabs.html'
    })
    .state('tabs.categories', {
      url: '/categories',
      views: {
        'categories' : {
          templateUrl: 'templates/categories.html',
          controller: 'QuestionnairesController'
        }
      },
      resolve: {
        currentAuth: function (Authentication) {
          return Authentication.requireAuth()
        }
      }
    })

    .state('tabs.app', {
      url: '/app',
      views: {
        'app' : {
          templateUrl: 'templates/app.html',
          controller: 'AppController'
        }
      },
      resolve: {
        currentAuth: function (Authentication) {
          return Authentication.requireAuth()
        }
      }
    })
    .state('tabs.login', {
      url: '/login',
      views: {
        'login' : {
          templateUrl: 'templates/login.html',
          controller: 'LoginController'
        }
      }
    })
    .state('tabs.app.logout', {
      url: '/logout',
      views: {
        'home' : {
          templateUrl: 'templates/home.html'
        }
      }
    })
    .state('tabs.home', {
      url: '/home',
      views: {
        'home' : {
          templateUrl: 'templates/home.html',
          controller: 'LoginController'
        }
      }
    })
    .state('tabs.register', {
      url: '/register',
      views: {
        'register-form' : {
          templateUrl: 'templates/register.html',
          controller: 'RegisterController'
        }
      }
    })

  $urlRouterProvider.otherwise('tab/home')
})

myApp.factory('Authentication', ['$rootScope', '$location', '$firebaseAuth',  function ($rootScope, $location, $firebaseAuth) {
  var auth = $firebaseAuth()

  $rootScope.data = {
    message: null
  }
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      $rootScope.currentUser = user
    } else {
      $rootScope.currentUser = null
    }
    if (user.email == "admin@admin.com"){
          $rootScope.adminUser = true;
      }
    else
    {
      $rootScope.adminUser = false;

    }
  })
  var authObj =  {
    login: function (user) {
      if(user) {
        firebase.auth().signInWithEmailAndPassword(user.email, user.password)
          .then(function () {
          $location.path('/tab/categories')
          $rootScope.data.message = 'You are currently logged in.'
            console.log("logged in")
        })
          .catch(function (error) {
          console.log(error.message);
          $rootScope.data.message = error.message
        })
      }
      else {
        console.log('login failed')
      }
    },
    logout: function () {
      return $firebaseAuth().$signOut().then(
          $rootScope.adminUser = false,
          console.log("out",$rootScope.adminUser))
    },
    requireAuth: function () {
    return $firebaseAuth();
    },
    register: function (user) {
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
        .then(function () {

          // authObj.login(user.email,user.password)
          //Looks like correct, but I don't know
          firebase.auth().signInWithEmailAndPassword(user.email, user.password)
            .then(function () {
               $location.path('/tab/categories')
              $rootScope.data.message = 'You are currently logged in.'
               console.log("logged in")
    })
})
  .catch(function (error) {
    console.log(error.message);
    $rootScope.data.message = error.message
  })
}
  }

  return authObj
}])


myApp.controller('LoginController', ['$scope', '$rootScope', 'Authentication', function ($scope, $rootScope, Authentication) {
  $scope.login = function () {
    Authentication.login($scope.user)
  }

  $scope.logout = function () {
    Authentication.logout()
  }
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
    $rootScope.currentUser = true
    }})

}])

//


myApp.controller('RegisterController', ['$scope', '$http', 'Authentication', function ($scope, $http, Authentication) {

  $scope.register = function () {
    if ( $scope.user.email !== '' && $scope.user.password !== '') {
      Authentication.register($scope.user)
    } else {
      $scope.message = 'Invalid registration information.'
    }
  }
}])
myApp.controller('AppController', ["$scope", "$firebaseObject","$firebaseArray","$ionicModal",
  function($scope, $firebaseObject,$firebaseArray,$ionicModal) {
    $ionicModal
      .fromTemplateUrl('templates/modal.html', {
      scope: $scope
    })
      .then(function(modal) {
      $scope.modal = modal;
    });
    $scope.openModal = function(key) {
      $scope.selectedKey = key;
      $scope.modal.show();
    }

    var ref = firebase.database().ref();

    var obj = $firebaseObject(ref);
    ref.child("questions/newquestion").set({ newquestion: "" });

    // to take an action after the data loads, use the $loaded() promise
    obj.$loaded().then(function() {
      // console.log("loaded record:", obj.$id, obj.someOtherKeyInData);

      // To iterate the key/value pairs of the object, use angular.forEach()
      angular.forEach(obj, function(value, key) {
        // console.log(key, value);
      });
    });

    // To make the data available in the DOM, assign it to $scope
    $scope.data = obj;
    obj.$bindTo($scope, "data");







    $scope.addQuestionnaire = function () {
      var questions = $firebaseArray(ref.child("questions/questions"));
      questions.$add(
        {
          category:$scope.data.category.selectedcategory,
          question:$scope.data.questions.newquestion.newquestion
      })
      .then(function() {
          console.log("succ")
        });}
    $scope.deleteQuestionnaire = function (key, item) {
      // Delete from questionnaire list
      var questions = $firebaseObject(ref.child("questions/questions/"+key));
      // Delete from users list
      questions.$remove()
    }
  }
]);


myApp.controller('QuestionnairesController', ['$scope', '$rootScope', '$state', '$firebaseAuth', '$firebaseObject', '$firebaseArray', 'FIREBASE_URL','$location', function ($scope, $rootScope, $state, $firebaseAuth, $firebaseObject, $firebaseArray, FIREBASE_URL,$location) {

    var ref = firebase.database().ref();

    var obj = $firebaseObject(ref);

    // to take an action after the data loads, use the $loaded() promise
    obj.$loaded().then(function() {
      // console.log("loaded record:", obj.$id, obj.someOtherKeyInData);

      // To iterate the key/value pairs of the object, use angular.forEach()
      angular.forEach(obj, function(value, key) {
        // console.log(key, value);
      });
    });

    // To make the data available in the DOM, assign it to $scope
    $scope.data = obj;

    // For three-way data bindings, bind it to the scope instead
    obj.$bindTo($scope, "data");


  $scope.interpretation = {};

  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      console.log(user);
      $scope.uid= user.uid;
      $scope.email= user.email;
    }
  });

  $scope.addAnswers = function () {
    var answers = $firebaseArray(ref.child("answers/answer"));

    answers.$add(
      {
        answer: $scope.interpretation,
        user: $scope.uid,
        email: $scope.email

      })
      .then(function () {
        console.log("succ")
          $location.path('/tab/home')

      });

  }

  }])
