/**
 * Chat module
 * @module features/chat
 */

'use strict';

var pubSub = require('pubsub-js');

var stateMap = {
  chatHTML: null,
  chateeHTML: null,
  chateeNameHTML: null,
  chateeAvatarHTML: null,
  msgsHTML: null,
  sendFormHTML: null
};

///////////////////////
// PRIVATE FUNCTIONS //
///////////////////////

/**
 * Appends the new msg to the chat
 * @param  {string} personName Msg sender's name
 * @param  {string} text Content of the msg
 * @param  {Boolean} isUser Is msg sent by user
 */
var _writeChat = function(personName, text, isUser) {
  var msgClass = isUser? 'msg--sent' : 'msg--received';
  var msgHTML = document.createElement('li');
  var lastMsgWrapper = stateMap.msgsHTML.lastElementChild; // in sequence msgs are wrapped (see HTML)

  msgHTML.textContent = text;

  /*
   * Group in sequence msgs to the same 'ul' list if the sender is always the
   * same.
   */
  if(lastMsgWrapper.classList.contains(msgClass)) {
    lastMsgWrapper.appendChild(msgHTML);
  } else {
    var newMsgWrapper = document.createElement('ul');

    newMsgWrapper.classList.add('msg');
    newMsgWrapper.classList.add(msgClass);
    newMsgWrapper.appendChild(msgHTML);
    stateMap.msgsHTML.appendChild(newMsgWrapper);
  }

};

/**
 * Appends system alert msg to the chat
 * @param  {string} alertText Alert text
 */
var _writeAlert = function(alertText) {
  var newMsgWrapper = document.createElement('ul');
  var msgHTML = document.createElement('li');

  msgHTML.textContent = alertText;

  newMsgWrapper.classList.add('msg');
  newMsgWrapper.classList.add('msg--alert');
  newMsgWrapper.appendChild(msgHTML);
  stateMap.msgsHTML.appendChild(newMsgWrapper);

};

/**
 * Empty the chat log
 */
var _clearChat = function() {
  while(stateMap.msgsHTML.lastChild) {
    //Performs better than .innerHTML = ''. @see {@link http://stackoverflow.com/a/3955238}
    stateMap.msgsHTML.removeChild(stateMap.msgsHTML.lastChild);
  }
};

///////////////////////
// EVENT SUBSCRIBERS //
///////////////////////

/**
 * Subscriber for 'setChatee' event. Selects the new chatee on the list.
 * @param  {string} msg Event name/Topic
 * @param  {object} argMap Object map with old and new chatee
 */
var _onSetChatee = function(event, argMap) {
  var oldChatee = argMap.oldChatee;
  var newChatee = argMap.newChatee;

  if(!newChatee) {
    if(oldChatee) {
      _writeAlert( oldChatee.name + ' has left the chat.' );
    } else {
      _writeAlert('Your friend has left the chat');
    }

    return true;
  }

  _writeAlert('Now chatting with ' + newChatee.name);
  stateMap.chateeNameHTML.textContent = newChatee.name;
  stateMap.chateeAvatarHTML.setAttribute('src', newChatee.avatar);

  return true;
};

/**
 * Subscriber for 'updateChat' event. Updates the chat log with the new msg.
 * @param  {string} msg Event name/Topic
 * @param  {object} msg Object map with old and new chatee
 * @example msg = {
 *   destId: msg.destId,
 *   destName: msg.destName,
 *   msgText: msg.msgText,
 *   isSenderUser: isSenderUser,
 *   sender: sender
 * }
 */
var _onUpdateChat = function(event, msg) {
  if( !msg.sender ) {
    _writeAlert(msg.msgText);
    return false;
  }

  _writeChat(msg.sender.name, msg.msgText, msg.isSenderUser);

  return true;
};

/**
 * Subscriber for 'updateChat' event. Empties the chat.
 */
var _onLogout = function() {
  stateMap.chateeNameHTML.textContent = 'Nobody';
  _clearChat();
};

//////////////////////
// PUBLIC FUNCTIONS //
//////////////////////

/**
 * Binds the DOM event to controller event listener
 * @param  {string} eventName Name of the event
 * @param  {function} eventHandler Event listener
 * @return {boolean}
 */
var bind = function(eventName, eventHandler) {
  if(eventName === 'submitMsg') {
    stateMap.sendFormHTML.addEventListener('submit', function(event) {
      event.preventDefault();
      var msgText = this.getElementsByClassName('box__input')[0].value;

      if(msgText.trim() === '') {
        return false;
      }
      eventHandler(msgText);

      return true;
    });
  }
};

var init = function() {
  stateMap.chatHTML = document.qs('.chat');
  stateMap.chateeHTML = stateMap.chatHTML.getElementsByClassName('chatee')[0];
  stateMap.chateeNameHTML = stateMap.chateeHTML.getElementsByClassName('chatee__name')[0];
  stateMap.chateeAvatarHTML = stateMap.chateeHTML.getElementsByClassName('chatee__avatar')[0];
  stateMap.msgsHTML = stateMap.chatHTML.qs('.chat .msgs');
  stateMap.sendFormHTML = stateMap.msgsHTML.nextElementSibling;

  pubSub.subscribe('setChatee', _onSetChatee);
  pubSub.subscribe('updateChat', _onUpdateChat);
  pubSub.subscribe('logout', _onLogout);
};

module.exports = {
  /** Bind view DOM events to controller event handlers */
  bind: bind,
  /** Init the chat module */
  init: init
};
