_module.media = (function() {
  var module

  module = {
    audioGraph: null
  }


  if(MediaElement) {
    module.MediaElement = (function() {

      var outNode

      function loadSoundcloud() {
        // var me = new MediaElement()
        
      }
      return {
        loadSoundcloud: loadSoundcloud,
      }

    })()
  }

  return module
})()
