/**
 * Shell module
 * @module shell
 */

'use strict';

var helpers = require('./helpers');
var model = require('./model');
// var page = require('page');
var pubSub = require('pubsub-js');

/* Features */
var peopleList = require('./features/people-list');
var account = require('./features/account');

var configMap = {

};
var stateMap = {
  account: null
};
var isTesting = false;

var _testing = function() {
  pubSub.subscribe('login', function(msg, data) {
    console.log(msg + ': ');
    console.log(data);
  });
  pubSub.subscribe('logout', function(msg, data) {
    console.log(msg + ': ');
    console.log(data);
  });
};

/**
 * FEATURES EVENTS SUBSCRIBERS
 */


/* ACCOUNT */

var _onSignClick = function() {
  var userName;
  var currentUser = model.people.getCurrentUser();

  if(currentUser.getIsAnon()) {
    userName = prompt('Please sign-in');
    model.people.login(userName);
    this.textContent = '... Processing ...';
  } else {
    model.people.logout();
  }

  return false;
};

var _onAccountLogin = function(msg, currentUser) {
  stateMap.account
    .getElementsByClassName('sign')[0]
    .textContent = currentUser.name;
};

var _onAccountLogout = function() {
  stateMap.account
    .getElementsByClassName('sign')[0]
    .textContent = 'Please sign-in';
};

/**
 * PUBLIC FUNCTIONS
 */

var configModule = function(inputMap) {
  helpers.configMap(inputMap, configMap);
};

var init = function() {
  if(isTesting) {
    _testing();
  }

  //people-list
  peopleList.init();

  //Account
  stateMap.account = document.getElementsByClassName('account')[0];
  account.init(stateMap.account);
  account.bind('onSignClick', _onSignClick);
  pubSub.subscribe('login', _onAccountLogin);
  pubSub.subscribe('logout', _onAccountLogout);
};

module.exports = {
  /** configures the module configMap */
  configModule: configModule,
  /** init shell module */
  init: init
};
