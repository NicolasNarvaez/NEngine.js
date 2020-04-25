/**
@namespace Media
@memberof NEngine
@desc All exclusively related to audio-video stuff, retrieving them from
external services, of processing them in any way. It currently uses
MediaElement.js, and an integration of Tonejs is close.
*/
_module.Media = (function() {
  var module

  /**
  @class AudioAnalyser
  @memberof NEngine.Media
  @desc Wrapper for Web Audio API AnalyserNode, adds some basic processing to
  normalize and clean the raw data of an analyser for easy visualization. To
  activate a processing filter on the update function, the processing type
  needs to be included in the instance "updates" array. Then you can access
  the results from corresponding entries in the "data" object .
  @prop {AudioContext} ctx - The Web Audio AudioContext
  @prop {AnalyserNode} node - The wrapped node

  @prop {String[]} updates - The list of processors to update on the "update"
    method. Each entry is maped to the update_"entry_name" method in
    AudioAnalyser.prototype and executed in the same order.
    <br/>Default value: ['raw','normalize', 'usable_log']
  @prop {Object} data - Holds results of processings on the node buffer
  @prop {UInt8Array} data.raw - Data extracted using

  @prop {Number[]} data.normalize - The "normalize" filter main results.
  @prop {Number} data.normalizeFrecUnit - The normalize filter dividing factor.
  @prop {Number} data.normalizeFrecPow - The normalize exponent.

  @prop {Number[]} data.usableLog - The update_usable_log results.
  @prop {Number} data.usableLogMean - The mean of all the usableLog values

  @param {Object} opts -
  @param {AudioContext} opts.ctx - The AudioContext
  @param {AnalyserNode} [opts.node] - The AnalyserNode to wrapp, defaults to a
    new one.
  @param {String[]} [updates=['raw','normalize', 'usable_log']] - The
    processors to execute on the update method
  */
  function AudioAnalyser(opts) {
    if( !(this instanceof AudioAnalyser) )
      return new AudioAnalyser(opts)

    opts = opts || {}
    this.ctx = opts.ctx
    this.node = opts.node || this.ctx.createAnalizer()

    this.updates = opts.updates || ['raw','normalize', 'usable_log']
    this.data = {
      raw: [],

      normalize: [],
      normalizeFrecUnit: opts.normalizeFrecUnit || 100,
      normalizeFrecPow: opts.normalizeFrecPow || 3,

      usableLog: [],
      usableLogMean: 0,
    }

    return this
  }
  AudioAnalyser.prototype = {
    /**
    @memberof NEngine.Media.AudioAnalyser.prototype
    @method update
    @desc Executes the processors indicated int the "updates" array, which are
    by default, those names get mapped to update_"processor_name" and executed
    on the same order.
    */
    update: function update() {
      this.updates.forEach(function(e){
        this['update_'+e]()
      })
    },
    /**
    @memberof NEngine.Media.AudioAnalyser.prototype
    @method update_raw
    @desc Extracts the data from the analyser node using
      node.getByteFrecuencyData(node.frecuencyBinCount)
    */
    update_raw: function update_raw() {
      if(!this.node) {
        this.data.raw = []
        return
      }
      var array = this.data.raw =
        new UInt8Array(this.node.frecuencyBinCount)
      this.node.getByteFrecuencyData(array)
    },
    /**
    @memberof NEngine.Media.AudioAnalyser.prototype
    @method update_normalize
    @desc Executes a simple "normalize" filter. <br/>
      final_value = (start_value/dividing_factor)^(exponent)
    */
    update_normalize: function update_normalize() {
      var normalize = this.data.normalize = [],
        raw = this.data.raw,
        frecUnit = this.data.normalizeFrecUnit,
        frecPow = this.data.normalizeFrecPow,
        i = 0,
        l = (this.data.usableLogMean)? this.data.usableLogMean : raw.length

      for(; i < l; i++)
        normalize.push( Math.pow( raw[i]/frecUnit, frecPow) )
    },
    /**
    @memberof NEngine.Media.AudioAnalyser.prototype
    @method update_usable_log
    @desc Executes a "reducer" filter <br />
      The last entry indicates the index of last
      not null value in the raw array, each time it gets executed the processor
      adds a new value up to a maximum, where it starts deleting the oldest
      entry
    */
    update_usable_log: function update_usable_log() {
      var raw = this.data.raw,
        usableLog = this.data.usableLog,
        i = 0, j, l, r

      //get usable values of the buffer (r = raw.length - i)
      for(j = 0, l = raw.length; j < l; j++) {
        i++

        if (raw[j] !== 0) i = 0
      }
      r = raw.length - i;
      if(r !== 0)
      usableLog.push(r)

      //watch out array length
      if(usableLog.length > 40)
        usableLog.shift()

      //calculate usableLogMean
      for(i = 0, j = 0, l = usableLog.length; j < l; j++)
        i += usableLog[j]
      this.data.usableLogMean = i/usableLog.length;
    },
  }

  module = {
    audioGraph: null,
    AudioAnalyser: AudioAnalyser,
    AudioSourceSoundcloud: AudioSourceSoundcloud,
  }

  //only if Soundcloud API detected
  try {
    if(SC) {}
    var SC_initialized = false

    function SCInitialize(args) {
      if(SC_initialized) return false
      SC_initialized = true
      return SC.initialize(args)
    }

    /**
    @class AudioSourceSoundcloud
    @memberof NEngine.Media
    @desc A Web Audio AudioNode wrapper for easy setting up a soundcloud
    connection inside an Audio element and loading a url. Requires the
    Soundcloud API to be loaded.

    @prop {String} cient_id - The Soundcloud app client_id, get one from the
    <a src='https://developers.soundcloud.com/docs/api/guide'>
    Soundcloud API docs</a>
    @prop {AudioContext} ctx - Web Audio AudioContext
    @prop {Audio} tag - The Audio element used to generate the AudioNode using
      createMediaElementSource and handle the soundcloud connection/decoding.
    @prop {AudioNode} node - Use this in connect calls
    @prop {String} stream_url - Contains the strem url to use in the audio tag
    @prop {Object} sound_obj - The object Soundcloud returns when asked to
      resolve a url.

    @param {Object} opts -
    @param {String} opts.client_id -
    @param {AudioContext} opts.ctx -
    */
    function AudioSourceSoundcloud(opts) {
      if(!(this instanceof AudioSourceSoundcloud))
        return new AudioSourceSoundcloud(opts)

      this.ctx = opts.ctx
      this.tag = new Audio()
      this.tag.crossOrigin = 'anonymous'
      this.node = this.ctx.createMediaElementSource(this.tag)

      this.client_id = opts.client_id

      this.stream_url = null
      this.sound_obj = null

      SCInitialize({client_id: this.client_id})
      return this
    }
    AudioSourceSoundcloud.prototype = {
      /**
      @memberof NEngine.Media.AudioSourceSoundcloud.prototype
      @method
      @desc Resolves the url using Soundcloud API and calls loadURLSucc or
        loadURLErr depending on the result, after setting the sound_obj and
        stream_url of this, you can redefine the callbacks by your instace.
      @param {String} url
      */
      loadURL: function loadURL(url) {

        SC.get('/resolve', {url: url}, function(sound_obj) {
          this.sound_obj = sound_obj
          if(sound_obj.errors) this.loadURLErr(sound_obj)
          else {
            this.stream_url = sound_obj.stream_url + '?client_id='+this.client_id
            this.loadURLSucc(sound_obj)
          }
        })
      },
      /**
      @memberof NEngine.Media.AudioSourceSoundcloud.prototype
      @method
      @desc Called when the url gets resolved correctly. By default calls
        this.play().
      @param {Object} sound_obj - The resolved meta-data
      */
      loadURLSucc: function loadURLSucc(soundObj) {
        this.play()
      },
      /**
      @memberof NEngine.Media.AudioSourceSoundcloud.prototype
      @method
      @param {Object} sound_obj - The resolved meta-data, sound_obj.error
        contains error data
      */
      loadURLErr: function loadURLErr(soundObj) {
        console.warn('Error loading URL', soundObj)
      },
      /**
      @memberof NEngine.Media.AudioSourceSoundcloud.prototype
      @method
      @desc Sets the stream_url on the audio element and starts it on load.
        Call it after the url gets resolved, attaching a callback on
        loadURLSucc.
      */
      play: function play() {
        var self = this
        if(this.tag.src != this.stream_url) {
          this.tag.src = this.stream_url
        }
        if(this.tag.readyState > 2) {
          this.tag.play()
        }
        else if(this.tag.error)
          console.warn('Error loading Soundcloud URL', this.tag.error)
        else {
          setTimeout(function(){self.play()}, 500)
        }
      }
    }

    module.AudioSourceSoundcloud = AudioSourceSoundcloud
  }
  catch(e) {
    console.warn('SC related code not loaded, check SC api is loaded\n', e)
  }

  //"MediaElement only" section
  try {
    if(MediaElement) {}

    module.MediaElement = (function() {
      return {
      }
    })()
  }
  catch(e) {
    console.warn('MediaElement related code not loaded, check'+
      ' MediaElement api is loaded\n', e)
  }

  return module
})()
