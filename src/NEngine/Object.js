//has mouse events API, keyboard events API
//n n-dimensional cameras for complex projection
//extra hoisted camera for more complex n-dimensional projection
//    (aka: watch initial ND camera from other camera in World-space coords)

/**
@memberof NEngine
@class SubSpace
@desc represents minimal space data, used in defining entities or similar
stuff, a rotation plus a translation, possible deprecated on the near future
when processing efficiency gets more tested
@prop {Vector} p position, length = dim
@prop {Matrix} r rotation, length = dim*dim

@param {Object} cfg
@param {Integer} cfg.dim - dimension of the subspace
*/
SubSpace = function SubSpace(cfg) {
  this.p = new NMath['vec'+cfg.dim].create();
  this.r = new NMath['mat'+cfg.dim].createIdentity();
};

/**
@memberof NEngine
@class Camera
@desc Represents a camera. It has a position, rotation, and viewport
transformation, it offers methods for easy input connection

@prop {Object} cfg - configuration object used on construction

@prop {Integer} dim
*/
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

/**
@memberof NEngine
@class Entity
@desc Has minimal abstract object information position, rotation, meta-data,
geometry, material, collision config.
<br/><br/>
Its extremely useful to represent a dynamic object that can interact physically
with its environment, can be pluged into physics spaces and have meta-data.

@prop {Integer} dim - Dimensionality of Ent.
@prop {Geom} geometry - The visual geometry for the entity
@prop {Material} material - The material data for the shader
@prop {Object} collider - Collision processing info (type of detection,
geom, etc)
@prop {Object} phy - Physical data, for physical processors (elasticity, mass,
friction coeficient, etc)
@prop {SpaceNode} container - The SpaceNode that holds this entity
*/
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

    this.collider = null;
    this.phy = null;

    this.container = null;
  }

  Entity.defaults = {
    dim: 4,
  }

  Entity.prototype = {
    /**
    @memberof NEngine.Entity.prototype
    @method set
    @param {(PhysicsModule|String|Integer)} type - The module that defines the
    type you want to set into this entity, it can be the module, its
    registered name, or its enum Integer in the PhysicsModulesEnum
    @param {Object} opt - The options passed to the convert function of the
    module.
    @desc Requires that the entity is previously registered on a space node.
    <br/><br/>
    Sets a physics type on the entity, using a module object, module name, or
    module enum. Checks whether the objects array in the entity container (a
    SpaceNode) has the needed object type array instantiated, and conects this
    entity to it so it will be processed by the processors of the given type.
    <br/><br/>
    This way you can configure an entity to be of a given type and be
    processed by the processors that process that type in the SpaceTree
    */
    setType: function set(type, opts) {
      var container = this.container, objects;
      if(!container) return;

      //sanitizes type parameter
      if(type instanceof String || typeof type == 'string')
        type = NEngine.Physics.PhysicsModules[type];
      else  if(type instanceof 'Number' || typeof type == 'number')
        type = NEngine.Physics.PhysicsModulesEnum[type];

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

/**
@memberof NEngine
@class Obj
@desc An old implementation of Entity. If you have problems with camera control
use this instead, but beware, the new Camera object will make all you do with
this object useless.
@deprecated
*/
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
