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

*/
Engine = (function() {

  function Engine(type) {

    this.frames = {};

    this.outputs;
    this.spaceHierarchy;

    this.world;
  }

  Engine.prototype = {
    /**
    * opts {
    * repeat = true, framename = main
    * }
    */
    loop: function loop(opts) {

    },
    configure: function configure(opts) {

    }
  }

  return Engine;
})()

/**
* A frame is the minimal unit of execution managed by the engine
* It is a arbitrary functions that gets executed according to its
* configuration, this can include change its behaviour in response
* to the execution of other frames
*
* They disseminate the td parameter they recieve when executed into
* any other frame executed from it
*
* They can automatically loop, on 3 ways:
*   custom function, a requestAnimationFrame (temporary), and a normal timeout
*
* They can be linked to other frames to adapt to them
* the types of link are:
*   ends: this frame will trigger the execution of the next, next being
*           frames which relate throught this relation, and those frames that
*           will be executed after this, are counted like being parts of
*           this, "endings"
*   requires: the frames here have to be executed at least one time in
*           between two executions of this frame
*   already: the frames here have to be executed this same execution frame
*           before the execution of this frame (like requires with
*           small time constrain)
*
*/
Frame = (function(){

  var requestAnimationFrame,
    cancelAnimationFrame,
    frame_already_threshold;

  requestAnimationFrame = global_root.requestAnimationFrame;
  cancelAnimationFrame =  global_root.cancelAnimationFrame;
  frame_already_threshold = 20;

  function Frame(opts) {
    if(!opts) opts = {};

    this.td = opts.td || ((opts.times)? 1000/opts.times : 20);
    this.tl = null;
    this.tn = null;
    this.repeat = opts.repeat || false;
    this.repeat_type = opts.repeat_type || 'timeout';
    this.repeatID = null;

    this.f = opts.f || null;

    this.links = {
      starts: [],
      ends: [],
      requires: [],
      already: [],
    }

    //setup links object
    var i, l, link;
    for(link in opts.link)
      this.links[link] = opts[link]
    //double link before links
    for(i=0, l = this.links.starts.length; i<l ;i++)
      this.links.starts[i].ends.push(this);

  }

  Frame.prototype = {
    cancelRepeat: function Frame_cancelRepeat() {
      if(!this.repeatID) return;

      if(this.repeat_type == 'timeout')
        clearTimeout(this.repeatID);
      if(this.repeat_type == 'animframe')
        cancelAnimationFrame(this.repeatID);

      if(this.repeat instanceof Function)
        this.repeat.cancel.call(this);

      this.repeatID = null;
    },
    /**
    * td: temporal delay
    *   if not given, calculated has current time - last time executed
    */
    execute: function Frame_execute(td) {
      var root, i, l, tnow = Date.now();
      if(this.repeatID) { this.cancelRepeat(); this.tn = Date.now(); }
      if(!this.tl)
        this.tl = Date.now();
      if(!td)
        td = tnow - this.tl;


      /**
        start cycle
      */
      for(i=0, l = this.links.requires.length; i<l; i++)
        if(this.links.requires[i].tl < this.tl)
          this.links.requires[i].execute();

      for(i=0, l = this.links.already.length; i<l; i++)
        if(tnow - this.links.already[i].tl > frame_already_threshold )
          this.links.already[i].execute();

      //execute the ones this is before
      for(i=0, l = this.links.ends.length; i < l; i++)
        this.links.ends[i].execute();

      //cycle finished
      this.tl = Date.now();

      if(this.repeat) {
        if(this.repeat instanceof Function) {
            this.repeat();
        }

        else {
          root = this;

          if(this.repeat_type == 'timeout') {
            this.repeatID = setTimeout(function(){root.repeatID = null; root.execute();}, this.dt)
            this.tn = this.tl + td;
          }
          if(this.repeat_type == 'animframe') {
            this.repeatID = requestAnimationFrame(function(){root.repeatID = null; root.execute();});
            this.tn = undefined;
          }
        }
      }

    }
  }

  return Frame;
})()
