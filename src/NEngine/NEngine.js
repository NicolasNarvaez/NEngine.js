	/**
* An n-dimensional engine, works recursively projection dimension n into n-1 until n = 3.
* it works over optimized functions, amd only dimensions 4 and 3 are precompiled, if
* a given required dimension isnt compiled, uses nmath to create its library. <br/> <br/>
* When you start ngine and specify the working dimension, you can use internal dimension-agnostic
* objects to manipulate the engine elements, and make your app dimension-agnostic.
* @fileoverview
* @author Nicolás Narváez
* @version 0.5
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

root.NEngine = (function() {

  var math, Obj, renderer, geometry,
    util,
    Engine,
    Camera,
    Renderer,
    //TODO Shader logic, optimization, generation, syntax, definition
    //uses ND configs to generate ND materials
    ShaderCompiler,
    //generates materials data canvases
    Shader,
    Entity,
    //TODO:
    //optimized physical sysstem, collisions, force fields, n-dimensional boxing system
    //Huge-Nano space handling
    //fixed world object handler: environment variables, force-fields
    //object factories, for fast replication, on preconfigured engines
    SubSpace, //minimal unit of SVS
    Space,  //module of a system
    System, //Physycal collection of data and transforms

    vec4=NMath.vec4,
    vec5=NMath.vec5,
    mat4=NMath.mat4,
    mat5=NMath.mat5;

  util = {
    //return a + every prop not in a but in b
    missing: function missing(a, b) {
      for(prop in b)
        if(!a[prop])
          a[prop] = b[prop];
    },
  }

  @import 'Geometry.js'
  @import 'Object.js'

  @import 'Renderer.js'
  @import 'Shading.js'
  @import 'GLNSLCompiler.js'
  @import 'NPhysics.js'

  @import 'Engine.js'

  return {
    Obj: Obj,
    geometry: geometry,
    obj: obj,
    math: math,
    //physics: physics,
    renderer: renderer,
    Camera: Camera,
    Renderer: Renderer,
    Entity: Entity,
  };
})();
