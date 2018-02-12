$.widget('ibm.chatwidget', {

    // Default options
    options: {
        name: 'Sofía',
        avatarImage: 'http://via.placeholder.com/50x50', // Image URL
        closeImage: 'src/img/equis50px.png',
        headerImage : 'src/img/wong-ico-logo.png',
        buttonImage : 'src/img/wong-ico-btn.png',
        sendImage : 'src/img/wong-ico-user.png'
    },

    _create: function() {
        // Define DOM elements
        this._avatar = $('<img class="chat-widget-avatar" src="' + this.options.avatarImage + '">');
        this._messageAvatar = $('<img class="chat-widget-avatar-message" src="' + this.options.avatarImage + '">')
        this._messageContainer = $('<div class="chat_widget-message-container"></div>')
        this._panel = $('<div class="chat-widget-panel"></div>');
        this._header = $('<div class="chat-widget-header"></div>');
        this._messageLog = $('<div class="chat-widget-message-log"></div>');
        this._messageDock = $('<div class="chat-widget-message-dock"></div>');

        this._assistantStatus = $('<div class="chat-widget-assistant-status"><img src="src/img/robot.png"><span class="chat-widget-assistant-name">' + this.options.name +  '</span></div><br><div class="chat-widget-assistant-status"></div>');
        this._headerButtons = $('<div class="chat-widget-header-buttons"><span class="close-button">&times;</span></div>');
        //this._headerButtons = $('<i  class="chat-widget-header-buttons close-button" style="cursor: pointer;font-size:12px;"><div><svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/><path d="M0 0h24v24H0z" fill="none"/></svg></div></i>');
        this._messageInput = $('<textarea rows="3" data-min-rows="3" class="autoExpand chat-widget-message-input" placeholder="Escribe un mensaje..." autocomplete="off"></textarea>');
        this._messageSubmitButton = $('<button type="submit" value="Enviar">Enviar</button>');
        /*<img height="25px" width="25px"  src="' + this.options.buttonImage + '">*/
        // Build DOM
        this._header.append(this._assistantStatus, this._headerButtons);
        this._messageDock.append(this._messageInput, this._messageSubmitButton);
        this._panel.append(this._header, this._messageLog, this._messageDock);
        this.element.append(this._panel, this._avatar);

        // Init
        this.element.addClass('chat-widget');
        this._panel.hide();
        this._is_active = false;

        // Events
        this._on(this.element, {
            'click .chat-widget-avatar': function() {
                this._toggleChat();
            },
            'click .chat-widget-header-buttons .close-button': function() {
                this._hideChat();
            },
            'click button[type="submit"]': function() {
                this._submitMessage();
            },
            'keyup .chat-widget-message-input': function(e) {
                if (e.keyCode == 13) {
                    this._submitMessage();
                }
            }
        });

        this.element
            .one('focus.autoExpand', 'textarea.autoExpand', function() {
                var savedValue = this.value;
                this.value = '';
                this.baseScrollHeight = this.scrollHeight;
                this.value = savedValue;
            })
            .on('input.autoExpand', 'textarea.autoExpand', function() {
                var minRows = this.getAttribute('data-min-rows')|0, rows;
                this.rows = minRows;
                rows = Math.ceil((this.scrollHeioptionght - this.baseScrollHeight) / 17);
                this.rows = minRows + rows;
            });

        // Sockets
          // WEB SOCKET HERE  this._socket = new WebSocket('wss://[DOMAIN].mybluemix.net/ws/messages');

        var self = this;

        this._socket.onopen = function() {
            console.log('Connected');

            self._socket.send(JSON.stringify({
                type: 'message',
                message: 'hola'
            }));

            function keepAlive() {
                if (self._socket.readyState == self._socket.OPEN) {
                    self._socket.send(JSON.stringify({
                        type: 'command',
                        message: '/keepalive'
                    }));
                }
                setTimeout(keepAlive, 30000);
            }

            keepAlive();
        };

        this._socket.onmessage = function(event) {
            var data = JSON.parse(event.data);
            console.log(data);
            /*if(data.action.name.length){
              console.log("alo");
        }*/
            if (data.type == 'message') {
                self.receiveMessage(data.message);
            }
        };

        this._socket.onclose = function() {option
            console.log('Disconnected');
        };

        this._scrollToBottom();
    },

    _toggleChat: function() {
        if (this._is_active) {
            this._hideChat();
        }
        else {
            this._showChat();
        }
    },

    _showChat: function() {
        this._panel.show('fade', 200);
        this._is_active = true;
        this._avatar.attr('src', this.options.closeImage);
        this._avatar.addClass('close-button');
    },

    _hideChat: function() {
        var self = this;
        self._panel.hide('fade', 200, function() {
            self._is_active = false;
            self._avatar.removeClass('close-button');
            self._avatar.attr('src', self.options.avatarImage);
        });
    },

    _submitMessage: function() {
        var message = this.getInput();
        this.sendMessage(message);
        this.clearInput();
    },

    _shouldScroll: function() {
        return this._messageLog.scrollTop() + this._messageLog.prop('clientHeight') === this._messageLog.prop('scrollHeight');
    },

    _scrollToBottom: function() {
        this._messageLog.scrollTop(this._messageLog.prop('scrollHeight'));
    },

    getInput: function() {
        return this._messageInput.val().replace( /\r?\n/gi, '' );
    },

    clearInput: function() {
        this._messageInput.val('');
    },

  /*  sendMessage: function(message) {
        var data = {
            "type": 'message',
            "message": message
        };
        this._messageLog.append('<div class="chat-widget-message-container-received"><div class="circulo"><h4> Yo</h1></div><p class="chat-widget-message sent">' + message + '</p></div>');
        this._socket.send(JSON.stringify(data));
        if (!this._shouldScroll()) {
            this._scrollToBottom();
        }
    },

    receiveMessage: function(message) {
        this._messageLog.append('<div class="chat-widget-message-container"><img class="chat-widget-avatar-message" src="' + this.options.avatarImage + '" ><p class="chat-widget-message received">' + message + '</p></div>');
        if (!this._shouldScroll()) {
            this._scrollToBottom();
        }
    }*/

    sendMessage: function(message) {
        var data = {
            "type": 'message',
            "message": message
        };
        if(message != '')
        {
             this._messageLog.append('<span class="chat-widget-message-container-received"><p class="chat-widget-message sent">' + message + '</p></span>');
             this._socket.send(JSON.stringify(data));
             if (!this._shouldScroll()) {
                 this._scrollToBottom();
             }
       }

 },

    receiveMessage: function(message) {
        this._messageLog.append('<div class="chat-widget-message-container"><p class="chat-widget-message received">' + message + '</p></div>');
        if (!this._shouldScroll()) {
            this._scrollToBottom();
        }
    }

});
