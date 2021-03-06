try {
  if(twgl)  //requires
    try {
      (function NEngineBootStrap () {

        var global_root = this;

        	/**
  # NEngine.js
  <br/>
  A n-dimensional, full featured graphical-physical engine for the web.
<br/><br/>

  ## Features:
<br/><br/>

  ### N-dimensional geometry library and N-dimensional physical library:
  <br/>
  It contains basic n-dimensional polyhedrons and a basic geometry collision library to use in the physical system.
<br/><br/>

  ### Extended shader language:
  <br/>
  To create the n-dimensional shaders, it features an extended version of the Opengl Shading language called OpenGl N Shading Language or NSL using a small transcompiler that extends OGSL datatypes like matrices and vectors into N.
<br/><br/>

  ### Easy N-dimensional design and shader creation with Space Hierarchies:
  <br/>
  To manipulate multiple data spaces, and allow the existence of 3d spaces interacting with 5d spaces and handle simultaneously the two types of physics to later connect them into the same space, and to also simplify the shader organization and creation in the rendering, organizes its data into a Space Hierarchy that represents in a graph like manner, the spaces involved and the transformations in between them.
<br/><br/>

  ### New possible universes:
  <br/>
  Space Hierarchies allows to represent non-linear transformations like Bézier curves or fractal mappings from, for example object space into world space that modify the rendering and the physics for the interacting objects in those spaces. Thats right!, you can now create 3D hipersphere curved spaces inside 4D universes and simulate outer space accelerated expansion, or put many of those 4D universes inside six dimension spaces, curved like 4D hiperplanes, to construct complex space systems on which lot of different and interesting things can happen. You imagine literally seeing your galactic army crossing the universe bending into another reality?, now you can.
<br/><br/>

  ### Really fast:
  <br/>
  For all of its capabilities it has a good performance, that can work very good also in a smartphone, thanks to NMath optimization system on which it compiles extremely optimized hardcoded math operations in the given dimension in real time. Anyway, i need support improving the data structures in physics system and overall engine design because i´m not an expert.
<br/><br/>

  ## How it works:
<br/><br/>

  It builds its optimized mathematical functions from NMath, and directly projects dimension 'n' into dimension 'm' (commonly m = 3)  inside the vertex shader, using webgl. A port to other platforms, with other rendering power would be interesting, but always maintaining its web approach so currently i´m more interested in translate parts of it into something easy to translate into asm, like c.
<br/><br/>

  Currently uses a little bit of twgl to work.
<br/><br/>
  ## Usage:

* @fileoverview
* @author Nicolás Narváez
* @version 0.5.8.10
*/

/**
@namespace NEngine
*/
var
  mat = NMath.mat,
  vec = NMath.vec,
  mat5 = NMath.mat5,
  vec3 = NMath.vec3,
  vec4 = NMath.vec4,
  vec5 = NMath.vec5,
  GLMAT_ARRAY_TYPE = NMath.ARRAY_TYPE,
  GLCOLOR_ARRAY_TYPE = NMath.GLCOLOR_ARRAY_TYPE,
  GLINDEX_ARRAY_TYPE = NMath.GLINDEX_ARRAY_TYPE;

function projection(out,va,vb) {
  vec4.scale(out, vb, vec4.dot(va,vb)/vec4.length(va));
}

global_root.NEngine = (function NEngineInit () {

  var math, Obj, renderer, geometry,
    util,
    Engine,
    Frame,
    Physics,
    Camera,
    Renderer,
    //TODO Shader logic, optimization, generation, syntax, definition
    //uses ND configs to generate ND materials
    ShaderCompiler,
    //generates materials data canvases
    Shader,
    Entity,
    //TODO:optimized physical system, collisions, force fields, n-dimensional boxing system
    //Huge-Nano space handling
    //fixed world object handler: environment variables, force-fields
    //object factories, for fast replication, on preconfigured engines
    SubSpace, //minimal unit of SVS
    Space,  //module of a system
    System, //Physycal collection of data and transforms
    GLNSLCompiler,
    vec4=NMath.vec4,
    vec5=NMath.vec5,
    mat4=NMath.mat4,
    mat5=NMath.mat5,
    _module;

  util = {
    //return a + every prop not in a but in b
    missing: function missing(a, b) {
      for(prop in b)
        if(!a[prop])
          a[prop] = b[prop];
    },
  }

  /**
@namespace geometry
@memberof NEngine
@desc All geometry stuff, geoms and utilitary functions
*/
geometry = (function() {

  /**
  @memberof NEngine.geometry
  @function clone
  @desc Creates a copy in memory of the geometry
  @param {Geom} original
  @return {Geom} copy
  */
  function clone(g) {

  }

  /**
  @memberof NEngine.geometry
  @function boundingBox
  @desc configures Geom boundingBox data
  @param {Geom} geom
  @return {Geom} this
  @
  */
  function boundingBox(g) {
    var box = {};

    return box;
  }
  /**
  @memberof NEngine.geometry
  @function boundingSphere
  @desc sets value of boundingSphereRadius
  @param {Geom} geom
  @return {Geom} this
  */
  function boundingSphere(g) {
  }

  /*
  function join()
  */

  /**
  @memberof NEngine.geometry
  @method concat
  @description
  Creates new geom space and fills it with the geoms in the given order
  if an entity is passed, applies transformations before adding
  TODO: n geoms to one (optimize)
  @param {Geom} a first geom
  @param {Geom} b last geom
  @param {Boolean} [keep_geom=false] if true, then the first geom will be
  modified and returned as the joined geom
  */
  function concat(a, b, keep_geom) {
    var
      ag = (a instanceof Geom)? a : a.geom,
      bg = (b instanceof Geom)? b : b.geom,
      ad = ag.data,
      bd = bg.data,
      og = (keep_geom)? ag: new Geom(),
      od = (keep_geom)? (og.data={}) : og.data,
      lm, lv, d_copy, v, v_tmp, av, bv, ov, i,offset_from,offset_to ,
      dim = ag.dim || bg.dim,
      ari, bri, api, bpi, ar, ap, br, bp;

    ari = bri = api = bpi = true;
    av = ad.vertex;
    bv = bd.vertex;

    og.dim = dim;

    od.vertex = new GLMAT_ARRAY_TYPE(
      ((av)?av.length:0) +
      ((bv)?bv.length:0) );
    ov = od.vertex;

    od.color = new GLCOLOR_ARRAY_TYPE(
      ((ad.color)?ad.color.length:0) +
      ((bd.color)?bd.color.length:0) );


    if(ad.edges || bd.edges) {
      od.edges = new GLINDEX_ARRAY_TYPE(
        ((ad.edges)? ad.edges.length:0) +
        ((bd.edges)? bd.edges.length:0) );
    }
    if(ad.faces || bd.faces) {
      od.faces = new GLINDEX_ARRAY_TYPE(
        ((ad.faces)?ad.faces.length:0) +
        ((bd.faces)?bd.faces.length:0) );
    }

    if(a instanceof Entity || b instanceof Entity) {
      lm = NMath['mat'+og.dim];
      lv = NMath['vec'+og.dim];
      d_copy = NMath.common.copy

      if(a instanceof Entity) {
        ar = a.r; ap = a.p;
        ari = lm.isIdentity(ar);
        api = lv.isNull(ap);
      }
      if(b instanceof Entity) {
        br = b.r; bp = b.p;
        bri = lm.isIdentity(br);
        bpi = lv.isNull(bp);
      }

    }




    //copy vertex
    //if vertex by vertex copy is needed execute this, otherwise
    //just copy the whole chunks
    if(av) {

      if( av instanceof Array || !ari || !api ) {
        //this cheks if there are transformations to be done into
        //each vertex to be copied
        i = av.length;
        v = lv.create();
        v_tmp = lv.create();

        //a rotation is identity, and a position is identity => just copy
        if( ari && api) {
          for(; i--;)
            ov[i] = av[i];
          }

        else {
          for(; (i-=dim) >= 0;) {
            d_copy(v, av, 0, dim, i);

            if(!ari) {
              lm.multiplyVec(v_tmp, ar, v);
              lv.copy(v, v_tmp)
            }
            if(!api)
              lv.add(v,v,ap);

            d_copy(ov, v, i, dim, 0);
          }
        }

      }
      else
        od.vertex.set(av);
    }

    if(bv) {
      offset_to = (av)? av.length:0;

      //repeat what was done in before section into second geometry
      if( bv instanceof Array || !bri || !bpi ) {
        i = bv.length;
        v = lv.create();
        v_tmp = lv.create();



        if( bri && bpi)
          for(; i--;)
            ov[i] = bv[i];

        else {
          for(; (i-=dim) >= 0;) {
            d_copy(v, bv, 0, dim, i);

            if(!bri) {
              lm.multiplyVec(v_tmp, br, v);
              lv.copy(v, v_tmp)
            }
            if(!bpi)
              lv.add(v,v,bp);
            d_copy(ov, v, i+offset_to, dim, 0);
          }
        }

      }
      else
        od.vertex.set(bv, offset_to);
    }

    if(ad.edges)
      od.edges.set(ad.edges);
    if(ad.faces)
      od.faces.set(ad.faces);

    offset_from = ((av)?av.length/dim:0);
    if(bd.edges) {
      offset_to = (ad.edges)? ad.edges.length : 0;
      // console.log(offset_to)
      for(i=bd.edges.length; i--;)
        od.edges[i+offset_to] = bd.edges[i] + offset_from;
    }
    if(bd.faces) {
      offset_to = (ad.faces)? ad.faces.length : 0;
      for(i=bd.faces.length; i--;)
        od.faces[i+offset_to] = bd.faces[i] + offset_from;
    }

    if(ad.color)
      od.color.set(ad.color);
    if(bd.color)
      od.color.set(bd.color, (ad.color)?ad.color.length:0);

    return og;
  }

  /**
  @memberof NEngine.geometry
  @method forEach
  @desc String forEach for geometries, applies transformations if it
  recieves an entity
  */
  function forEach(src) {

  }


  /**
  @memberof NEngine.geometry
  @method twglize
  @desc Convierte una geometria desde el formato Geom a el de twgl para
  usarse con la libreria
  @param {Geom} Geom La geometria a convertir
  @return {twglGeom} La geometria transformada
  */
  function twglize(g) {
    g.buffers = {
      position: {
        numComponents: g.dim,
        data: g.data.vertex,
        type: GLMAT_ARRAY_TYPE},
      color: {
        numComponents: 4,
        data: g.data.color,
        type: GLCOLOR_ARRAY_TYPE
      }
    }

    if(g.data.edges || g.data.faces) {
      g.buffers.indices = {
        numComponents: (g.data.edges)? 2:3,
        data: (g.data.edges)? g.data.edges:g.data.faces,
        type: Float32Array
      }
    }

    return g
  }

  /**
  @memberof NEngine.geometry
  @class Geom
  @desc Represents a Geometry object, contains collision data, vertex,
  colours and faces lists, those are in a data dictionary so adding more
  data lists is easy (like uniform data)
  it also contains the buffers generated for the shader

  <br/><br/>
  Al the data lists follow the webgl format for buffers, you can check the
  format in their documentation, but here is a small review: <br/><br/>

  A 3D vertex list looks like this: <br/> [ v1_x, v1_y, v1_z, v2_x, v2_y, ... ,
  vn_y, vn_z ] <br/>
  All elements being float type <br/><br/>
  For colors, they correspond to the vertex they match:<br/>
  [v1_cr, v1_cg, v1_cb, [v1_ca] , v2_cr, .. , vn_cb, [vn_ca] ] <br/>
  v1_cr means vertex 1 colour red, as you can see, each color can
  have 3 or four components (colour alpha is optional), but anyway this is
  just shader dependant, better look at the webgl docs! <br/><br/>
  The faces list and the edges list are the same, but their elements
  are Integers instead of Floats and they represent an index in the vertex
  data list, for example, a face list like this: [0, 2, 1] means a triangle
  that has the first vertex in it first edge, the third on its second and so
  on. <br/><br/><br/>
  TODO: prepare standard simplex array for n-dimensional tesselation (faces for
  n-dimensional objects have (n-1) dimensions) and a simple way to cut them
  in shader program or a similar mechanism
  @property {Object} data - contains data lists of elements
  @property {Array} data.vertex
  @property {Array} data.color
  @property {Array} data.edges
  @property {Array} data.faces

  @property {Object} buffers - this contains the shader program buffers,
  one of the is generated for each data list

  @property {Integer} dim - dimensionality of the geom

  @property {Float} boundingBoxMin - normally, shortest vertex component
  @property {Float} boundingBoxMax - normally largest vertex component
  @property {Float} boundingSphereRadius - bigger distance to a vertex
  */
  function Geom() {
    this.boundingBoxMin = 0;
    this.boundingBoxMax = 0;
    this.boundingSphereRadius = 0;

    this.dim = 0;

    this.data = {
      vertex: null,
      color: null,

      edges: null,
      faces: null,
    };
    this.buffers = {};
    return this
  }

  Geom.prototype = (function() {
    /**
    @memberof NEngine.geometry.Geom.prototype
    @method concat
    @param {Geom} joining_geom the geom to join into this
    @desc a shortcut to concat, like calling concat(this, ...)
    @return {Geom} concat(this, ...)
    */
    function concat_geom(b) {
      return concat(this, b);
    }
    /**
    @memberof NEngine.geometry.Geom.prototype
    @method twglize
    @desc shortcut to twglize(this)
    @return {twglGeom} twglize(this)
    */
    function twglize_geom() {
      return twglize(this);
    }
    return {
      concat: concat_geom,
      twglize: twglize_geom,
    };
  })();

  /**
@memberof NEngine.geometry
@function grid{n}

@param {Object} options - cfg object
@param {Integer} options.size - the subdivisions of the grid for each axis
@param {Integer} options.size_{component} you can target specific components
(x, y, z, w) to override options.size on it
@param {Float} options.length - the length of the grid on all axis
@param {Float} options.length_{component} you can target specific components
(x, y, z, w) to override options.length on it
@param {Boolean} options.wire - if generate wire or face data on data buffers

@param {Function} options.iteration - function to execute on each vertex.
  Receives vertex position according to parametters and the options object
  itself with extra fields for locating the iteration function in the fractal.
  <br/><br/>
  iteration : function(p, options) {} <br/>
  p: the position of the current vertex according to initial parametters
  (size, length) <br/>
  options: options + {recursion_i, recursion_is, recursion_p, recursion_ps} <br/>
  recursion_i is the index of the current vertex in integer, internall format,
  recursion_p is the scaled to world coordinates format. </br>
  options.recursion_is, recursion_ps to get the index of the vertex in the
  fractal grid in the format [ p1 = [p1x, p1y, ..], p2, .. ] for each format.
@param {Integer} options.recursion_depth - To execute recursively, indicating
  height (0 is normal).
@param {Boolean} options.functional - True if to only execute vertex iteration
  and exit avoiding geometry computation.

@desc creates a grid geometry, a grid is understod as a 2 dimensional net, this
time we extend it to n dimensions. Each axis repeats the grid onto it,
perpendicular to all the others. You specify de dimension choosing the n
letter: (grid3, grid4)
<br/><br/>
TODO: extend to N
@return {Geom} grid finished geometry
*/
function grid4(ops) {
  if(!ops) ops = {};

  var
    size_x = ops.size_x || ops.size || 2,
    size_y = ops.size_y || ops.size || size_x,
    size_z = ops.size_z || ops.size || size_y,
    size_w = ops.size_w || ops.size || size_z,

    length_x = ops.length_x || ops.length || 1,
    length_y = ops.length_y || ops.length || length_x,
    length_z = ops.length_z || ops.length || length_y,
    length_w = ops.length_w || ops.length || length_z,

    //this transforms from vertex coordinate to array coordinate
    size_step_x = 4,
    size_step_y = size_x*size_step_x,
    size_step_z = size_y*size_step_y,
    size_step_w = size_z*size_step_z,

    //separation between vertex acording to given size
    length_step_y = length_y/(size_y-1),
    length_step_z = length_z/(size_z-1),
    length_step_x = length_x/(size_x-1),
    length_step_w = length_w/(size_w-1),

    //used as cache for in-loop position assignment
    length_y_m = length_y/2,
    length_z_m = length_z/2,
    length_x_m = length_x/2,
    length_w_m = length_w/2,

    //loop iterators
    i_w, i_z, i_y, i_x, i_dir, i_dir2,

    g;

  //just a recursion, calm down guys
  if(ops.iteration || ops.recursion_depth) {
    var p = NMath.vec4.create(),
      recursion_i = Array(4);


    //first execution
    if(!ops.recursion_depth_total) {
      ops.recursion_depth_total = ops.recursion_depth;
      ops.recursion_depth_current = 0;
    }

    // console.log('ops.recursion_is');
    if(!ops.recursion_is)
      ops.recursion_is = [recursion_i];
    else
    ops.recursion_is.push(recursion_i);

    // console.log('ops.recursion_is', ops.recursion_is);


    if(!ops.recursion_ps)
      ops.recursion_ps = [p];
    else
      ops.recursion_ps.push(p);

    for(recursion_i[3] = size_w; recursion_i[3]--;)
      for(recursion_i[2] = size_z; recursion_i[2]--;)
        for(recursion_i[1] = size_y; recursion_i[1]--;)
          for(recursion_i[0] = size_x; recursion_i[0]--;) {

            p[0] =  recursion_i[0]*length_step_x - length_x_m;
            p[1] =  recursion_i[1]*length_step_y - length_y_m;
            p[2] =  recursion_i[2]*length_step_z - length_z_m;
            p[3] =  recursion_i[3]*length_step_w - length_w_m;

            ops.recursion_i = recursion_i;
            if(ops.iteration)
              ops.iteration(p, ops);

            if(ops.recursion_continue === false)
              continue
            if(ops.recursion_depth) {
              // console.log('starting new grid', ops.recursion_depth)
              ops.recursion_depth--;
              ops.recursion_depth_current++;
              grid4(ops);
              ops.recursion_depth++;
              ops.recursion_depth_current--;
            }
          }
    ops.recursion_ps.pop();
    ops.recursion_is.pop();
      if(ops.functional)
        return
  }

  var position = new GLMAT_ARRAY_TYPE(size_w*size_z*size_y*size_x*4),
    color = new GLCOLOR_ARRAY_TYPE(size_w*size_z*size_y*size_x*4),
    indices = (ops.wire)? new GLINDEX_ARRAY_TYPE(2*(
      size_w*size_z*size_y*(size_x-1) +
      size_w*size_z*(size_y-1)*size_x +
      size_w*(size_z-1)*size_y*size_x +
      (size_w-1)*size_z*size_y*size_x
    )) : new GLINDEX_ARRAY_TYPE(

    );

  if(ops.wire){
    //fill vertex position data
    for(i_w = size_w; i_w--;)
      for(i_z = size_z; i_z--;)
        for(i_y = size_y; i_y--;)
          for(i_x = size_x; i_x--;) {
            i_dir =
              i_w*size_step_w +
              i_z*size_step_z +
              i_y*size_step_y +
              i_x*size_step_x;

            position[ i_dir ] =  i_x*length_step_x - length_x_m;
            position[i_dir+1] =  i_y*length_step_y - length_y_m;
            position[i_dir+2] =  i_z*length_step_z - length_z_m;
            position[i_dir+3] =  i_w*length_step_w - length_w_m;

            color[ i_dir ] = 0.7+ ((i_x-size_x/2)/size_x) + (i_w/size_w)/6;
            color[i_dir+1] = 0.7+ ((i_y-size_y/2)/size_y) + (i_w/size_w)/6;
            color[i_dir+2] = 0.7+ ((i_z-size_z/2)/size_z) + (i_w/size_w)/6;
            color[i_dir+3] = 1;
          }

    //will create all the indices of lines that point in the final axis
    // parameter data direcction
    function createLinesOnAxis(offset,
        size_w, size_z, size_y, size_x,
        size_step_w, size_step_z, size_step_y, size_step_x, db) {

      var indices_size_step_x = 2,
        indices_size_step_y = indices_size_step_x*(size_x-1),
        indices_size_step_z = indices_size_step_y*size_y,
        indices_size_step_w = indices_size_step_z*size_z;

      //para cada elemento en el mapa de lineas
      for(i_w = size_w; i_w--;)
        for(i_z = size_z; i_z--;)
          for(i_y = size_y; i_y--;)
            for(i_x = size_x; --i_x;) {

              //line dir
              i_dir = offset +
                i_w*indices_size_step_w + i_z*indices_size_step_z +
                i_y*indices_size_step_y + (i_x-1)*indices_size_step_x;

              i_dir2 =  (i_w*size_step_w + i_z*size_step_z +
                i_y*size_step_y + i_x*size_step_x)/4;

              indices[i_dir] = i_dir2;
              indices[i_dir+1] = (i_dir2 - size_step_x/4);
            }
    }
    //use for every axis, calculating offset accordingly
    createLinesOnAxis(
      0, size_w, size_z, size_y, size_x,
      size_step_w, size_step_z, size_step_y, size_step_x);
    createLinesOnAxis(
      2*size_w*size_z*size_y*(size_x-1),
      size_w, size_z, size_x, size_y,
      size_step_w, size_step_z, size_step_x, size_step_y);
    createLinesOnAxis(
      2*size_w*size_z*
      (size_y*(size_x-1) + (size_y-1)*size_x),
      size_w, size_x, size_y, size_z,
      size_step_w, size_step_x, size_step_y, size_step_z);
    createLinesOnAxis(
      2*size_w*
        (size_z* (size_y*(size_x-1) + (size_y-1)*size_x) +
        (size_z-1)*size_y*size_x),
      size_x, size_z, size_y, size_w,
      size_step_x, size_step_z, size_step_y, size_step_w);
    }
    else {

    }


    g = Geom.apply({
      length_x : length_x,
      length_y : length_y,
      length_z : length_z,
      length_w : length_w,

      size_x : size_x,
      size_y : size_y,
      size_z : size_z,
      size_w : size_w,
    })
    g.dim = 4


    g.data = {}
    g.data.vertex = position
    if(ops.wire)  g.data.edges = indices
    else  g.data.faces = indices

    g.data.color = color

    return twglize(g)
}
grid4.prototype = Geom.prototype;

grid4.it = function(ops) {
  if(ops.iteration || ops.recursion_depth) {
    var p = NMath.vec4.create(),
      recursion_i = Array(4);


    //first execution
    if(!ops.recursion_depth_total) {
      ops.recursion_depth_total = ops.recursion_depth;
      ops.recursion_depth_current = 0;
    }

    // console.log('ops.recursion_is');
    if(!ops.recursion_is)
      ops.recursion_is = [recursion_i];
    else
    ops.recursion_is.push(recursion_i);

    // console.log('ops.recursion_is', ops.recursion_is);


    if(!ops.recursion_ps)
      ops.recursion_ps = [p];
    else
      ops.recursion_ps.push(p);

    for(recursion_i[3] = size_w; recursion_i[3]--;)
      for(recursion_i[2] = size_z; recursion_i[2]--;)
        for(recursion_i[1] = size_y; recursion_i[1]--;)
          for(recursion_i[0] = size_x; recursion_i[0]--;) {

            p[0] =  recursion_i[0]*length_step_x - length_x_m;
            p[1] =  recursion_i[1]*length_step_y - length_y_m;
            p[2] =  recursion_i[2]*length_step_z - length_z_m;
            p[3] =  recursion_i[3]*length_step_w - length_w_m;

            ops.recursion_i = recursion_i;
            if(ops.iteration)
              ops.iteration(p, ops);

            if(ops.recursion_continue === false)
              continue
            if(ops.recursion_depth) {
              // console.log('starting new grid', ops.recursion_depth)
              ops.recursion_depth--;
              ops.recursion_depth_current++;
              grid4(ops);
              ops.recursion_depth++;
              ops.recursion_depth_current--;
            }
          }
    ops.recursion_ps.pop();
    ops.recursion_is.pop();
      if(ops.functional)
        return
  }
}

function RecursiveIterator(ops) {
  this.geom = ops.g;

}
RecursiveIterator.prototype = {
  next: function next() {
    
  }
}

// grid4.it =

/**
@memberof NEngine.geometry
@function simplex{n}

@param {Object} options cfg object
@param {Integer} options.size the size (length) of the simplex
@param {Boolean} options.wire if generate wire or face data on data buffers

@desc creates a simplex, a simplex is the simplest regular polyhedra on a given
dimension, resembles the triangle but in the given dimension. For n-d a simplex
has n-1 vertex and many faces has (n-1)-d subsimplex (subcollections) that
tesellate it (dont collide when filling it)  <br/><br/>
You specify de dimension choosing the n letter: (simplex3, simplex4)
<br/><br/>
TODO: extend to N
@return {Geom} simplex finished geometry
*/
function simplex4(ops) {
  var g, size = ops.size, type = ops.enemy,
   p = new GLMAT_ARRAY_TYPE([
      -0.5, -0.28867512941360474, -0.2041241452319315, -0.15811388194561005,
      0.5, -0.28867512941360474, -0.2041241452319315, -0.15811388194561005,
      0, 0.5773502743708339, -0.2041241452319315, -0.15811388194561005,
      0, 0, 0.6123724431685174, -0.15811388194561005,
      0, 0, 0, 0.6324555330964848
    ]),
    c = (type)? new GLCOLOR_ARRAY_TYPE([
      1, 0, 0, 1,
      1, 0, 0, 1,
      0, 1, 0, 1,
      0, 1, 0, 1,
      1, 1, 0, 1,
    ]) : new GLCOLOR_ARRAY_TYPE([
      1, 0, 1, 1,
      0, 1, 1, 1,
      1, 1, 1, 1,
      1, 1, 0, 1,
      0, 0, 0, 1,
    ]),
    i = (ops.wire)?new GLINDEX_ARRAY_TYPE([ //if a wire
      0, 1,
      0, 2,
      0, 3,
      0, 4,
      1,2,
      1,3,
      1,4,
      2,3,
      2,4,
      3,4,
    ]):

    new GLINDEX_ARRAY_TYPE([  //if 3D face (4D sub-filling)
      0,1,2,
      0,1,3,
      0,1,4,
      0,2,3,
      0,2,4,
      0,3,4,
      1,2,3,
      1,2,4,
      1,3,4,
      2,3,4,
    ])

    /*
    v_tmp[0] = 1.0 + 0.5*3;
    v_tmp[1] = 0.8660254037844386 + 0.28867513459481287*2;
    v_tmp[2] = 0.816496580927726 + 0.2041241452319315;
    v_tmp[3] = 0.7905694150420949;
    */
  g = Geom.apply({
    })

  g.dim = 4;

  g.data = {}
  g.data.vertex = p;
  if(ops.wire)  g.data.edges = i;
  else  g.data.faces = i;
  g.data.color = c;

  return twglize(g);
}

/**
@memberof NEngine.geometry
@function octahedron{n}

@param {Object} options cfg object
@param {Float} size its length, size

@desc just the n-dimensional extension of the octahedron
<br/><br/>
You specify de dimension choosing the n letter: (octahedron3, octahedron4)
<br/><br/>
TODO: extend to N
@return {Geom} octahedron finished geometry
*/

function octahedron4(ops) {
  var g, size = ops.size,
    p = new GLMAT_ARRAY_TYPE([
    size, 0, 0, 0,
    -size, 0, 0, 0,
    0, size, 0, 0,
    0, -size, 0, 0,
    0, 0, size, 0,
    0, 0, -size, 0,
    0, 0, 0, size,
    0, 0, 0, -size,
  ]),
  c = new GLCOLOR_ARRAY_TYPE([
    0, 1, 1, 1,
    0, 1, 1, 1,

    1, 0, 0, 1,
    1, 0, 0, 1,

    0, 0, 1, 1,
    0, 0, 1, 1,

    1, 1, 0, 1,
    1, 1, 1, 1
  ]),
  i = (ops.wire)? new GLINDEX_ARRAY_TYPE([
    0, 2,
    1, 2,
    0, 3,
    1, 3,
    0, 4,
    1, 4,
    0, 5,
    1, 5,
    0, 6,
    1, 6,
    0, 7,
    1, 7,

    2, 4,
    3, 4,
    2, 5,
    3, 5,
    2, 6,
    3, 6,
    2, 7,
    3, 7,

    4, 6,
    5, 6,
    4, 7,
    5, 7,
  ]): new GLINDEX_ARRAY_TYPE([
    0,2,3,
    0,2,4,
    0,2,5,
    0,2,6,
    0,2,7,

    0,3,4,
    0,3,5,
    0,3,6,
    0,3,7,

    0,4,5,
    0,4,6,
    0,4,7,

    0,5,6,
    0,5,7,
    0,6,7,

    1,2,3,
    1,2,4,
    1,2,5,
    1,2,6,
    1,2,7,

    1,3,4,
    1,3,5,
    1,3,6,
    1,3,7,

    1,4,5,
    1,4,6,
    1,4,7,

    1,5,6,
    1,5,7,
    1,6,7,

    2,4,5,
    2,4,6,
    2,4,7,
    2,5,6,
    2,5,7,
    2,6,7,

    3,4,5,
    3,4,6,
    3,4,7,
    3,5,6,
    3,5,7,
    3,6,7,

    4,6,7,
    5,6,7,
  ]);

  g = Geom.apply({
    boundingSphereRadius: size,
    boundingBoxMax: size,
    boundingBoxMin: size,
    })
  g.dim = 4;

  g.data = {}
  g.data.vertex = p;
  if(ops.wire)  g.data.edges = i;
  else  g.data.faces = i;
  g.data.color = c;

  return twglize(g);
}

/**
@memberof NEngine.geometry
@function axis{n}

@param {Object} ops - cfg object

@desc an axis in n-d is just n orthogonal lines that intersec in the origin
this one has a different colour for each line so you can use it as a guide
<br/><br/>
You specify de dimension choosing the n letter: (axis3, axis4)
<br/><br/>
TODO: extend to N
@return {Geom} axis finished geometry
*/

function axis4(ops){
  var s = ops.size,p = new GLMAT_ARRAY_TYPE([
    0, 0, 0, 0,
    s, 0, 0, 0,
    0, s, 0, 0,
    0, 0, s, 0,
    0, 0, 0, s,
  ]),
  c = new GLCOLOR_ARRAY_TYPE([
    1, 1, 1, 1,

    1, 0, 0, 1,
    1, 1, 0, 1,
    0, 1, 0, 1,
    0, 1, 1, 1,
  ]),
  i = new GLINDEX_ARRAY_TYPE([
    0, 1,
    0, 2,
    0, 3,
    0, 4,
  ]);

  g = new Geom()
  g.dim = 4

  g.data = {
    vertex : p,
    edges : i,
    color : c,
  }

  return twglize(g)
}

function tree4(ops) {

}


  return {
    octahedron4: octahedron4,
    simplex4: simplex4,
    grid4: grid4,
    axis4: axis4,
    Geom: Geom,
    twglize: twglize,
    concat: concat
  };
})();

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


  //all the functions point to a static reference => no memdirection
//solving after compiling
//it could be maintained, this pseudo-monolitic mode for multiple instances

renderer = (function() {
  var obj_list = [],
    mat4 = NMath.mat4,
    mat5 = NMath.mat5,
    vec4 = NMath.vec4,
    context = null,
    canvas = null,
    shader_info = null,
    vertexShader, fragmentShader,
    attrib_vertex, attrib_color,
    config = {},
    math = {
      mat : null,
      mat_cartesian : null,
      vec : null,
      vec_homogenous : null,
      vec_base : null
    },

    PMVMatrix = mat5.create(),
    PMVMatrix3 = mat4.create(),
    PMatrix = mat5.create(),
    PMatrix3 = mat4.create(),

    uPMVMatrix1 = mat4.create(),
    uPMVMatrix2 = mat4.create(),

    uPMatrix1 = mat4.create(),
    uPMatrix2 = mat4.create(),

    uMVMatrix1 = mat4.create(),
    uMVMatrix2 = mat4.create(),

    uPMVMatrix3D = PMVMatrix3,

    matrix_tmp = mat5.create(),
    tmp_matrix5_1 = mat5.create(),
    tmp_matrix5_2 = mat5.create(),
    tmp_matrix5_3 = mat5.create(),
    tmp_matrix4 = mat4.create(),
    tmp_matrix4_1 = mat4.create(),
    tmp_matrix4_2 = mat4.create(),
    tmp_matrix4_3 = mat4.create(),
    tmp_vec1 = vec4.create(),
    tmp_vec2 = vec4.create(),
    tmp_vec3 = vec4.create(),
    tmp_vec4 = vec4.create(),
    tmp_vec5 = vec4.create(),
    tmp_vec_5_1 = vec5.create(),
    tmp_vec_5_2 = vec5.create(),
    tmp_vec_5_3 = vec5.create(),
    tmp_vec_4_1 = vec4.create(),
    tmp_vec_4_2 = vec4.create(),
    tmp_vec_4_3 = vec4.create(),
    m_cameraRotation = mat5.create(),
    m_cameraRotation3 = mat4.create(),
    m_objectRotation = mat5.create(),
    v_totalTraslation = vec4.create(),
    v_totalTraslation3 = vec4.create(),
    obj_list_i,
    obj_list_obj,
    camera = new Obj(),
    camera3 = new Obj(),
    uniforms = {
      uPMVMatrix1,
      uPMVMatrix2,

      uPMatrix1,
      uPMatrix2,
      uMVMatrix1,
      uMVMatrix2,

      uPMVMatrix3D,
    },
    interface_obj,
    default_options = {
      //no config here relates to NEngine config, but to renderer
      container: document.body,
      resolution_density: 1.0,
      dim : 4,

      color_clear: [0.0, 0.0, 0.0, 1.0],

      //stereo model
      stereo_dim: 3,
      //splited, polarized, alternation timer, etc.
      stereo_mode: 'splited',
      stereo_angle: Math.PI/60,
      stereo_separation: 0.07616,
      view_3d_stereo_angle: Math.PI/60,

      //projection schemes
      projection: 'perspective',
      projection_angle: Math.PI/2,
      projection_near: 1.0,
      projection_far: 3000.0,

      projection_3: 'perspective',
      projection_3_near: 1.0, //used on  ortogonal
      projection_3_far: 200.0,
      projection_3_perspective_angle: Math.PI/2,
      projection_3_orthogonal_size: 300,
      projection_3_orthogonal_aspect_x: 1.0,
      projection_3_orthogonal_aspect_y: 1.0,

      projection_3d_angle: Math.PI/2,
      projection_3d_near: 1.0,
      projection_3d_far: 100.0,

      camera_disposition_3: 'hexagon',
    }

  var tmp_debug = false;

  uPMVMatrix2[0] = 0; uPMVMatrix2[5] = 0; uPMVMatrix2[10] = 0; uPMVMatrix2[15] = 0;


  ///////
  //just for simplification of acommon task...
  //not related to NEngine concerns, but to renderer instance, aka mouse event looking api
  function pointerLock() {
    if(!canvas.requestPointerLock)  return;
    canvas.requestPointerLock();
  }
  function pointerUnlock() {
    if(!document.exitPointerLock)
      document.exitPointerLock = document.exitPointerLock ||
        document.mozExitPointerLock || document.webkitExitPointerLock;

    document.exitPointerLock();
  }
  function pointerLockAlternate() {
    if(
      document.pointerLockElement === canvas ||
      document.mozPointerLockElement === canvas ||
      document.webkitPointerLockElement === canvas
    )
      this.pointerUnlock();
    else if(!document.pointerLockElement &&
      !document.mozPointerLockElement &&
      !document.webkitPointerLockElement)
      this.pointerLock();
  }

  function sanitizeOptions(options) {
    // camera related
    if(!options.stereo_separator && options.stereo_dim) {
      if(options.stereo_dim === 3) options.stereo_separator = [-1, 0, 0, 0];
      if(options.stereo_dim === 4) options.stereo_separator = [-1, 0, 0, 0];

      if(options.stereo_separation === undefined)
        options.stereo_separation = default_options.stereo_separation

      vec4.scale(options.stereo_separator,
        options.stereo_separator,
        options.stereo_separation)
    }
  }

  function init(options) {
    //create context
    if(!options) options = {};

    //config defaults
    var field;

    for(field in default_options)
      if(options[field] === undefined)
        options[field] = default_options[field]

    // Create renderer container
    ///Normalize context to twgl
    if(options.container === document.body) {
      options.container = document.createElement('canvas',
        {alpha: false, premultipliedAlpha: false});
      options.container.className = 'NEngine_canvas';
      document.body.appendChild(options.container);
    }
    context = twgl.getWebGLContext(options.container, {alpha:false});

    // create shader program, deprecated, use generator:
    // new NEngine.shader(flags)
    // obj.code(), obj.set(), renderer.use(obj)
    // camera: list of n-dimensional cameras for each lower dim
    // rederer.cameras(camera instance, renderer.shader)
    twgl.setAttributePrefix('a_');
    shader_info = twgl.createProgramInfo(context, ["vs", "fs"]);
    context.useProgram(shader_info.program);

    //adjust canvas size
    interface_obj.canvas = canvas = context.canvas;
    canvas.requestPointerLock =
      canvas.requestPointerLock ||
      canvas.mozRequestPointerLock ||
      canvas.webkitRequestPointerLock

    set(options)

    math.mat = global_root.NMath['mat'+(config.dim+1)];
    math.mat_cartesian = global_root.NMath['mat'+config.dim];

    math.vec = global_root.NMath['vec'+config.dim];
    math.vec_homogenous = global_root.NMath['vec'+(config.dim+1)];

    //deprecated, to renderer object
    global_root.addEventListener('resize', resize, false);
  }


  function resize() {
    //regenerate renderer transform matrix to catch canvas reshape
    if(emit_log) {
      emit_log('resizing', 'h:', canvas.height,'w', canvas.width)
      emit_log('resizing', 'h:', window.innerHeight,
        'w', window.innerWidth)
      emit_log('stereodim : ',config.stereo_dim)
    }

    var const_vert = 1,
      const_hor = 1;

    twgl.resizeCanvasToDisplaySize( canvas );

    mat5.projectionLen(PMatrix,
      config.projection_angle,
      config.projection_angle,
      config.projection_angle,
      config.projection_near, config.projection_far);

    if(config.stereo_dim) {
        const_vert = canvas.height/canvas.width;
        const_hor = 1/2;
    }
    else {
      const_vert = canvas.height/canvas.width;
      const_hor = 1;
    }

    if(config.projection_3 === 'perspective')
      mat4.projectionLen(PMatrix3,
        config.projection_3_perspective_angle*const_hor,
        config.projection_3_perspective_angle*const_vert,
        config.projection_3_near, config.projection_3_far);
    else if(config.projection_3 === 'ortogonal')
      mat4.ortogonalLen(PMatrix3,
        config.projection_3_orthogonal_size,
        config.projection_3_orthogonal_aspect_x*const_hor,
        config.projection_3_orthogonal_aspect_y*const_vert);
        /*
        projection_3_orthogonal_size: 300,
        projection_3_orthogonal_aspect_x: 1.0,
        projection_3_orthogonal_aspect_y: 1.0
        */
    //console.log(mat.str(PMatrix3))
  }

  function updateRendererView() {
    camera3.rx = [1,0,0,0]
    camera3.ry = [0,1,0,0]
    camera3.rz = [0,0,1,0]
    camera3.rw = [0,0,0,1]
    camera3.p = [0,0,0,0]

    // Fix camera3.p
    if(config.camera_disposition_3 === 'neutral') {}
    
    if(config.camera_disposition_3 === 'experiment') {
      vec3.rotateNormalizedRelative(
        camera3, camera3.rz, camera3.ry,  -Math.PI/4 )
      // vec3.rotateNormalizedRelative(
      //   camera3, camera3.rz, camera3.rx,  Math.PI/4 )
      // camera3.p[2] = 200
      camera3.p[1] = 200
    }
    
    if(config.camera_disposition_3 === 'observer') {
      vec3.rotateNormalizedRelative(
        camera3, camera3.rz, camera3.ry, -Math.PI/4 )
        // camera3.p[2] = 200
      camera3.p[2] = 200
      camera3.p[1] = -100
      // camera3.p[1] = -1
    }

    if(config.camera_disposition_3 === 'hexagon') {
      vec3.rotateNormalizedRelative(
        camera3, camera3.rz, camera3.ry, -Math.PI/4 )
      camera3.p[1] += 200

      /*
      camera3.p[0] += 200;
      camera3.p[2] += 200;
      vec3.rotateNormalizedRelative(camera3, camera3.rz, camera3.rx, -Math.PI/4);
      */
      if(config.projection_3 === 'perspective')  {
      }
      else if(config.projection_3 === 'ortogonal') {
        //camera3.p[0] =200;
        //camera3.p[1] =-120;
      }
    }


    context.clearColor(
      config.color_clear[0],
      config.color_clear[1],
      config.color_clear[2],
      config.color_clear[3]);

    context.enable( context.DEPTH_TEST )

    //blending
    context.enable( context.BLEND )
    //context.disable( context.DEPTH_TEST )
    context.blendFunc( context.SRC_ALPHA, context.ONE_MINUS_SRC_ALPHA )

    resize()
  }

  //reconfigure complex NEngine properties
  function set(options) {
    if(!options) options = {}
    var config_field;

    sanitizeOptions(options)

    for(config_field in options)
      config[config_field] = options[config_field];

    updateRendererView()

    //multiple simultaneous NEngine wont need this, but just renderers
    // if(options.mouse_axisRotation) {
    // }
  }

  //renderer iterator will handle renderer-space camera, and thus posible
  //mouse oriented handling events when asked for, like camera data, and a posible hosted
  //world-camera for optimized more complex 4D or ND visualization techniques
  //
  //remains to be the renderer iterator suposed structure
  //
  var printed = 5;
  var printed_limit = 2;
  var happened = false;
  function render() {
    var mat_common = NMath.mat,
      //to generate tmp matrix data, withfronVecs
      //deprecated by matrix rotation data storage format in objets
      tmp_vec_5 = NMath.vec5.create(),
      tmp_vec_4 = NMath.vec5.create(),
      stereo_4_rotation_plane = [
        new vec4.create(),
        new vec4.create()
      ],
      stereo=[],
      camera_rot_4,
      camera_rot_3,
      i;

    //to generate 4D rotation, deprecated, local
    stereo_4_rotation_plane[0][3] = 1;
    stereo_4_rotation_plane[1][0] = 1;
    stereo_4_rotation_plane[1][2] = 0;
    vec4.plane(stereo_4_rotation_plane[0], stereo_4_rotation_plane[1]);

    //deprecated by new object rotation storage forma
    tmp_vec_5[4] = 1.0;
    tmp_vec_4[3] = 1.0;

    if(obj_list.length) {
      context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);

      //get camera rotation matrix
      mat_common.fromVecs(m_cameraRotation,
        [camera.rx,
        camera.ry,
        camera.rz,
        camera.rw,
        tmp_vec_5]
      );
      mat_common.fromVecs(m_cameraRotation3,
        [camera3.rx,
        camera3.ry,
        camera3.rz,
        tmp_vec_4]
      );
      mat5.translate(m_cameraRotation, camera.p);
      mat4.translate(m_cameraRotation3, camera3.p);

      ///////////////////////////////////globalcamera matrix calculations
      if(config.stereo_dim) for(i=0;i<2;i++) {
        if(config.stereo_dim === 4) {
          //internal eye_translation*eye_rotation
          //eye rotate m_cameraRotation3
          mat5.identity(tmp_matrix5_1);
          mat4.identity(tmp_matrix4);
          /*
          :TODO: el visor entereoscopico n-d esta con errores en las regiones de
          alternación vectorial por ojo y propiedades matriciales de rotación en
          bases vectoriales elegidas
          */
          mat4.rotationPlane(tmp_matrix4,
          stereo_4_rotation_plane[0],
          stereo_4_rotation_plane[1],
          config.stereo_angle * ((i !== 0)? 1:-1) );

          //console.log(mat_common.str(tmp_matrix4));
          mat_common.from(tmp_matrix5_1,  tmp_matrix4);

          //eye translate
          vec4.scale(tmp_vec1, config.stereo_separator, ((i !== 0)? 1:-1) );
          mat5.translate(tmp_matrix5_1, tmp_vec1);

          //world -> eye, global*local
          mat5.multiply(tmp_matrix5_2, m_cameraRotation, tmp_matrix5_1);
          stereo.push(mat5.create());
          mat_common.invert(stereo[i],tmp_matrix5_2)
        }
        if(config.stereo_dim === 3) {
          //internal eye_translation*eye_rotation
          //eye rotate m_cameraRotation3
          mat4.identity(tmp_matrix4_1);
          mat4.rotateAxis(tmp_matrix4_1, 2,0,config.stereo_angle * ((i === 0)? 1:-1));
          //eye translate
          vec4.scale(tmp_vec1, config.stereo_separator, ((i === 0)? 1:-1) );
          mat4.translate(tmp_matrix4_1, tmp_vec1);

          //world -> eye, global*local
          mat4.multiply(tmp_matrix4_2, m_cameraRotation3, tmp_matrix4_1);
          stereo.push(mat4.create());
          mat_common.invert(stereo[i], tmp_matrix4_2);
        }
      }
      if(!(config.stereo_dim === 4)) {
        camera_rot_4=mat5.create();
        mat_common.invert(camera_rot_4, m_cameraRotation)
      }
      if(!(config.stereo_dim === 3)) {
        camera_rot_3=mat4.create();
        mat_common.invert(camera_rot_3, m_cameraRotation3)
      }

      for(obj_list_i=obj_list.length; obj_list_i--;) {
        obj_list_obj = obj_list[obj_list_i]

        //get obj rotation matrix
        mat_common.from(m_objectRotation,obj_list_obj.r, true)
        m_objectRotation[24] = 1;

        mat5.copy(matrix_tmp, m_objectRotation);
        mat5.translate(m_objectRotation, obj_list_obj.p);

        //start drawing
        context.useProgram(shader_info.program);
        twgl.setBuffersAndAttributes(context, shader_info, obj_list_obj.geom.buffers_info);

        //optimize with metaprogramatic precompiler
        for(i = 0, length = ( (config.stereo_dim)? 2:1 ) ; i < length; ++i) {
          //////////////////////////////////////4D level
          if(config.stereo_dim === 4) camera_rot_4 = stereo[i];

          mat5.multiply(matrix_tmp, camera_rot_4, m_objectRotation)

          //create perspective uniforms;
          mat5.multiply(PMVMatrix, PMatrix, matrix_tmp);
          mat5.inferiorProjection(uPMatrix1, uPMatrix2, PMatrix);
          mat5.inferiorProjection(uMVMatrix1, uMVMatrix2, matrix_tmp);
          mat5.inferiorProjection(uPMVMatrix1, uPMVMatrix2, PMVMatrix);

          //////////////////////////////////////3D level
          if(config.stereo_dim === 3) camera_rot_3 = stereo[i];
          mat4.multiply(PMVMatrix3, PMatrix3, camera_rot_3);

          twgl.setUniforms(shader_info, uniforms);
          if(config.stereo_dim) {
            if( (i === 0 && config.stereo_crossed) || (i !== 0 && !config.stereo_crossed) )
            // if( (i === 0 && !config.stereo_crossed) || (i !== 0 && config.stereo_crossed) )
              context.viewport(0, 0, canvas.width/2, canvas.height);
            else {
              // window.interval_log('cw',canvas.width,
              // 'cw/2', canvas.width/2)
              context.viewport(canvas.width/2, 0, canvas.width/2, canvas.height);
            }
          }
          else context.viewport(0, 0, canvas.width, canvas.height);

          twgl.drawBufferInfo(context, (obj_list_obj.geom.buffers.indices.numComponents === 2)? context.LINES:context.TRIANGLES, obj_list_obj.geom.buffers_info);
        }
      }
    }
  }
  //renderer handles ... iterator object copy??
  function objAdd(obj) {
    if(obj.geom && obj.geom.buffers_info !== null) {
      obj.geom.buffers_info = twgl.createBufferInfoFromArrays(context, obj.geom.buffers );
    }
    obj_list.push(obj);
  }

  window.interval_log = function() {
    if(!window._interval_log)
      window._interval_log = Date.now()

    if(window._interval_log < Date.now()) {
      if(emit_log) emit_log(arguments)
      window._interval_log = Date.now() + 1000*2
    }
  }

  function objRm(obj) {
    if(obj_list[obj_list.length-1] === obj) { obj_list.pop(); return; }
    obj_list[ obj_list.indexOf(obj) ] = obj_list.pop();
  }

  interface_obj = {
    objAdd: objAdd,
    objRm: objRm,
    init: init,
    resize: resize,
    render: render,
    canvas: canvas,
    obj_list: obj_list,
    PMatrix: PMatrix,
    PMatrix3: PMatrix3,
    camera: camera,
    camera3: camera3,
    math: math,
    config: config,
    pointerLock : pointerLock,
    pointerUnlock: pointerUnlock,
    pointerLockAlternate: pointerLockAlternate,

    set: set,
  };

  return interface_obj;
})();

  
Shader = (function() {
  function Shader() {
    this.src = null;
    this.src_compiled = null;
    this.compiled = null;
  }

  Shader.prototype = {
    compile: function compile() {
      if(!this.src) return false;
      this.src_compiled = ShaderCompiler.compile(this.src);
    },
    load: function load(context) {

    }
  }

  return Shader;
})();

  /**
@namespace GLNSLCompiler
@memberof NEngine
@desc Contains all related to GLNSLCompiler (:3) classes, functions and
  utilities \n \n
  Using the compiler: \n
  Just call "compile(code, config)", extra information is
  on the function docs
  TODO: scope resolution, currently only non-creating scope sentences are
  translated, like non [ifs, fors, functions, etc]
*/
GLNSLCompiler = (function GLNSLCompilerLoader() {
	var module = {}

	/**
@namespace Util
@memberof NEngine.GLNSLCompiler
@desc General utilities, that could be rehusable outside this application,
	like glsl grammar dictionaries, or more atomic and agnostic
	transcompiling utils.
*/
var Util = (function UtilLoader() {
/**
@namespace Grammar
@memberof NEngine.GLNSLCompiler.Util
@desc Contains glsl grammar definition, useful grammar lists.
	TODO: make it to at least reflect real GLSL
*/
var Grammar = (function(){
	var grammar_lists, grammar_

	grammar_ = {
		identifier: '[_a-zA-Z][_\\w]*'
	}

	grammar_lists = {
		datatypes: [
			'void',
			'bool',
			'int',
			'float',
			'sampler2D',
			'samplerCube',
			'[bi]{0,1}vec\\d+?',
			'mat\\d+_\\d+',
			// 'mat\\d+?',//n*m matrix
		],
		storage_qualifiers: [
			'const',
			'attribute',
			'uniform',
			'varying',
		],
		precision_qualifiers: [
			'highp',
			'mediump',
			'lowp',
		]
	}

	return {
		grammar_lists: grammar_lists,
		grammar_: grammar_,
	}
})()

/**
@memberof NEngine.GLNSLCompiler.Util
@desc removes extra spaces and line feeds
*/
function serialize(str) {
	var i, l, post = ''

	str = str.replace(/\n/ig, ' ')

	for(i = 0, l = str.length; i < l; i++) {
		if(!(str[i] == ' ' && post[post.length-1] == ' '))
			post += str[i]
	}

	return post
}
/**
@memberof NEngine.GLNSLCompiler.Util
@desc returns if given char is scaped or not
*/
function is_scaped(src, i) {
	var scape = 0
	while(src[i-scape-1] == '\\') scape++
	return scape%2 != 0
}

/**
@memberof NEngine.GLNSLCompiler.Util
@desc strips the content of the delimited areas, balancing delimiters
	returns an array of results in the format of regexp.exec on multilple
	results, adding value, and range (in slice format) fields to each one
	according to 'exclude'
@param {String} str - the string to strip
@param {Object} opts - the options object
@param {String|String[]} [opts.delimiter=SymbolTree.prototype.delimiter_default] - the delimiter to
	search, if its an array, be it like [delimiter_left, delimiter_right]
@param {Boolean} [opts.exclude=false] - if to exclude the delimiters in the
	strip value
@return {Object[]} reg_exp_result - adds value and range (slice format) to
	result fields
*/
function strip_balanced(str,opts) {	opts = opts || {}
	var regexp, res,
		res_list = [],
		delimiter = opts.delimiter,
		exclude = opts.exclude,
		map = str,
		nest_depth,
		nest_a, nest_b, i, l, char

	delimiter = delimiter || SymbolTree.prototype.delimiter_default

	if(delimiter instanceof String || typeof delimiter == 'string')
		delimiter = SymbolTree.prototype.delimiter_pairs_unscaped[delimiter] ||
			delimiter

	//if the right delimiter is the same as the left, do a non-greedy match
	if(delimiter[1] == delimiter[0]) {
		delimiter = SymbolTree.prototype.delimiter_pairs[delimiter[0]]
		//generates list of match results, then foreach replaces with
		//placeholder and adds index entry
		regexp = delimiter[0]+'(.*?)'+delimiter[1]
		regexp = new RegExp(regexp, 'gim')

		while(res = regexp.exec(map))
			res_list.push(res)

	} else	//do a balanced match
			//if delimiter[1] reached, and nest_depth = 0, and
			//delimiter[0] found, add match
		for(nest_depth=0, i=0, l=map.length; i<l; i++) {
			char = map[i]

			if(char == delimiter[0]) {
				if(!nest_depth)	nest_a = i
				nest_depth++
			}
			if(char == delimiter[1])	{
				nest_b = i+1 //slice format
				nest_depth--

				if(!nest_depth && (nest_a || nest_a === 0) )
					res_list.push({
						'0': map.slice(nest_a, nest_b),
						'1': map.slice(nest_a+1, nest_b-1),
						index: nest_a,
					})
			}
		}

	res_list.forEach(function(res) {
		res.value = (exclude)? res[1]: res[0]
		res.range = [res.index + ((exclude)? 1:0) ]
		res.range.push( res.range[0] + res.value.length )
	})

	// console.log('balanced strip', opts, res_list, delimiter)
	return res_list
}

/**
@memberof NEngine.GLNSLCompiler.Util
@class SymbolTree
@desc This was created in a moment of despair ... mmmm, maybe is just a
	middle-level tool
	<br/>
	Helps handling source mapping, stripping, scaping, etc. Provides
	functions to translate on its context (subsections of it, etc) like
	interpolate. </br> </br>
	the level of source mapping it makes is low, doesnt create recursive
	SymbolTree trees, but does create symbols trees (an internal shepherd would
	allow it, by indexing-trees, avoiding collisions on different
	symbol-tree tags)

@prop {String} src - Initial src of the tree
@prop {String} prefix - The prefix of the tree symbols in the parsed text,
	defaults to ''+this.shepherd_length when created
@prop {Object<Symbol_key, str>} symbols - Maps mapped source symbols into
  the src, each symbol contains the mapping into src from mapped
@prop {Integer} symbols_count - The number of symbols in the dictionary

@param {String} src -
*/
function SymbolTree(src) {
	if(!(this instanceof SymbolTree)) return new SymbolTree(src)

	this.prefix = '' + this.shepherd_length
	SymbolTree.prototype.shepherd_length += 1


	this.src = src
	this.symbol_table = {root: src}
	this.symbol_table_count = 0
}
SymbolTree.prototype = {
	/**
	@memberof NEngine.GLNSLCompiler.Util.SymbolTree.prototype
	@desc The symbol of the root node, defaults to 'root'
	@member {String}
	*/
	root_symbol: 'root',
	/**
	@memberof NEngine.GLNSLCompiler.Util.SymbolTree.prototype
	@desc The number of symbol trees currently existing
	@member {Integer}
	*/
	shepherd_length: 0,
	/**
	@memberof NEngine.GLNSLCompiler.Util.SymbolTree.prototype
	@desc The pair of delimiters to use for symbols, defaults to
		['"', '"']
	@member {String[]}
	*/
	symbol_delimiter_pairs : ['"','"'],
	/**
	@memberof NEngine.GLNSLCompiler.Util.SymbolTree.prototype
	@desc A dict of <left-delimiter, [left-delimiter, right-delimiter]> ,
		for example: delimiter_pairs['{'] -> ['{', '}']
	@member {Object<String,String[]>}
	*/
	delimiter_pairs: {
		'(': ['\\(','\\)'],
		'{': ['\\{','\\}'],
		'[': ['\\[','\\]'],
	},
	/**
	@memberof NEngine.GLNSLCompiler.Util.SymbolTree.prototype
	@desc the unscaped version of delimiter_pairs
	@member {Object<String,String[]>}
	*/
	delimiter_pairs_unscaped: {
		'(': ['(',')'],
		'{': ['{','}'],
		'[': ['[',']'],
	},
	/**
	@memberof NEngine.GLNSLCompiler.Util.SymbolTree.prototype
	@desc default delimiter to use when none is given, commonly '('
	@member {String}
	*/
	delimiter_default : '(',

	/**
	@memberof NEngine.GLNSLCompiler.Util.SymbolTree.prototype
	@desc root string, from root tree symbol, changes it to value if given
	@param {String} value - new value
	@return {String} root - the root string
	*/
	root: function root(value) {
		if(value != undefined)
			return this.symbol_table[this.root_symbol] = value

		return this.symbol_table[this.root_symbol]
	},

	/**
	@memberof NEngine.GLNSLCompiler.Util.SymbolTree.prototype
	@desc Adds a symbol to the map, reading the node "symbol_from", scaping the
		content defined by "target", which can be an index pair [a,b] or
		the content itself.
	@param {String} symbol_from - The symbol to modify
	@param {String|Integer[]} target - The phrase to scape by symbol, if index
		pair, the pair is in the format of slice. 'a' included, 'b'-1
		included.
	@return {String|null} symbol_to - created symbol or null
	*/
	addSymbol: function addSymbol(symbol_from, target) {
		var str = this.symbol_table[symbol_from],
			mapped, symbol_value,

			symbol_key = this.prefix+'_'+this.symbol_table_count,

			symbol_delimiter = this.symbol_delimiter_pairs,
			symbol_key_placeholder = symbol_delimiter[0]+
				symbol_key+
				symbol_delimiter[1]

		if(target && str) {

			if(target instanceof String || typeof target == 'string' &&
				str.match(target)) {

				mapped = str.replace(target, symbol_key_placeholder)

				symbol_value = target
			}

			if(Array.isArray(target)) {
				mapped = str.slice(0, target[0]) + symbol_key_placeholder +
					str.slice(target[1])

				symbol_value = str.slice(target[0], target[1])
			}

			if(mapped) {
				this.symbol_table[symbol_from] = mapped
				this.symbol_table[symbol_key] = symbol_value
				this.symbol_table_count++
				return symbol_key
			}

		}
		return null
	},

	/**
	@memberof NEngine.GLNSLCompiler.Util.SymbolTree.prototype
	@desc returns symbols found in str as an array of the regexp exec results,
		witch each result now having properties symbol = symbol name and
		symbol_value = symbol value.
	@param {String} str - the string to search for symbols
	@return {Array<RegExp_result>}
	*/
	symbols: function symbols(str) {
		var syms = [], sym,
			reg =RegExp(''+
				this.symbol_delimiter_pairs[0] +
				'('+this.prefix+'_.*?)'+
				this.symbol_delimiter_pairs[1]
				, 'gi'),
			res

		while(res = reg.exec(str))
			if(sym = this.symbol_table[res[1]]) {
				res.symbol = res[1]
				res.symbol_value = sym

				syms.push(res)
			}

		return syms
	},

	/**
	@memberof NEngine.GLNSLCompiler.Util.SymbolTree.prototype
	@desc interpolates all the symbols in the str
	@param {String} str - string to inteprolate
	@param {Integer} [depth=-1] - Number of times to interpolate string,
		values none == -1 : interpolates until no more variables are found
	@return {String}
	*/
	interpolate: function interpolate(str, depth) {
		var syms,
			i, l

		depth = depth || -1

		//while deep enough, extract symbols
		while( ((depth == -1)? 1: depth--) && (!syms || syms.length) ) {
			syms = this.symbols(str)

			for(i=0, l=syms.length; i<l; i++)	//for each symbol, replace
				str = str.replace( syms[i][0], syms[i].symbol_value)
		}

		return str
	},

	/**
	@memberof NEngine.GLNSLCompiler.Util.SymbolTree.prototype
	@desc Takes the strings delimited by the delimiter off, into a mapping
	avoids scaped delimiters and transparently resolves nested expressions
	including them in each strip
	( 'aaa(asd(ss)asd)ld(sf)sd' => 'aaa"symbolkey"ld"symbolkey2"sd' ),
	stripts every encounter
	@param {String} str - the tring to strip
	@param {Object} opts - the option object
	@param {String|String[]} [opts.delimiter=SymbolTree.prototype.delimiter_default] - the delimiter to
		search, if its an array, be it like [delimiter_left, delimiter_right]
	@param {Boolean} [opts.exclude=false] - if to exclude the delimiters in the strip

	@return {SymbolTree} this
	*/
	strip: function strip(opts) { opts = opts || {}
		var strips = strip_balanced(this.root(), opts),
			self = this


		strips.reverse().forEach( function(strip) {
			self.addSymbol(self.root_symbol, strip.range)
		})

		return this
	},

	/**
	@callback SourceTreeMapFunc
	@param {String} acumulator - the string being mapped
	@param {String}
	@return {String} acumulator - you have to return it
	*/
	/**
	@memberof NEngine.GLNSLCompiler.Util.SymbolTree.prototype
	@desc cant remember why this, delete?
	@param {Function} func -
	@return {String|undefined} Mapped src, undefined if no function or str
	*/
	map: function map(func, str) {
		str = str||this.root()
		if(!str || !func) return undefined

		this.symbol_table(str).map(function(e){
			return e.symval
		}).reduce(function() {

		})
	}
}
/**
	TODO: real sourcetree, for generalc compiler structure
*/


return {
	serialize : serialize,
	is_scaped : is_scaped,
	strip_balanced: strip_balanced,
	SymbolTree : SymbolTree,
	Grammar : Grammar,
}
})()

	module.Util = Util
	 var Expression = (function ExpressionLoader() {
/**
@memberof NEngine.GLNSLCompiler
@class Expression
@desc Used to create recursive translable expressión trees
	a and b point to expresions (variable expression) and in
	operator == null this.a contains a variable ("literal expression")
	if operator == 'function' then a points to function and b to parametters
	expressions. If src is given, executes interpret on exit


@prop {String} src - source code
@prop {String} content - str content of the expression
@prop {Boolean} inside_parenthesis=false - Tells if expression is inside
	parenthesis. this.content contains the unparenthesized version

@prop {Sentence} sentence - The sentence that contains the expression
@prop {Scope} scope - expression scope

@prop {(Variable|Expression)} a - variable, function or expression
@prop {(Variable|Expression)} b - variable, expression or parameters
	expression array
@prop {String} operator - the operator if any, or 'function'

@param {Object} opts - options object
@param {String} opts.src=null
@param {Sentence} opts.sentence=null
@param {Scope} opts.scope=sentence.scope

@param {Mixed} opts.a=null
@param {Mixed} opts.b=null
@param {String} opts.op=null - operator
*/
function Expression(opts) {
	this.src = opts.src || null
	this.content = null
	this.inside_parenthesis = false

	this.sentence = opts.sentence || null
	this.scope = opts.scope || opts.sentence.scope || null

	this.a = opts.a || null
	this.b = opts.b || null
	this.operator = opts.op || null

	if(this.src)
		this.interpret()
}

Expression.prototype = {
	/**
	@memberof NEngine.GLNSLCompiler.Expression.prototype
	@desc each element its a regexp + operator identifier
	for each expression, there are 3 parenthesis operator a, operator b, and
	operation
	*/
	operators: [
		{
			id: '=',
			//EQUALITY REQUIRES THAT LEFT SIDE OPERAND ITS THE VARIABLE
			//CONTAINER AND NOT ITS VALUE, FOR ELEMENT SELECTION, THIS CHANGES
			//NORMAL TRANSLATION.
			reg: /([^\+\-\^\|&!=<>%\*/](?:\+\+)*(?:--)*)(=)([^=])/gi,
		},
		{
			id: '+',
			reg: /([^\+](?:\+\+)*)(\+)([^\+=])/gi,
		},
		{
			id: '-',
			reg: /([^\-](?:--)*)(-)([^-=])/gi,
		},
		{
			id: '*',
			reg: /()(\*)([^=])/gi,
		},
		{
			id: '/',
			reg: /()(\/)([^=])/gi,
		},
	],

	/**
	* @memberof NEngine.GLNSLCompiler.Expression.prototype
	* @desc the variable type of the object returned by the expressión
	*/
	vartype: function vartype() {

		return {
			replicates: false
		}
	},
	/**
	* @memberof NEngine.GLNSLCompiler.Expression.prototype
	* @desc indicates wheter the operands-operand combination implicates a
	* right-operator replication,this is for optimization purposes
	* avoiding expresion operations multiplication on after-compilation
	* sentences
	*/
	replicates: function replicates() {

	},
	/**
	* @memberof NEngine.GLNSLCompiler.Expression.prototype
	* @desc first, if this is a parenthesis, cuts the borders so it can process
	* the content. Then, converts all parenthesis into special variables
	* so they dont interfere with operators on this precedence layer
	* then splits the text by the lower precedence operator, and starts
	* the new expressions sending them the code with the parenthesis instead
	* of the variables
	*/
	interpret: function interpret() {
		var re, res, i, l, self = this,
			src = this.src, src_map, arguments_map,
			operators = this.operators, op,
			SymbolTree = Util.SymbolTree

		console.log('expression: variable expression input: ', this.src )

		//delete containing parenthesis and mark this as being
		//inside_parenthesis
		re = /^\s*\((.*)\)\s*$/gi
		while( res = re.exec(src) ) {
			this.inside_parenthesis = true
			src = res[1]
		}
		this.content = src

		//create parenthesis table
		// console.log('empezando',src)
		src_map = new SymbolTree(src)
		src_map.strip('(').strip('[')
		src = src_map.root()
		// console.log(src, src_map)

		//split by the lower operator precedence, if found, start resolving
		//recursively
		for(i = 0, l = operators.length; i < l; i++) {
			op = operators[i]
			res = op.reg.exec(src)

			if(res) {
				this.operator = op

				this.a = new Expression({
					sentence: this.sentence,
					src: src_map.interpolate(
					src.substr(0, res.index+res[1].length) )
				})

				this.b = new Expression({
					sentence: this.sentence,
					src: src_map.interpolate(
					src.substr(res.index+res[1].length +res[2].length) ),
				})

				i=l
			}
		}

		//when there was no operator found, this is a variable or a literal
		//or a function
		if(!this.a) {
			res = (/^\s*([_a-z][_a-z0-9]*)\s*(\(([^]*)\))*/gi).exec(src)
			console.log('expression: variable exp', src, res)

			if(res && res[1] && !src.match('\\[')) {	//isnt a literal
				this.a = this.scope.getVariable(res[1])
				this.op = 'variable'
				console.log('expression: getting variable', res[1], this.a)

				if(res[2]) { //function
					this.b = src_map.interpolate(res[3])	//get arguments
					//scape expressions
					arguments_map = new SymbolTree(this.b).strip('(').strip('[')
					//map expressions from splited arguments
					this.b = arguments_map.root().split(',').map(function(e) {
						return new Expression({
							sentence: self.sentence,
							src: arguments_map.interpolate()
						})
					})

					this.op = 'function'
				}
			}
			else {
				this.a = src	//literal
				this.op = 'literal'
			}
		}

	},
	/**
	* @memberof NEngine.GLNSLCompiler.Expression.prototype
	* @desc returns an expression translation object
	* it contains:
	*	already translated sentences, that go before
	*	current translating sentence (can be an array)
	*	current vartype of the expression
	*/
	translate: function() {

	},
}

return Expression
})()
/**
	TODO Extremly important (next version deps):
	- define constructor dynamic_variables (ready)
	- connect dynamic_variables to getVariable (ready)
	- test first variable declaration translations (current)
		- making expression and expression translation work (current)
	- translate first expressions
	- start translating full code

	Added variables.identifierToken:
		suṕports multiple function on same variable definition
		empty qualifiers encode free-vaue generalizattion on generators
		and scope

	For funcion translation:
		treat return value as parametter if bigger (maybe
			already defined caches)
		add function_inline object to inline-translating functions:
			function_inline: {
				[translate: ] //custom translator
				type: 'fallback_parametrization' //vec5() to
												//	vec4, type 1: 1 sentences
				fallback: 'vec'	//each vecn parametter
			}
			used in translate
		add general function call expression translation:
			parametrer expansion
		add function identifier token to identifiers dict:
			calculated from qualifiers (general identifier function from
			variable, takes qualifiers, name params), add function to generate
			regexp to those tokens (for dyn-built-in regexp prop) from general
			qualifiers
			new token proposal: function:qualifier1,qualifier2,..
			use old syntax on no candidate as fallback
				new politik be lik:
					full function qualified identifier: get that
					just name -> match any qualifications :3
		add dynamic built-in function include() function, called in built-in
			function creation, adds function code to scope.precode
		add firsts built-in from dyn-built-in functions (standard defined)


Important (relevant for stability) (cant the remember ths note):
	- check scope of builtin variables and getVariable interaction
		with getVariableBuiltin

*/

	module.Expression = Expression
	var Variable = (function VariableLoader() {


/**
@memberof NEngine.GLNSLCompiler
@class Variable
@desc Represents a variable in a scope

@prop {Sentence} sentence - The sentence containing var declaration
@prop {Integer} sentence_place - Place in the declaration sentence
@prop {Scope} scope - Container Scope

@prop {String} type - "primitive" or "function"
@prop {Object} type_data: object with more specific datatype data
  for primitives is on the format provided by Vartypes.types
@prop {Array} qualifiers - array with datatype dependant data <br/>
  primitives: variable declaration qualifiers <br/>
      format: [invariant, storage, precision, typeCodeName] <br/>
  function: return and parameters variables qualifiers <br/>
      format: [return_qlfs, params__qlfs [..]]
@prop {String} value - Given value, if this is a literal
  variable (value variable)
@prop {String} name - Variable name

	@param {Object} opts - The options object
	@param {Sentence} opts.sentence - The sentence containing var declaration
	@param {Integer} opts.sentence_place -
	@param {Scope} opts.scope -

	@param {String} opts.type - "primitive" or "function"
	@param {String[]} opts.qualifiers - ['invariant', 'storage', 'precision', 'datatype']
	@param {Function} opts.translate - for dynamic functions

	@param {String} opts.value -
	@param {String} opts.name -
*/
function Variable(opts) {
	this.sentence = opts.sentence || null
	this.sentence_place = opts.sentence_place || 0
	this.scope = opts.scope || (opts.sentence)? opts.sentence.scope : null

	//typological data
	this.type = opts.type || null
	if(opts.translate)	//respect prototype defined
		this.translate = opts.translate
	this.qualifiers = opts.qualifiers || null
	this.type_data = null
	this.built_in = opts.built_in || false	//if it is already built_in in glsl

	//variable specific
	this.value = opts.value || null
	if(this.qualifiers && this.qualifiers.length) {
		console.log('name from qualifiers')
		this.name = this.qualifiers[4]
	}
	else
		this.name = opts.name || ''

	if(this.qualifiers && this.type) {
		if( this.type == 'primitive' )
			this.type_data = VarTypes.type(this.qualifiers)

		if(this.name)	this.declare()
	}
}
Variable.prototype = {
	/**
	@memberof NEngine.GLNSLCompiler.Variable.prototype
	@desc returns the identifiers token associated to this var
	TODO: add function token id (handles operator overloading)
	*/
	identifierToken: function identifierToken(qualifiers) {
		qualifiers = qualifiers || this.qualifiers
		return this.name
	},
	/**
	@memberof NEngine.GLNSLCompiler.Variable.prototype
	@desc registers to the variable dictionary in the scope
	@throws Error if its identifier was already declared
	*/
	declare: function() {
		if(!this.scope || !this.name) return

		if(this.scope.variables[this.name])
			throw 'variable '+this.name+' already declared'


		//register to variable scope
		this.scope.variables[this.name] = this
	},
	/**
	@method translate
	@memberof NEngine.GLNSLCompiler.Variable.prototype
	@desc For dynamic functions, translates function
	@param {Expression[]} params - the parametters as expression trees
	*/
	translate: function translate() {
		return this.type_data.translate()
	},
	/**
	@memberof NEngine.GLNSLCompiler.Variable.prototype
	@return {Boolean} translatable - if it needs/is translatable
	*/
	translatable: function tanslatable() {
		//TODO qualifiers -> then translatable
		// return this.type_data.translatable()
	}
}

return Variable

})()

	module.Variable = Variable
	/**
@namespace Vartypes
@memberof NEngine.GLNSLCompiler
@desc Contains all operation-resolving code, dependand on the specific
  variable type
*/
var VarTypes = (function() {
/**
@memberof NEngine.GLNSLCompiler.Vartypes
@class VarType
@desc Its prototype depends on the specific vartype
@prop {Object} operations - Operation handler functions
@prop {String} codename - A unique identifier for the vartype, calculated has
precision + prim_type
@prop {RegExp} type - The regexp that matches the type.

*/
var type, types = {
		/**
		They fill the type_data of variables, help sharing
		code among different configurations of primitives for the same
		primitive datatypes <br/>

		*/
		vecn: {
		  exp: /vec(\d+)/gi,
		  /**
		  * creates type info from variable declaration information
		  */
		  constructor : function (qualifiers) {

		  },
		  /**
		  translate this variable
		  */
		  translate: function translate() {

		  },
		  /**
		  returns array containing each variable component
		  */
		  variable_variables: function variable_variables() {

		  },
		  operations: [
				{
					ops: ['[+-]'],
					replicates: function() {

					},
					/**
					* expresion operator is an expression!!, not a variable!!
					* expresions only contain datatype info and expresion identifier
					* which can be a variable identifier or a transparent temporary
					* identifier for temporal operantions cache
					*
					* into_variable can be a variable name or false,indicating to
					* return an array of the sentences without asignment instead
					*/
					translate: function (operation, operator_b_translation, operator_a) {

					}
				}
			]
		},
		matn_m: {
			exp: /mat(\d+)(_(\d+))*/gi,
			/**
			Sets codename from variable
			*/
			constructor: function(qualifiers) {
				//if(reg_res[])
			},
			operations: {
				'\*': function multiply(operation, expresion_operator, into_variable) {
				}
			},
			valueAt: function nmat_at(i,j,n) {
				var p = j*n+i,
					mat = Math.floor( p/16 ); //matrix holding position

				p = mat*16 - p;
				j = Math.floor( p/4 );
				i = p - j*4;

				return ''+mat+'['+i+']['+j+']';
			}
		},
		scalar: {
			exp: /(bool|int|float)/gi,
			constructor: function(qualifiers) {

			}
		},
	},
	prototype = {
		/**
		@memberof NEngine.GLNSLCompiler.Vartypes.VarType.prototype
		@desc Returns the codename asociated to the qualifiers or the
			vartype
		@param {String[]} qualifiers - ['invariant', 'storage', 'precision', 'datatype']
		@return {String} codename - undefined otherwise
		*/
		codename: function codename(qualifiers) {
			if(!qualifiers) 	qualifiers = this.qualifiers

			if(!qualifiers) return undefined
			return (qualifiers[2] || '')+'_'+ qualifiers[3]
		},
		/**
		@memberof NEngine.GLNSLCompiler.Vartypes.VarType.prototype
		@desc Translates the datatype of the vartype if needed. If datatype is
			given, translates it and returns it, here you check the datatypes are
			.
		@param {String} [datatype]
		@return {Vartype|String} This, or the translated datatype
		*/
		translateType: function translateType(datatype) {
			var type = datatype
			if(!type)
				type = this.qualifiers[3]

			//TODO translateType

			if(datatype) return type

			this.qualifiers[3] = type
			return this
		}
	}

/**
Append to each type constructor, the type name to the resulting type object
*/
for(type in types)
	types[type].constructor = (function() {
		var type_name = type,
			type_obj = types[type],
			type_constructor = type_obj.constructor,
			//same as type_obj but with prototype = prototype
			final_type_obj = Object.create(prototype)

		Object.keys(type_obj).forEach(function(k) {
			final_type_obj[k] = type_obj[k]
		})

		function VarType(qualifiers, scope) {
			if( !(this instanceof VarType) )	return new VarType(qualifiers)

			type_constructor.call(this, qualifiers)

			this.qualifiers = qualifiers.slice()
			this.type = type_name
			this.translateType()

			this.scope = scope
		}
		VarType.prototype = final_type_obj

		return VarType
	})()

/**
@memberof NEngine.GLNSLCompiler.Vartypes
@desc Gets type associated to qualifiers
@param {String[]} [qualifiers] - ['invariant', 'storage', 'precision', 'datatype']
@return {VarType|undefined} type
*/
function get_type(qualifiers) {
	if(!qualifiers) return undefined

	var datatype,
		type, prim_qualifier = qualifiers[3],
		reg_res

	console.log('get type: ', prim_qualifier)

	for(datatype in types) {
		type = types[datatype]

		type.exp.lastIndex = 0
		reg_res = type.exp.exec(prim_qualifier)
		console.log(reg_res, type.exp, prim_qualifier)

		if(reg_res)
			return type.constructor( qualifiers )
	}
}

return {
	types: types,
	type: get_type,
	translateType: prototype.translateType,
	codename: prototype.codename,
	prototype: prototype
}
})()

	module.VarTypes = VarTypes
	var Sentence = (function SentenceLoader() {


/**
@memberof NEngine.GLNSLCompiler
@class Sentence
@desc represents a single glsl sentence has inf. about variables,
  post-translation, and source location every range is in global (rootScope)
  coordinates, also represents a scope in the scope chain, so it handles
  its translation

@prop {String} src - Sentence code excluding semicolon
@prop {Scope} scope - containing scope
@prop {Integer[]} range - the indexes that limit this.src inside source code
@prop {Integer} number - the index of this sentence in the scope sentence list;

@prop {String} type - declaration, expression (this has subtypes: f.call,
  operation, etc), null, etc <br/>
    null represents an instruction that doesnt needs translation or that does
    nothing at all
@prop {Scope} thisScope - filled only on sentence-block containing sentences
@prop {Expression|Expression[]} components - expressions in variables
	declaration, sentences in flow modifiers
@prop {Variable[]} variables - The variables declarated

	@param {Object} opts - The options object
	@param {String} opts.src
	@param {Scope} opts.scope - only scope containing sentences (ifs, fors, etc)
	@param {Integer[]} opts.range
	@param {Integer} opts.number
	@param {String} opts.type
	@param {Scope} opts.thisScope
	@param {Expression|Expression[]} opts.components
*/
function Sentence(opts) {
	this.src = opts.src
	this.scope = opts.scope || null
	this.range = opts.range || null
	this.number = opts.number || -1

	this.type = opts.type || null
	this.thisScope = opts.thisScope || null

	this.components = opts.components || []
	this.variables = []
	this.strings = opts.strings || []

	//result sentence
	this.out = null


	if(this.src && this.scope && this.number) {
		this.scope.addSentence(this)
		this.interpret()
	}
}
Sentence.prototype = {
	/**
	@memberof NEngine.GLNSLCompiler.Sentence.prototype
	@desc fills the sentence information interpreting the sentence str components
	list, its type and type related cfg, recognizes the sentence type and
	configures it accordingly currently only types declaration, expression and
	null are implemented, expression sentences include assignation
	*/
	interpret: function interpret() {
		var src = this.src, re, str, str_map, res, i, opts, srcmap,
			lists = Util.Grammar.grammar_lists,
			variable, variables = this.variables, expression;

		if ( src.match(/^\s*for/gi) ){ //for
			this.type = 'for'
		}
		else if ( src.match(/^\s*while/gi) ){ //while
			this.type = 'while'
		}
		else if ( src.match(/^\s*if/gi) ){ //if
			this.type = 'if'
		}
		else if ( src.match(/^\s*else/gi) ){ //else
			this.type = 'else'
		}
		else if ( src.match(/^\s*switch/gi) ){ //switch
			this.type = 'switch'
		}
		else if (this.thisScope) {
			//structs also are here
			this.type = 'function'
		}
		/*
		detects declaration
		initiates scope variables
		*/
		else if( res = RegExp(
				'\\s*(invariant)*\\s*('+lists.storage_qualifiers.join('|')+')*\\s*'+
				'('+lists.precision_qualifiers.join('|')+')*\\s*'+
				'('+lists.datatypes.join('|')+')*\\s*([^]*)', 'gi'
			).exec(src) ) {
			console.log(res)

			this.type = 'declaration'

			//verify sentence
			// format: invariant, storage, precision, datatype,
			// content (converted to name, before var const)
			res.shift()
			res[0] = res[0] || null
			res[1] = res[1] || 'none'
			if(!res[3]) throw new Error('no datatype on variable declaration')

			//variable constructor data
			opts = {
				sentence: this,
				type: 'primitive',
				qualifiers: res,
			}

			//scape parenthesis, dynamic data
			str_map = new Util.SymbolTree(res[4])
			str_map.strip('(')

			//split each variable (by ,) and work-out expressions for them.
			str = str_map.root()
			re = /([^,]+)/g

			while(res = re.exec(str)) {

				//construct variable (copy-in memory qualifiers)
				opts.sentence_place = variables.length
				opts.qualifiers = opts.qualifiers.slice()
				opts.qualifiers[4] = (/\w+/g).exec(res[0])[0]

				variable = new Variable(opts)
				variables.push(variable)

				console.log('sentence: variable declared:',res, opts, variable, (/^\s*\w+/g).exec(res[0])[0])

				//construct associated expression
				expression = null
				if( res[0].match('=') ) {
					expression = new Expression({
						sentence: this,
						src: str_map.interpolate(res[0]),
					})
					console.log('sentence: expression: ', expression, str_map, res[0], str_map.interpolate(res[0]))
				}
				this.components.push(expression)
			}
		}
		else if( src.match(/^\s*\w+\s*/gi) ) { //expression
			this.type = 'expression'

		}
		else
			this.type = null
	},
	/**
	@memberof NEngine.GLNSLCompiler.Sentence.prototype
	@desc Tells you if this needs translation
	@return {Boolean}
	*/
	needsTranslation: function() {
		if(this.type == 'declaration' || this.type == 'expression') {
			this.variables.forEach(function(e){
				if(e.translatable()) return true
			})
		}

		return false
	},
	/**
	@memberof NEngine.GLNSLCompiler.Sentence.prototype
	@desc generates a valid GLSL sentence (or group of sentences) that mimics the
	functionality on this sentence and stores it in this.out as a str. It works
	differently on each sentence type
	@return {String} translated
	*/
	translate: function() {

	}
}
return Sentence
})()

	module.Sentence = Sentence
	var Scope = (function ScopeLoader() {

/**
@memberof NEngine.GLNSLCompiler
@class Scope
@desc Represents a recursive Scope tree. <br/> <br/>
The rootScope contains the cache of the temp variables
used in intermediate operations (on translated code). This cache
gets added to the begining during translation. It also holds functions
and code automatically generated at the beginning (precode).

@prop {CodeTree} code_tree - On rootScope, points to container CodeTree
@prop {Scope} rootScope - Root Scope of the tree
@prop {String} src - Contained code, currently only root-scope has

@prop {Scope} parent - Parent Scope
@prop {Scope[]} childs - Child Scopes

@prop {Integer[]} range - Start and end index of code in rootScope.src
@prop {Object.<String, Variable>} variables - Dictionary object for scope variables
@prop {Object.<String, Variable>} variables - scope variables generated on ask
	constructor functions, dim-dependant functions, etc
@prop {Sentence[]} sentences - Holds scope sentences
@prop {String[]} sentences_precode - The precode strings
	(TODO: change to 'Sentences') precode is code that exists previously to the content and,
	doesnt get affected by reordering of its sentences.

@prop {Object.<TypeCodeName, CacheData>} cacheVariables -  contains
current new temp_variables for extended datatypes
@prop {Object} cacheVariables.typeCodeName - A specific datatype cache
@prop {Variable[]} cacheVariables.typeCodeName.vars - The cache variables
@prop {Variable[]} cacheVariables.typeCodeName.history - The cachevariables
arranged by last used
*/
function Scope(opts) {
	this.code_tree = null

	this.rootScope = null
	this.src = null

	this.parent = null
	this.childs = []

	this.range = null
	this.variables = {}
	this.dynamic_variables = {}
	this.sentences = []
	this.sentences_precode = []

	this.cacheVariables = {}

	/**
	built-in variables-functions (given by standard)

	buit-in functions translate function:
		translates into expression translation object
	recieves expressions list
	*/
	this.built_in = {
		variables: {},
		dynamic_variables: {},
	}
}
Scope.prototype = {
	/**
	@memberof NEngine.GLNSLCompiler.Scope.prototype
	@desc Correctly sets the parentScope
	@param {Scope} parent - new parent
	@return this
	*/
	setParent: function(parent) {
		this.unsetParent()
		this.parent = parent
		parent.childs.push(this)

		this.rootScope = parent.rootScope || parent

		return this
	},
	/**
	@memberof NEngine.GLNSLCompiler.Scope.prototype
	@desc Correctly unsets the parentScope: removes itself from childs array.
	@return this
	*/
	unsetParent: function() {
		if(!this.parent) return

		this.parent.childs.splice(this.parent.childs.indexOf(this),1)
		this.parent = null

		return this
	},
	/**
	@memberof NEngine.GLNSLCompiler.Scope.prototype
	@desc Recursively in the scope tree searches the variable, takes built-in
	into account.
	@param {String} varname - Target variable name
	@return {Variable} Return null if it cant be find
	*/
	getVariable: function(varname) {
		var scope = this, variable

		while(scope) {
			if(variable = scope.variables[varname]) break

			scope = scope.parent
		}

		if(!variable)
			return this.getVariableBuiltin(varname)

		return variable
	},
	/**
	@memberof NEngine.GLNSLCompiler.Scope.prototype
	@desc Get the variable from the builtin, or dynamic generated builtin
	@param {String} varname - Target variable name
	@return {Variable} Return null if it cant be find
	*/
	getVariableBuiltin: function(varname) {

	},
	/**
	@memberof NEngine.GLNSLCompiler.Scope.prototype
	@desc Generate a dynamic variable if it matches a dynamic variable type, and
	adds it to the builtin variables, returning it
	@param {String} varname - Target variable name
	@return {Variable} Return null if it cant be find
	*/
	ensureVariableDynamic: function(varname, opts) {
		opts = opts || {}

		var dyn = this.getVariableDynamic(varname), generated

		if(!dyn)	{
			console.log('variable missed on ensureVariableDynamic', varname, dyn)
			return undefined
		}

		//generate, modify, and return
		generated = dyn.generator.gen(dyn.reg_res)

		//apply modifications to var according to opts
		if(generated.include_code && !opts.ignore_includes)
			generated.include()

		if(opts.ignore_inline)
			delete generated.function_inline

		if(opts.built_in)
			generated.built_in = true

		this.built_in.variables[generated.identifierToken()] = generated
	},
	/**
	@memberof NEngine.GLNSLCompiler.Scope.prototype
	@desc Gets a dynamic_variable matching a variable name or general qualificated
	name.:
	@param {String} varname - Target variable name
	@return {Variable} Return null if it cant be find
	*/
	getVariableDynamic: function(varname) {
		//todo: implement different varname formats (qualifiers)
		var dyns = this.built_in.dynamic_variables, dyn,
			res

		for(dyn in dyns) {
			dyn = dyns[dyn]
			dyn.regexp.lastIndex = 0
			res = dyn.regexp.exec(varname)

			if( res )
				return {generator:dyn, reg_res:res}
		}
	},
	/**
	@memberof NEngine.GLNSLCompiler.Scope.prototype
	@desc If this scope is the scopeRoot or not
	@return {Boolean} isScopeRoot
	*/
	isRoot: function() {
		return !this.rootScope || (this.rootScope == this)
	},
	/**
	@memberof NEngine.GLNSLCompiler.Scope.prototype
	@desc Ensures that a given type has its cache variables instantiated for
	operations upon it, this is useful only during translation and final
	code writting, indexes them by codename. <br/>
	Adds them to variables array (avoid colisions) and cacheVariables
	(inform cache creation) sentence array. This affects only rootScope
	(only a single copy of each typecache is necessary) <br/> <br/>
	cache variable names: ___GLNSL_cache_(typeCodeName)_(cacheindex)
	@param {Variable} variable - The variable to ensure cache, needs to
	have its qualifiers, and type_data set
	*/
	ensureTypeCache: function ensureTypeCache(variable) {
		if( !this.isRoot() )
			return this.rootScope.ensureTypeCache(variable)

		var cache, i, l, type=variable.data_type,
			codename = type.codename()

		if(cache = this.cacheVariables[codename]) return

		cache = this.cacheVariables[codename] = {
			vars: [],
			history: []
		}

		//create cache
		for(i=0,l=3; i<l; i++) {
			cache.vars.push(
				Variable({
					scope: this,
					type: 'primitive',
					qualifiers: [null, 'none',  //those arent relevant to cache scoping
						variable.qualifiers[2],
						variable.qualifiers[3]],
					name: '___GLNSL_cache_'+ codename +'_'+i
				})
			)
			cache.history[i] = cache.vars[i]
		}

	},
	/**
	@memberof NEngine.GLNSLCompiler.Scope.prototype
	@desc Iterates over the cached variables to avoid dataloss on
	two-handed cache operations (they require 3 cache vars)
	@param {Variable} variable - Contains datatype description
	(precision+datatype)
	@return {Variable} variable - The cache variable you needed
	*/
	getTypeCache: function getTypeCache(variable) {
		this.ensureTypeCache(variable)
		var codename = variable.data_type.codename(),
			cache = this.cacheVariables[codename],
			res = cache.history.shift()

		cache.history.push(res)

		return res
	},
	/**
	@memberof NEngine.GLNSLCompiler.Scope.prototype
	@method precode
	@desc updates precode_, returns pre-code sentences in translated text
		format, using sentences_precode
	@return translated pre-code sentences
	*/
	precode: function (cached) {
		if( !this.isRoot() )
			return this.rootScope.precode(cached)

		if(cached) return this.precode_
		return this.precode_ = this.sentences_precode.join(' \n')
	},
	/**
	@memberof NEngine.GLNSLCompiler.Scope.prototype
	@method addPrecode
	@desc adds a sentence to the rootScope.sentences_precode array
	*/
	addPrecode: function(code) {
		if( !this.isRoot() )
			this.rootScope.addPrecode.apply(this, arguments)

		if(!(code instanceof String || typeof code == 'string'))
			throw 'no-string type in addPrecode'

		this.sentences_precode.push(code)
	},
	/**
	@memberof NEngine.GLNSLCompiler.Scope.prototype
	@method addSentence
	@desc adds a sentence to the current scope.sentences array
	*/
	addSentence: function(sentence) {
		sentence.number = this.sentences.push[sentence]
	},
	/**
	@memberof NEngine.GLNSLCompiler.Scope.prototype
	@method addBuiltinGLSL
	@desc generates the built-in variables of the scope. Those objects arent
	 	a singleton in case of multiple codes on different versions of GLSL,
		like keep generating those objects dynamically.
	*/
	addBuiltinGLSL: function() {
		var variables = {
				/**
					Those variables get translated directly
				*/
				'gl_Position': new Variable({
					type: 'primitive',
					qualifiers: []
				}),
				//TODO: change this into a function initiating first non-dynamic
				//built in functiomns from dyn-built-in defined ones
				// 'length' new Variable({
				// 	type: 'function'
				// })
			},
			/**
		  	  dictioary of built-in variables that are generated on request

		  	  each one has:
		  	  	matching regexp
		  		generator functiom
		  			generator functions have to be called from a scope
		  	  */
			dyn_variables = {
				/**
				N-Vector constructor function
				translates into a n-dim vector constructor function
				*/
				'vecn': {
					regexp: /^([bi]*vec)(\d+)$/gi,
					//generator function: scopevarinit is the tag
					//to recognize those generator functions
					gen: function vecn_constructor_scopevarinit(reg_res, opts) {
						var r =  new Variable({
							type: 'function',
							name: reg_res[0]
						})

						r.function_inline = {
							type: 'fallback_parametrization',
							fallback_max_dim: 4,
							fallback: reg_res[1]
						}

						return r
					}
				},
				'matn': {
					regexp: /mat(\d+)/gi,
					gen: function vecn_constructor_scopevarinit(reg_res) {
						var r =  new Variable({
							type: 'function',
							name: reg_res[0]
						})

						r.function_inline = {
							type: 'fallback_parametrization',
							fallback_max_dim: 4,
							fallback: 'mat'
						}

						return r
					}
				}
			},
			//dynamically defined already built-in variables
			already_built_in = [],
			variable, dyn_variable,
			this_variables = this.built_in.variables,
			this_dyn_variables = this.built_in.dynamic_variables,
			self = this

		//ad basic variables
		for(variable in variables)
			this_variables[variable] = variables[variable]

		for(dyn_variable in dyn_variables)
			this_dyn_variables[dyn_variable] = dyn_variables[dyn_variable];

		//add already built-in dynamically defined variables
		(['mat', 'vec', 'ivec', 'bvec']).forEach(function(prefix){
			already_built_in = already_built_in.concat(
				[2,3,4].map(function(e){return prefix+e}) )
		})

		console.log('right here', already_built_in)

		//for each identifier of the already built in variables defined in dyn-vars
		already_built_in.forEach(function( built_in ) {
			self.ensureVariableDynamic( built_in,
				{ ignore_includes: true, built_in: true })
		})

		console.log('added built-in', this.built_in)
	},
}

return Scope
})()

	module.Scope = Scope
	var CodeTree = (function CodeTreeLoader() {

/**
@memberof NEngine.GLNSLCompiler
@class CodeTree
@desc Represents the code structure as a scope recursive tree that contains
variables and sentences, it holds general tree data and objects, the
recursive scope chain is implemented by the scope objects starting
by the root "this.rootScope", it also gives you interfaces to manipulate it,
generate an interpretation (interpret()) of the source, translate it
(translate()) semantically-structurally, and then write it down (write()).
:TODO:implement SrcMap usage, to standarize code manipulation across different
	semantic-level objects

@prop {String} src - the source code for this tree
@prop {String} out - The translated output from the last usage
@prop {Scope} rootScope - The root of the scope tree, scope objects contain
  most of the relevant data: variables, sentences, etc.
@prop {Sentence[]} sentences - The sentences in the whole codetree, they also
  are indexed in their respective scopes, thought sentence.scope.sentences
*/
function CodeTree(src, js_variables) {
	if(!(this instanceof CodeTree))
		return new CodeTree(src, js_variables)

	this.js_variables = js_variables || {}
	this.src = {
		original: src,
		mapped: null,
		symbols: {
			strings: [],
		}
	}
	this.out = null

	this.rootScope = null
	this.sentences = []

	if(src)
		this.interpret()
}
CodeTree.prototype = {
	/**
	@memberof NEngine.GLNSLCompiler.CodeTree.prototype
	@member {Object<String,String>} prefix - Prefix configuration
	*/
	prefix: {
		variables: 'GLNSL_VAR_',
	},
	/**
	@memberof NEngine.GLNSLCompiler.CodeTree.prototype
	@method interpret
	@desc create scope tree and fills with sentences, also maps each string to
		a symbols in the src mapping, referenced has "string_number"

		TODO pass all transofgmrations to srcmap actions

	@param {String} src - The source code to interpret, this.src is default
	*/
	interpret: function interpret(src) {
		var r, reg, str,
			i, i_o, l, c,  //index, index_original, length, character
			in_string = false,
			in_string_scape,
			strings = [],
			strings_map,
			string,
			sentence, //holds last created sentence object
			index_a,  //start of current sentence ( for´s, if´s, etc, also count )
			scope_parent,
			scope_current

		if(!src) src = this.src.original
		else this.src.original = src

		// remove comments
		this.src.original = src = src.
			replace(/\/\*.*?\*\//gi, '').
			replace(/\/\/.*?\n/gi, '')

		//execute js
		reg = /'(.*?)'/gi
		while(r=reg.exec(src))
			//replace each captured js str with its execution
			this.src.original = src = src.

		replace(r[0], this.shader.js_execute(r[1]).res )

		strings_map = this.src.symbols.strings
		this.src.mapped = src

		this.rootScope = scope_current = new Scope()
		console.log('compiling')
		scope_current.addBuiltinGLSL()
		scope_current.src = this.src
		scope_current.range = [0]
		scope_current.code_tree = this

		for(i=0, i_o=0, l = src.length, sentence_number = 0, index_a = 0;
		i<l ; i++, i_o++) {

			c = src[i]

			//end string
			if(in_string) {
				if(c == in_string) {

					//handle scaped string delimitter
					in_string_scape = 0 //will contain number of scapes
					while(src[i-in_string_scape-1] == '\\')
						in_string_scape++

					if(in_string_scape%2) { //wasnt scaped

						string.range.push(i_o)
						string.value = src.substr(string.range_mapped[0],
						string.range_mapped[1] - string.range_mapped[0] + 1)
						//strip the string
						src = this.src.mapped = src
							.substr(0, string.range_mapped[0]+1) +
							(strings_map.length-1) +
							src.substr( string.range_mapped[1])

						//restore index, state
						i = string.range_mapped
						in_string = false
						continue
					}
				}
			}
			//start string
			else if(c == '"' || c == '\'') {
				in_string = c

				string = {
					value: null,
					range: [i_o], //the range on src.original
					range_mapped: [i] //the range on the src.mapped
				}
				strings.push(string)
				strings_map.push(string)
				string.range_mapped.push(
					i+ (''+(strings_map.length-1)).length + 1
				)
				continue
			}

			if(!in_string) {

				if(c == '{') {
					scope_parent = scope_current
					scope_current = new Scope()  //TODO:get scope from last sentence
					scope_current.setParent(scope_parent)
					scope_current.range = [i]
				}
				//{: to recognize also scope-creating sentences
				if(c == ';' || c == '{' || c == '}') {
					sentence = new Sentence({
						src: src.substr(index_a, i-index_a),
						range: [index_a, i],
						scope: (c=='{')? scope_parent: scope_current,
						thisScope: (c=='{')? scope_current: null,
						strings: strings,
					})
					this.sentences.push(sentence)
					index_a = i+1  //inmediatly after [{,}] symbol
					strings = []
				}
				if(c == '}') {
					scope_current.range.push(i)
					scope_current = scope_parent
				}

			}

		}
		scope_current.range.push(src.length - 1)
	},
	/**
	@memberof NEngine.GLNSLCompiler.CodeTree.prototype
	@desc detects sentences that use glnsl syntax or datatypes and ask them to
		translate
	*/
	translate: function translate() {
		if(!this.rootScope) return null
		var sentences = this.sentences, range,
			out = this.src.original

		console.log('codetree.translate: src', out)

		//for each sentence that needs translation
		sentences.reverse().forEach(function (sentence){
			if(sentence.needsTranslation()) {
				range = sentence.range
				//add translated sentence to previous non-translated content into out
				out = out.substr(0, range[0]) +
					sentence.translate() + out.substr(range[1]+1, out.length)
			}
		})
		console.log('codetree.translate: translated', out)

		//add precode
		out = this.rootScope.precode() + out
		console.log('codetree.translate: added precode', out)

		return this.out = out
	},
	/**
	* @memberof NEngine.GLNSLCompiler.CodeTree.prototype
	* @desc
	* it uses the translated sentences versions to generate an
	* updated src string
	* TODO separate code sintesis from code translation
	* code translation should be able to detect specific regions that have
	* changed, and write also should be
	*/
	write: function write() {

	},
}

return CodeTree
})()

	module.CodeTree = CodeTree
	var Shader = (function ShaderLoader() {

/**
@class Shader
@memberof NEngine.GLNSLCompiler

@prop {Object<varname, value>} js_variables - A dictionary indicating the
    js variable values in glnsl js interpolation, they represent a state
    machine for computing the final shader projection
*/
function Shader(opts) {
	if(!(this instanceof Shader)) return new Shader(opts)

	this.src = opts.src || ''
	this.code_tree = null
	this.out = null

	this.js_variables = opts.js_variables || {n:3}
	this.uniforms = opts.uniforms || {}
	this.attributes = opts.attributes || {}

	//OpenGL Shader Program
	this.program = null
}

Object.assign(Shader.prototype, {
	/**
	 * Compiles a js function declaring this.js_variables in its context
	 * appending it in the form 'entry_key = fn_argument || entry_value'.
	 * Added keys can be added as arguments or will fallback to the given
	 * default values. </br></br>
	 * @param  {string} src  - js src code to compile
	 * @param  {object} vars - key-default_value vars definition
	 * @return {Function}      - compiled js function
	 */
	// TODO generalize to WASM
	js_compile: function js_compile(src, vars = this.js_variables) {
		
		var keys = Object.keys(vars)
		var args = keys.join(',')
		var body = keys.map(function(e) {
				e + '=' + e + '||' + JSON.stringify(vars[e]) + ';\n'
			}).join() + '\n'+
			'return ' + src
			
		var res_fn
		try {
			res_fn = Function(args, body)
		}
		catch(error) {
			console.error('Error compiling fn in shader: ')
			console.log(src)
			throw error
		}
		
		return res_fn
	},
	/**
	 * @memberof NEngine.GLNSLCompiler.Shader
	 * @method js_execute
	 * @desc gets the executed source over the given args. </br></br>
	 * TODO currently only one line expression evaluation functions
	 * allowed. </br>
	 * TODO develop arbitrarily complex js (possible using function
	 * expression). </br>
	 * @arg {string} source - The source code to parse
	 * @
	 */
	js_execute: function js_execute(src, args) {
		var n = this.js_compile(src)
		var res
		
		try {
			res = fn.apply(null, args)
		}
		catch(error) {
			console.error('Exception executing js function: ')
			console.log(src, args)
			throw error
		}
		
		return res
	},
	/**
	Shortcut
	*/
	compile: function Shader_compile() {
		this.code_tree = new CodeTree(this.src, this.js_variables)
		return code_tree.translate()
	}
})
return Shader
})()

	module.Shader = Shader

	/**
	@memberof NEngine.GLNSLCompiler
	@function compile
	@desc Compiles src using cfg
	@param {String} src - Contains the raw GLSL code
	@param {Object} cfg - Config container
	@return {String} translated
	*/
	function compile(src, js_variables) {
		try {
			return CodeTree(src, js_variables).translate()
		}
		catch(e) {
			console.log('Error compiling', e)
		}
	}
	module.compile = compile

	// console.log('precompiled: ', test_code)
	// console.log('compiled', compile(test_code) )

	return module
})();


  /**
  @namespace Physics
  @memberof NEngine
  @desc All physics related stuff, structures to index and optimize n-dimensional
  spaces with lots or hundreds of entities like space-trees and boxes. It also
  holds the PhysicsModules which define diferent kinds of physics processors
  and types, and defines the SpaceGraph for easy space handling (lots of
  TODO here). <br/><br/>
  
  [SpaceGraph]{@link NEngine.Physics.SpaceGraph} implements a multi-topology
  space "network", nodes are [Space]{@link NEngine.Physics.Space}
  trees (or other types) that hold
  Entity core data which gets proyected onto other Space's throught
  [Transforms]{@link NEngine.Physics.Transform} (the graph arcs). <br/><br/>
  
  [Space]{@link NEngine.Physics.Space} and
  [SpaceNode]{@link NEngine.Physics.SpaceNode} implement a clean tree topology
  capable of optimizing objects for collisions and interspace
  intersections (different SpaceGraph nodes), providing basic
  functions to iterate the tree topology or modify nodes. <br/><br/>
  
  [Space]{@link NEngine.Physics.Space} is the
  space tree root container, and holds
  global properties for every SpaceNode. <br/>
  [SpaceNode]{@link NEngine.Physics.SpaceNode} is a recursive generalized
  tree, currently limited to
  "Hexadeca"trees (4D) or octrees in 3D, in other words a 2^n
  generalized n-[t]et tree (you can get a normal binary partition tree by
  setting the size to 2). Its designed to be lazy evaluated and includes
  plumbing functions to iterate and modify subnodes.
  SpaceNode tries to keep the tree references
  coherent so it can be slow, try deactivating stuff (help here). <br/><br/>
*/
Physics = (function() {

  var SpaceGraph,
    Space,
    SpaceNode,
    Transform,
    PhysicsModules;

  SpaceGraph = (function() {
    
    /**
     * @memberof NEngine.Physics
     * @class SpaceGraph
     * @desc SpaceGraph is a graph where nodes are Spaces and arcs are Transforms
     */
    function SpaceGraph() {
      this.spaces = {}
      this.transforms = []
    }

    Object.assign(SpaceGraph.prototype, {
      
    })

    return SpaceGraph;
  })()


  Space = (function() {

    /**
    * @memberof NEngine.Physics
    * @class Space
    * @desc SpaceNode graph container, holds global SpaceNode properties.
    *
    * @prop {String} type - kind of space graph that holds // add opts new types or separate them??

    * @prop {Integer} dim - dims of SpaceNode graph
    * @prop {Integer} size - number of subnodes along an axis
    * @prop {Number} length - length of the subnode on depth 0, to generate
    space coordinates

    * @prop {SpaceNode} root - the root node of the SpaceNodes graph,
    root.parent equals null
    * @prop {Integer} level - the number of levels deper the graph is

    * @prop {Object} lib_vec - corresponding vectorial lib (example: NMath.vec5)
    * @prop {Object} lib_mat - corresponding matrix lib (same as lib_vec)
    *
    * @param {Integer} dim -
    *
    * @param {Integer} size -
    * @param {Number} length -
    * @param {Integer} level -  0 is for bottom, give the level for root, huper node
    *
    * @param {Boolean} fill - if fill Space graph on creation
    */
    function Space(opts) {
      this.type = 'euclidean';

      this.dim = opts.dim;
      this.size = opts.size;
      this.length = opts.length;
      this.level = opts.level;

      //cache dimensional libs
      this.lib_vec = NMath['vec'+this.dim];
      this.lib_mat = NMath['mat'+this.dim];

      this.p = opts.p || this.lib_vec.create();
      this.r = opts.r || this.lib_mat.create();

      //store default node creation parameters for this system
      this.nodesOpts = {
        space: this,
        level: this.level,
        fill: false,

        dim: this.dim,
        size: this.size,
        p: this.lib_vec.create(),
      };
      this.root = new SpaceNode(this.nodesOpts);

      if(opts.fill)
        this.root.fill();

      this.nodesOpts.fill = undefined;
    }

    Space.prototype = {
      /**
      * @memberof NEngine.Physics.Space.prototype
      * @method enlarge
      * @desc add hupper levels to the space system
      * @param {Integer} repeat - Number of levels to generate
      */
      enlarge: function(repeat) {
        //create new root node
        var root, old_root_index, i, opts;
        opts.level = ++this.level;
        opts.p = null;
        opts.parent = undefined;
        root = new SpaceNode( opts );

        //determine root index inside of the new root
        //set it on the center
        if(this.size%2)
          old_root_index = Math.floor(root.childs.length/2);
        //alternate on non-centers to ensure
        //radial node distribution, avoid eternal extends, etc
        else {
          old_root_index = Math.pow(this.size,this.dim)/2;
          //add or sustract the alf of every subdimension
          for(i=dim-1; i>0; i--)
            old_root_index += ((this.level%2)?-1:1)*Math.pow(this.size, i)/2;
        }

        //relink
        this.root.parent = root;
        this.root.index = old_root_index;
        root.childs[ old_root_index ] = this.root;
        this.root = root;

        //calculate new root system relative position
        this.root.setPChild( root.childs[old_root_index] );

        if(repeat)
          this.enlarge(--repeat);
      },
      /**
      * @memberof NEngine.Physics.Space.prototype
      * @method remEnt
      * @param {Entity} Entity
      * @desc removes an entity from the space system
      */
      remEnt: function(ent) {
        if(!ent.container) return;

        var objects = ent.container.objects,
          i = 0; l = objects.length;
        for(;i<l;)
          if(objects[i] && objects[i].indexOf(ent) != -1)
            objects[i].splice( objects[i].indexOf(ent), 1 );

        ent.container = null;
      },
      /**
      * @memberof NEngine.Physics.Space.prototype
      * @method addEnt
      * @param {Entity} Entity
      * @desc adds an entity to the space system
      * checks that the systems has instantiated the corresponding space
      * node and then adds it to the objects array[0] (entity) (checking
      * coherent instantiation of it)
      */
      addEnt: function(ent) {
        var node, array;
        node = this.root.include(ent.p);
        array = node.objects[0];

        if(ent.container)
          this.remEnt(ent);

        if(!array)
          array = node.objects[0] = Array();
        if(array.indexOf(ent) != -1)
          return;

        array.push(ent);
        ent.container = node;
        return node;
      }
    }

    return Space;
  })();

  SpaceNode = (function() {

    /**
    * @memberof NEngine.Physics
    * @class SpaceNode
    * @desc Represents single space net unit, if its a bottom SpaceNode
    * it will contain lists for objects inside their respective physics    * processor type (for example, Entities in Dynamic array)
    *
    * @prop {Space} space - Space containing general configs
    * @prop {Integer} level - Space Index depnes, 0 equals bottom
    * @prop {Integer[]} p - system relative position, integer nd vector,
    *
    * @prop {SpaceNode} parent - Spatially containing node
    * @prop {SpaceNode[]} siblings - Siblings linear Array
    * @prop {Boolean} capsuled - indicates whether all siblings are occupied
    *
    * @prop {Integer} last_visited - last time it was processed by physicsprocessor
    * @prop {Boolean} active - If registered for physics processing
    * @prop {Integer} index - index for fast translation into parent relative
    *   position the mapping is from a n-d vector such as <br/>
    *         p[0] + p[1]*size + p[2]*size**2 [..]
    *
    * childs - Child Spaces linear Array
    * objects - Dictionary containing the objects inside the SpaceNode
    *       separated in arrays, each for each corresponding processor type
    *
    * constructor: fill isnt an automatic option because is rarely needed and
    * extremply complicates code simplicity and opts caching
    +
    * @param {Space} space -
    * @param {Space} parent -
    * @param {Integer} level -
    *
    * @param {Integer} dim -
    * @param {Integer} size -
    *
    * @param {Integer} index -
    * p - requires
    *          undefined = calculate with setP, index and parent required
    *          null = leave empty
    */
    function SpaceNode(opts) {

      this.space = opts.space;
      this.level = opts.level;
      this.length = Math.pow(this.space.length, this.level+1);

      this.parent = opts.parent;
      this.siblings = new Array( opts.dim*2 );
      this.capsuled = false;

      //set index and parent connection
      this.index = opts.index;
      if(!this.parent)
        this.index = -1;
      if(this.index >= 0)
        this.parent.childs[this.index] = this;

      this.p = opts.p;
      if(this.index >= 0 && opts.p === undefined)
        this.setP();
      this.childs = new Array( Math.pow(opts.size,opts.dim) );

      this.last_visited = -1;
      this.active = false;

      if( this.level == 0 )
        this.objects = []
      else
        this.objects = [];

    }

    /**
    * for dynamic space generation
    */
    SpaceNode.prototype = {
      /**
      * @memberof NEngine.Physics.SpaceNode.prototype
      * @desc  calculates the position traslation from parent p vector
      * to child p given the index and child level
      * @param {Integer|Integer[]} child_index - Index relative to parent, can
      *  be the computed index or a positional index
      * @param {Integer} child_level - childNode.level
      * @param {NVector} [p=NVector0] - vector to store data
      * @return {NVector} p - result container
      */
      parentPSeparation: function(child_index, child_level, p) {
        if(!p)  p = this.space.vec_lib.create()

        if(child_index instanceof Number || child_index)
          child_index = this.indextop(index)

        var index_p_middle = this.space.size/2, dim, dims,
          length_transform = Math.pow(this.space.length, child_level)

        for(dim = 0; dim < dims; dim++)
          p[dim] = (child_index[dim]+0.5 - index_p_middle)*length_transform

        return p;
        },
      /**
      * @memberof NEngine.Physics.SpaceNode.prototype
      * @desc configures p according to parent data
      */
      setP: function(p) {
        var vel_lib = this.space.vec_lib
        if(!p) p = (this.p)? this.p : vec_lib.create()

        this.parentPSeparation(this.index, this.level, p)
        this.space.vec_lib.add(p, p, this.parent.p)

        this.p = p
      },
      /**
      * configures p using specific child data
      */
      setPChild: function(child, p) {
        if(!p) p = this.space.vec_lib.create();

        this.parentPSeparation(child.index, child.level, p);
        this.space.vec_lib.sub(p, child.p, p);

        this.p = p;
      },
      /**
      * returns a parent and enlarges the space if necesary
      */
      parentEnsured: function() {
        var parent = this.parent;

        if(!parent) {
          this.space.enlarge();
          parent = this.parent;
        }

        return parent;
      },
      /**
      * converts coord to a index vector
      * doesnt check if coord is inside this node
      */
      coordtoindexp: function(coord, p) {
        if(!p) p = this.space.vec_lib.create();
        var dim = 0, dims = this.space.dim,
          p_this = this.p,
          length = this.length,
          length_mid = length/2,
          unit_size = length/this.space.size;

        for(;dim<dims;)
          p[dim] = Math.floor(coord[dim] - p_this[dim] + length_mid)/unit_size;

        return p;
      },
      /**
      * converts coord to a index integer
      * doesnt check if coord is inside this node
      */
      coordtoindex: function(coord) {
        var dim = 0, dims = this.space.dim,
          size = this.space.size,
          p_this = this.p,
          length = this.length,
          length_mid = length/2,
          unit_size = length/this.space.size,
          index=0;

        for(;dim<dims;)
          index += Math.floor(coord[dim] - p_this[dim] + length_mid)/unit_size*
            Math.pow(size, dim);

        return p;
      },
      /**
      * informs whether coord is inside this node
      */
      isInside: function(coord) {
        var i=0, dim = this.space.dim,
          p_this = this.p,
          limit = this.length/2;

        for(;i<dim;)
          if( Math.abs(coord[i] - p_this[i]) > limit)
            return false;

        return true;
      },
      /**
      * ensures that a given location is internalized
      */
      include: function(coord) {
        //if coord doesnt fit this node search on parent
        if(!this.isInside(coord)) {
          this.parentEnsured().include(coord);
          return;
        }

        var index, opts, child;
        //already reached bottom node
        if(!this.level) return this;

        index = this.coordtoindex(coord);
        child = this.childs[index];

        if(!child) {
          opts = this.space.nodesOpts;

          opts.parent = this;
          opts.level = this.level-1;

          opts.index = index;
          opts.p = undefined;

          child = new SpaceNode(opts);
        }

        return child.include(coord);
      },
      /**
      * creates sibling on given direction
      * doesnt check tree consistency
      */
      extend: function(direction, length) {
        if(this.siblings[direction])
          return;

        var orientation = (direction%2)? 1:-1,
          dim = Math.floor(direction/2),
          size = this.space.size;
          index_max = this.childs.length,

          parent = this.parentEnsured(),
          node,  node_index,
          opts = this.space.nodesOpts,

        opts.p = undefined;
        opts.level = this.level;

        ///////////////////configure opts

        //get index
        node_index = this.index + orientation*Math.pow(size, dim);
        //get parent
        //gets outside of parent, need to find a parent
        if(node_index >= index_max || node_index < 0) {
          //parent needed doesnt exists => extend parent into sibling
          if(!parent.siblings[i])
            parent.extend(direction, length);

          opts.parent = parent.siblings[i];
          node_index = this.index - orientation*(size-1)*Math.pow(size,dim);
        }
        else
          opts.parent = parent;
        opts.index = node_index;

        /////////////////////create-link node
        node = new SpaceNode(opts);
        this.siblings[direction] = node;
        node.siblings[direction - orientation] = this;

        return node;
      },
      /**
      * ensures that siblings of node are instantiated
      * doesnt check tree conectivity
      */
      capsule: function(depth) {
        var direction=0, directions = this.space.dim*2;
        for(;direction < directions;) {
          this.extend(direction);
          if(depth)
            this.sibling[direction].capsule(depth-1);
        }
        return this;
      },
      /*+
      fills the childs array with childs
      opts are the options passed to childs

      travels to each child using a position vector and sets its index
      for each child, the process repeats recursively if fill == true
      */
      fill: function(opts) {
        //first creates childs, then executes connect_childs
        var  index = 0, dim, child, sibling,
          space = this.space,
          dim_top_index = space.dim-1,
          size = space.size,

          pos = space.lib_vec.create(),
          opts;

        opts = {
          parent: this,
          space: space,
          level: this.level-1,

          p: undefined,
          dim: dim_top_index+1,
          size: size,
        };

        //iterate until every position is checked
        for(; pos[dim_top_index] != size;) {

          //create child only if it not exists
          if(!this.childs[index]) {
            opts.index = index;
            child = new SpaceNode(opts);

            if(opts.fill)
              child.fill(opts);
          }

          pos[0]++;
          index++;
          // renormalize position vector
          for(dim = 0; dim < dim_top_index; dim++)
            if(pos[dim] == opts.size) {
              pos[dim] = 0;
              pos[dim+1]++;
            }
        }

        this.connect_childs();

        return this;
      },
      /**
      * connects childs of node
      * to their siblings, posibly in a recursive manner
      */
      connect_childs: function() {
        var parent = this.parent,
          dim, dims = this.space.dim, directions = dims*2, i, d,
          dim_top_index = dims-1,
          size = this.space.size,
          pos = this.space.vec_lib.create(),
          sibling,
          index = 0,
          childs = this.childs,
          child, siblings, sibling;

        //iterate each child
        for(; pos[dim_top_index] != size;) {
          child = childs[index];
          if(!child) continue;

          child_siblings = child.siblings;

          ////start connecting unconnected siblings
          //for each direction
          for(dim=0; dim < directions;) if(!child_siblings[dim]) {
            i = ( dim%2 )? -1 : 1 ;//orientation
            d = Math.floor(dim/2);  //current dimension

            //its a limit node
            if( pos[d] == ( (i==-1)?0:(size-1) ) ) {

              /**if parent brother exists, check if sibling on that brother
              * exists
              */
              if( this.siblings[dim] )
                //get posibly existing child in sibling
                sibling = this.siblings[dim].
                  childs[ child.index - i*(size-1)*Math.pow(size, d) ];
              else
                sibling = null;

            } else //not a limit node
                sibling = this.childs[ child.index + i*Math.pow(size, d ) ];

            if(sibling) {
              //double link:
              //invert direction
              child_siblings[dim] = sibling;
              sibling.siblings[ dim-i ] = child;
            }

          } //siblings ready

          child.connect_childs();

          ////common iteration code
          pos[0]++;
          index++;
          for(dim=0; dim < dim_top_index; dim++) {
            if(pos[dim] == size) {
              pos[dim] = 0;
              pos[dim+1]++;
            }
          }

        }

      },
      /**
      * check sibblings of itself using
      * parent space data
      */
      connect: function() {
        var dim, i, d,
          directions = this.space.dim*2,
          size = this.space.size,
          siblings = this.siblings,
          parent = this.parent,
          pos = this.indextop(this.index);

        for(dim = 0; dim < directions;) if(!siblings[dim]) {
          i = ( dim%2 )? -1 : 1;
          d = Math.floor(dim/2);

          //its a limit conection
          if( pos[d] == (i==-1)?0:(size-1) ) {

            /**if parent brother exists, check if sibling on that brother
            * exists
            */
            if( parent.siblings[dim] )
              //check if searched child brother exists
              sibling = parent.siblings[dim].
                childs[ this.index - i*(size-1)*Math.pow(size, d) ];
            else
              sibling = null;

          } else  //not a limit node
            sibling = parent.childs[ this.index + i*Math.pow(size, d ) ]

          if( sibling ) {
            //double link:
            //invert direction
            siblings[dim] = sibling;
            sibling.siblings[ dim-i ] = this;
          }

        }

      },
      sibling: function(axis, positive) {
        return this.siblings[ axis*2 + ((positive)?1:0) ];
      },
      /**
      * converts p to its corresponding integer index
      */
      ptoindex: function(p) {
        var i,
          l = p.length, index = 0, size = this.space.size;


        for(i=0; i<l; i++)
          index += p[i]*Math.pow(size, i);

        return index;
      },
      /**
      * @memberof NEngine.Physics.SpaceNode.prototype
      * @desc converts index to its corresponding n-d position
      * @param {Integer} index - index for parent.childs array child
      * @param {} p -
      */
      indextop: function(index, p) {
        
        if(!p) p = this.space.lib_vec.create();
        var i, offset,
          size = this.space.size;

        for(i = p.length-1; i >= 0; i--) { //for each dim
          offset = Math.pow(size, i)

          while(index >= 0) {
            index -= offset;

            if(index >= 0)
              p[i]++;
          }
          index += offset;

        }


        return p;
      },
      iterate_bottom: function(f) {
        var i=0, childs=this.childs, l = childs.length, child;
        for(;i<l;) {

          child = childs[i];
          if(child && child.active) {
            if(!child.level)
              f(child);
            else
              child.iterate_bottom(f);
          }

        }
      },
      iterate: function() {

      }
    }

    return SpaceNode;
  })();

  /**
   * @memberof NEngine.Physics
   * @class Transform
   * @desc General relation between SpaceNodes
   * @param {object} template - Overwrites default transforms properties
   * @prop {Shader} template.fs_shader - the fragment shader transform part
   * @constructor
   */
  Transform = (function Transform(template) {
    Object.assign(this, template)
  });
  PhysicsModulesEnum = [];

  /**
  interface PhysicsModule
  */
  PhysicsModules = {
    /**
    * placeholder for normal entity instance
    */
    Entity: (function() {
      function convert() {

      }

      function apply() {

      }

      return {
        convert: convert,
        apply: apply,
      }
    })(),
    /**
    * Represents a basic kinetic object
    */
    Kinetic: (function() {
      var mod;
      function convert(opts) {
        if(!this.dp)
          this.dp = NMath['vec'+this.p.length];
        if(!this.dr)
          this.dr = NMath['mat'+this.p.length];
      }

      function apply(node, dt) {
        var i = 0; childs = node.objects[mod.i]; l = childs.length, child,
          vec_lib = node.space.vec_lib, mat_lib = node.space.mat_lib;

        for(;i<l;) {
          child = childs[i];
          vec_lib.scaleAndAdd(child.p, child.p, child.dp, dt);
          mat_lib.scaleAndAdd(child.r, child.r, child.dr, dt);
        }
      }

      return mod = {
        convert: convert,
        apply: apply,
      }
    })(),

    /**
    * Represents physical object
    */
    Dynamic : (function(){
      var prot, ent_prot;

      function convert(opts) {

        this.type = opts.type;
        switch(this.type) {

          case 'solid':

            this.shape = opts.shape;
            this.mass = opts.mass;
            this.dumpness = opts.dumpness;
            this.friction = opts.friction;

            this.equilibrium = false;
            break;

          default:
        }

      }

      function apply(node) {

      }

      return {
        convert: convert,
        apply: apply,
      }

    })(),
    register: function phy_module_reg(module) {

    },
  };
  
  PhysicsModulesEnum.push(PhysicsModules.Entity);
  PhysicsModules.Entity.i = 0;

  var i=1;
  for(module in PhysicsModules) {
    if(module === PhysicsModules.Entity) continue;

    module.i = i++;
    PhysicsModulesEnum.push(module);
  }
  
  return {
    SpaceGraph: SpaceGraph,
    Space: Space,
    SpaceNode: SpaceNode,
    Transform: Transform,
    PhysicsModules: PhysicsModules,
  }
})()


  
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


  _module = {
    Obj: Obj,
    geometry: geometry,
    obj: obj,
    math: math,
    //physics: physics,
    renderer: renderer,
    Camera: Camera,
    Renderer: Renderer,
    Entity: Entity,
    Physics: Physics,
    GLNSLCompiler: GLNSLCompiler,
  }

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


  return  _module
})();


      })();
    }
    catch(e) {
      console.log('NEngine error: ', e);
    }
}
 catch(e) {
  console.log('You dont have an NEngine requeriment, NEngine not loaded', e);
}
