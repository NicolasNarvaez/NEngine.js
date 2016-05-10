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

//has mouse events API, keyboard events API
//n n-dimensional cameras for complex projection
//extra hoisted camera for more complex n-dimensional projection
//    (aka: watch initial ND camera from other camera in World-space coords)
Camera = (function() {
  //options:
  //type,dim, stereo_mode and the options of those

  //
  function Camera(cfg) {
    var i, length;

    cfg = cfg || {};
    util.missing(cfg, Camera.defaults);

    this.cfg = cfg;

    //create cameras
    if(cfg.type === 'recursive') {
      //generate cameras from dim to 3D
      for(i=cfg.dim+1; --i>0;)
        this['camera'+i] = new SubSpace({
          dim: i
        })
      this.camera = this.camera['camera'+cfg.dim];
    }
    if(cfg.type === 'collapsed') {
      this.camera = new SubSpace({
        dim: cfg.dim,
      })
    }

    this.cameraObj = new SubSpace({
      dim: cfg.dim
    })

    this.updateProyection();
  }

  Camera.prototype = {
    updateProyection: function updateProyection(dim) {
      var cfg = this.cfg;
      if(cfg.type === 'recursive') {
        if(dim) {

        }
        else {

        }
      }
      if(cfg.type === 'collapsed') {

      }
    },
    //activates inputs for camera
    connectInput: function connectInput(input, settings) {
      if(input === 'all') {

      }
      if(!input) {

      }
    }
  };

  Camera.defaults = {
    dim: 4,
    type: 'collapsed',  //recursive || colapsed
    stereo_mode: 'splited',    //splited, polarized, alternation timer, etc.

    //camera specific
    camera: {
      //stereo
      stereo_separation: 5.616,
      stereo_distance: 10,

      //projection 1
      projection: 'perspective',
      projection_near: 1.0,
      projection_far: 1000.0,
      projection_perspective_angle: Math.PI/2,
    },

    ////// recursive!!
    //default for every sub-space camera
    camera_n: {
      projection: 'null',
    },
    projection_3: 'orthogonal',
    projection_3_near: -1.0, //used on  ortogonal
    projection_3_far: 1.0,
    projection_3_orthogonal_size: 300,

    camera_3: {
      disposition_3: 'superior',
    }
  }

  return Camera;
})();

//Has minimal abstract object information
//position, rotation, meta-data, geometry, material
Entity = (function() {

  function Entity(cfg){
    cfg = cfg || {};
    util.missing(cfg, Entity.defaults);

    if(!cfg.dim) throw "Entity creation, no dim parameter";

    SubSpace.call(this, cfg);
    //this.p = new NMath['vec'+cfg.dim].create();
    //this.r = new NMath['mat'+cfg.dim].createIdentity();

    if(cfg.p && cfg.p.length === options.dim)
      this.p = options.p;

    this.geometry = null;
    this.material = null;
    this.container = null;
  }

  Entity.defaults = {
    dim: 4,
  }

  Entity.prototype = {
    /**
    * requires that the entity has previously registered on a space node
    * sets a physic type, using a module object, module name, or module enum
    * checks whether the objects array in the entity container has the
    * needed object type array instantiated.
    */
    setType: function set(type, opts) {
      var container = this.container, objects;
      if(!container) return;

      //sanitizes type parameter
      if(type instanceof String || typeof type == 'string')
        type = NEngine.Physic.PhysicModules[type];
      else  if(type instanceof 'Number' || typeof type == 'number')
        type = NEngine.Physic.PhysicModulesEnum[type];

      //sanitize objects array in ent.container
      objects = container.objects[type.i];
      if(!objects)
        objects = container.objects[type.i] = Array();
      else if(objects.indexOf(this) != -1) return;

      //convert object and add to list
      type.convert.call(this, opts);
      objects.push(this);
    }
  }

  return Entity;
})();


obj = (function() {
  var camera,
    vec4=NMath.vec4,
    mat5=NMath.mat5,
    tmp_m_1 = mat5.create(),
    tmp_m_2 = mat5.create(),
    tmp_v_1 = vec4.create();

  camera = (function() {

    function walk(camera, vector, dt) {
      var m_rotation = mat4.create(),
        v_rotated = vec4.create();

      mat.fromVecs(m_rotation, [camera.rx, camera.ry, camera.rz, camera.rw]);
      mat4.multiplyVec(v_rotated, m_rotation, vector);
      vec4.scaleAndAdd(camera.p, camera.p, v_rotated, dt);
      //console.log(camera.p)
    };

    return {
      walk: walk
    };
  })();

  iterator = (function() {
    function iterator() {
      this.list = [];
      this.pases = [];
    }
    iterator.prototype = {
      pass: function(tmp_v1, tmp_v2, tmp_m1, tmp_m2) {
        var i, j;

        if(!this.list.length || !this.pases.length)
          return;

        for(i = this.pases.length; i--;)
          for(j = this.list.length; j--;)
            this.pases[i](this.list[j], tmp_v1, tmp_v2, tmp_m1, tmp_m2);
      },
      add: function(obj) {
        if(this.list.indexOf(obj) === -1)
          this.list.push(obj);
      },
      remove: function(obj) {
        var i = this.list.indexOf(obj);
        if( i !== -1)
          this.list.splice(i, 1);
      },
      add_pass: function(pass) {
        if(this.pases.indexOf(pass) === -1)
          this.pases.push(pass);
      },
      remove_pass: function(pass) {
        var i = this.pases.indexOf(pass)
        if(i !== -1)
          this.pases.splice(i,1);
      }
    };

    return iterator;
  })();

  return {
    camera: camera,
    iterator: iterator
  };
})();

Obj = (function(){

  function Obj(p, rx, ry, rz, rw) {
    var vec4 = NMath.vec4;
    //graphical data:
    //position vectors
    this.p = (p)? p:vec4.create();
    //rotation vectors
    this.rx = vec4.create();
    this.ry = vec4.create();
    this.rz = vec4.create();
    this.rw = vec4.create();
    this.rx[0] = 1.0;
    this.ry[1] = 1.0;
    this.rz[2] = 1.0;
    this.rw[3] = 1.0;

    //physical data
    //position derivative
    this.dp = vec4.create();
    //rotation derivative
      /*  more complex than i need right now my friend ...
      this.drx = new vec4();
      this.dry = new vec4();
      this.drz = new vec4();
      this.drw = new vec4();
      */
    //better this relative-axis relative rotation angles for usage with math.rotateNormalized
    this.drx = 0.0;
    this.dry = 0.0;
    this.drz = 0.0;
    this.drw = 0.0;

    this.drv1 = new vec4.create();
    this.drv2 = new vec4.create();
    this.drtheta = 0.0;

    this.geom = null;
  };

  return  Obj
})();
