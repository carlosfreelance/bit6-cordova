/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

//so far just keeping chatter's name. This may require changing to uri (usr:someUser)
var currentChatUri = "";

var app = {
    // Application Constructor


    //cordova plugins add ~/Source/Telerik/Plugins/Bit6/Plugin/ --variable API_KEY=308x-3bnqo

    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('messageReceived', this.onMessageReceived, false);
    },

    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        //alert("Device READY");

        initButtonListeners();

        bit6.isConnected(
            function(response){
                console.log(response);
                if (response.connected)
                 onLoginDone();
            },
            function(error){
              alert("Error on isConnected api call");
            });
    },
    onMessageReceived : function(e){
          populateConversationWindow(e.messages);
       }
    };

    function updateCurrentChat() {
      bit6.getConversationByUri(currentChatUri,
        function(conversation){
          populateConversationWindow(conversation.messages);
        },
        function(error){
          alert("Error on getConversationByUri api call");
        });
    }

function populateConversationWindow(messages) {
  for(var index = 0; index < messages.length;index++){
    var div = $("<div/>");
    var displayName = messages[index].other.displayName;
    if (!messages[index].incoming){
      displayName = "Me";
    }

    div.append("<h3>" + displayName + "</h3>");
    div.append("<p>" + messages[index].content + "</p>");
    $("#incoming").append($(div).html());
  }
}

function onLoginDone() {
  switchToChatListScreen();
  bit6.conversations(
    function(data){
      var listToDisplay = "Convsersatioins: \n ";
      for (var i = 0; i < data.conversations.length; ++i) {
        console.log(data.conversations[i].displayName);
        listToDisplay = listToDisplay.concat(data.conversations[i].displayName).concat("\n");
        populateChatList(data.conversations);
      }
    },
    function(error){
      alert("Error on getting conv" + error);
    });
}

function initButtonListeners() {
  $("#signup").click(function(){
            bit6.register($("#username").val(), $("#password").val(), function(success){
                alert("Success:" + JSON.stringify(success));
            }
            , function(error){
              alert("Error:" + JSON.stringify(error));
            });
        });

        $("#login").click(function(){
           bit6.logout();

           bit6.login($("#username").val(), $("#password").val(), function(success){
               console.log(JSON.stringify(success));
               switchToChatListScreen();
           }, function(error){
             alert("Error: " + JSON.stringify(error));
           });
        });

        $("#voiceCall").click(function(){
           var opts = { video : false};
           //FIXME: get current username
           bit6.startCall(currentChatUri, opts, function(success){
               console.log(JSON.stringify(success));
           }, function(error){
             alert("Error on call" + JSON.stringify(error));
           });
        });

        $("#videoCall").click(function(){
           var opts = { video : true};
           //FIXME: get current username
           bit6.startCall(currentChatUri, opts, function(success){
               console.log(JSON.stringify(success));
           }, function(error){
             alert("Error on call" + JSON.stringify(error));
           });
        });

       //TODO: Use conversations api in proper way. This is just for testing
        $("#getConv").click(function() {
            bit6.conversations(
            function(data){
                var listToDisplay = "Convsersatioins: \n ";
                for (var i = 0; i < data.conversations.length; ++i) {
                  console.log(data.conversations[i].displayName);
                  listToDisplay = listToDisplay.concat(data.conversations[i].displayName).concat("\n");
                }
                console.log(data);
                alert(listToDisplay);
            },
            function(error){
              alert("Error on getting conv" + error);
            });
        });

        $("#sendMessage").click(function(){
            console.log("sending message to ", currentChatUri);
            bit6.sendPushMessage($("#message").val(), currentChatUri, function(success){
              console.log(JSON.stringify(success));
            }, function(error){
              alert(JSON.stringify(error));
            });
        });
}

function populateChatList(conversations) {
    var chatList = $('#chatListScreen').html('');
    for(var i=0; i < conversations.length; i++) {
        var c = conversations[i];
        if (!currentChatUri) {
            currentChatUri = c.uri;
        }

        var stamp = '';
        var latestText = 'latestText example';

        // Find the latest message in the conversation
        if (c.messages && c.messages.length > 0) {
            console.log(c.content);
            var latestMsg = c.messages[c.messages.length-1];
            var d = new Date(latestMsg.updated);
            var stamp = d.toLocaleDateString() + ' ' + d.toLocaleTimeString();

            // Show the text from the latest conversation
            if (latestMsg.content)
              latestText = latestMsg.content;
        }
        chatList.append(
            $('<div />')
                .append($('<strong>' + c.title + '</strong>'))
                .append($('<span>' + latestText + '</span>'))
                .append($('<em>' + stamp + '</em>'))
                .on('click', {'name': c.title}, function(e) {
                    onChatSelected(e.data.name);
                })
        );
    }
}

function onChatSelected(name) {
  switchToChatScreen();
  $("#chatter")[0].innerHTML = name;
  currentChatUri = name;
  updateCurrentChat();
}

function switchToChatScreen() {
  $("#loginScreen")[0].style.display = "none";
  $("#chatScreen")[0].style.display = "block";
  $("#chatListScreen")[0].style.display = "none";
}

function switchToChatListScreen() {
  $("#loginScreen")[0].style.display = "none";
  $("#chatScreen")[0].style.display = "none";
  $("#chatListScreen")[0].style.display = "block";
}