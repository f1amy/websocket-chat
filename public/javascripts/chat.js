function oneTimeEvent(node, type, callback) {
  node.addEventListener(type, function(e) {
    e.target.removeEventListener(e.type, arguments.callee);
    return callback(e);
  });
}

document.addEventListener('DOMContentLoaded', event => {
  var socket = new WebSocket(`ws://${window.location.host}/chat/ws`);

  socket.addEventListener('open', function(event) {
    console.log('WebSocket connection opened successfully');
  });

  socket.addEventListener('message', function(event) {
    console.log('Message from server: ', event.data);
    let response = JSON.parse(event.data);

    if (response.response === 'initChannel') {
      for (const message of response.messages) {
        let messageNode = document.createElement('div');
        messageNode.classList.add('form-row', 'py-2');

        let b = document.createElement('b');
        b.classList.add('col-auto');
        b.innerText = message.user_name;
        messageNode.appendChild(b);

        let span = document.createElement('span');
        span.classList.add('col');
        span.innerText = message.message;
        messageNode.appendChild(span);

        document
          .querySelector(`[data-channel-name="${message.channel_name}"]`)
          .appendChild(messageNode);
      }

      var objDiv = document.getElementById("channel-row");
      objDiv.scrollTop = objDiv.scrollHeight;
    }

    if (response.response === 'acceptMessage') {
      let messageNode = document.createElement('div');
      messageNode.classList.add('form-row', 'py-2');

      let b = document.createElement('b');
      b.classList.add('col-auto');
      b.innerText = response.user_name;
      messageNode.appendChild(b);

      let span = document.createElement('span');
      span.classList.add('col');
      span.innerText = response.message;
      messageNode.appendChild(span);

      document
        .querySelector(`[data-channel-name="${response.channel_name}"]`)
        .appendChild(messageNode);

      var objDiv = document.getElementById('channel-row');
      objDiv.scrollTop = objDiv.scrollHeight;
    }
  });

  socket.addEventListener('close', function(event) {
    console.log('WebSocket connection closed successfully');
  });

  socket.addEventListener('error', function(event) {
    console.log('WebSocket error: ', event);
  });

  document
    .querySelector('#message-form [type="submit"]')
    .addEventListener('click', function(event) {
      event.preventDefault();

      let channelName = document
        .querySelector('.tab-pane.active.show')
        .getAttribute('data-channel-name');

      let message = document.querySelector('#message-form [type="text"]').value;

      if (message === '') {
        return;
      }

      let request = {
        request: 'sendMessage',
        channelName: channelName,
        userName: 'flamy',
        message: message
      };

      socket.send(JSON.stringify(request));

      document.querySelector('#message-form [type="text"]').value = '';
    });

  fetch('/api/channels')
    .then(response => response.json())
    .then(channels => {
      console.log(channels);
      let channelsList = document.querySelector('#channels-list');
      let channelContent = document.querySelector('#channel-content');

      for (let i = 0; i < channels.length; i++) {
        let channelContentNode = document.createElement('div');

        channelContentNode.id = `channel-content-${i + 1}`;
        channelContentNode.classList.add('tab-pane', 'fade');
        channelContentNode.setAttribute('data-channel-name', channels[i].name);
        channelContentNode.setAttribute('role', 'tabpanel');
        channelContent.appendChild(channelContentNode);

        let channelNode = document.createElement('a');

        channelNode.href = `#channel-content-${i + 1}`;
        channelNode.classList.add('nav-link');
        channelNode.innerText = `#${channels[i].name}`;
        channelNode.setAttribute('data-toggle', 'pill');
        channelNode.setAttribute('role', 'tab');
        channelNode.setAttribute('aria-selected', 'false');
        channelsList.appendChild(channelNode);

        channelNode.addEventListener('click', event => {
          console.log('scroll to bottom');
          var objDiv = document.getElementById("channel-row");
          objDiv.scrollTop = objDiv.scrollHeight;
        });

        oneTimeEvent(channelNode, 'click', event => {
          let request = {
            request: 'initChannel',
            channelName: channels[i].name
          };

          socket.send(JSON.stringify(request));
        });
      }
    });
});
