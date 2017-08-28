/*
The MIT License (MIT)

Copyright (c) 2015 Nicolás Narváez

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
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

  @prop {Object} data - Holds results of processings on the node buffer
  @prop {UInt8Array} data.raw - Data extracted using

  @prop {Number[]} data.normalize - The "normalize" filter main results.
  @prop {Number} data.normalizeFrecUnit - The normalize filter dividing factor.
  @prop {Number} data.normalizeFrecPow - The normalize exponent.

  @prop {Number[]} data.usableLog - The update_usable_log results.
  @prop {Number} data.usableLogMean - The mean of all the usableLog values
  */
  function AudioAnalyser(opts) {
    if( !(this instanceof AudioAnalyser) )
      return new AudioAnalyser(opts)

    opts = opts || {}
    this.ctx = opts.ctx
    this.node = opts.node || this.ctx.createAnalizer()

    this.data = {
      raw: [],

      normalize: [],
      normalizeFrecUnit: opts.normalizeFrecUnit || 100,
      normalizeFrecPow: opts.normalizeFrecPow || 3,

      usableLog: [],
      usableLogMean: 0,
    }
    this.updates = opts.updates || ['raw','normalize', 'usable_log']

    return this
  }
  AudioAnalyser.prototype = {
    /**
    @memberof NEngine.Media.AudioAnalyser
    @method update
    @desc Executes the processors indicated int he "updates" array
    */
    update: function update() {
      this.updates.forEach(function(e){
        this['update_'+e]()
      })
    },
    /**
    @memberof NEngine.Media.AudioAnalyser
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
    @memberof NEngine.Media.AudioAnalyser
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
    @memberof NEngine.Media.AudioAnalyser
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
