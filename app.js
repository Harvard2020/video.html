(function(global) {

  // Compatibility
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;

  var peerClient;
  var currentPeerConnection;
  var localMediaStream;

  $(function() {

    var $myselfId = $('#js-myself-id');
    var $peerId = $('#js-peer-id');
    var $partnerId = $('#js-partner-id');
    var $open = $('#js-open');
    var $connect = $('#js-connect');
    var videoMyself = document.querySelector('#js-video-myself');
    var videoPartner = document.querySelector('#js-video-partner');

    navigator.getUserMedia({video: true, audio: true}, function(stream) {
      videoMyself.src = URL.createObjectURL(stream);
      videoMyself.play();
      localMediaStream = stream;
    });
    
    $open.on('click', function(e) {
      // create peer object
      var myselfId = $myselfId.val();
      peerClient = new Peer(myselfId, {
        key: '0c3244yhqia4i'
      });

      // if peer connection is opened
      peerClient.on('open', function() {
        $peerId.html(peerClient.id);
      });
      
      peerClient.on('call', function(call) {
        // answer with my media stream
        call.answer(localMediaStream);
        
        // close current connection if exists
        if (currentPeerConnection) {
          currentPeerConnection.close();
        }
        
        // keep call as currentPeerConnection
        currentPeerConnection = call;
        
        // wait for partner's stream
        call.on('stream', function(stream) {
          videoPartner.src = URL.createObjectURL(stream);
          videoPartner.play();
        });
        
        // if connection is closed
        call.on('close', function() {
          console.log('Connection is closed.');
        });
      });
      
      // disable id input
      $myselfId.attr('disabled', 'disabled');
      
      // enable partner id input
      $partnerId.removeAttr('disabled');
      
      // enable connect button
      $connect.removeAttr('disabled');
    });

    $connect.on('click', function(e) {
      // if peerClient is not initialized
      if (!peerClient) {
        return;
      }
      
      // connect to partner
      var partnerId = $partnerId.val();
      var call = peerClient.call(partnerId, localMediaStream);

      // close current connection if exists
      if (currentPeerConnection) {
        currentPeerConnection.close();
      }

      // keep call as currentPeerConnection
      currentPeerConnection = call;

      // wait for partner's stream
      call.on('stream', function(stream) {
        videoPartner.src = URL.createObjectURL(stream);
        videoPartner.play();
      });

      // if connection is closed
      call.on('close', function() {
        console.log('Connection is closed.');
      });
    });
  });

})(this);
