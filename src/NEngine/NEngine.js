	/**
  # NEngine.js
  <br/>
  A n-dimensional, full featured graphical-physical engine for the web.
<br/><br/>

  ## Features:
<br/><br/>

  ### N-dimensional geometry library and N-dimensional physical library:
  <br/>
  It contains basic n-dimensional polyhedrals and a basic geometry collision library to use in the physical system.
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

global_root.NEngine = (function() {

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
    //TODO:
    //optimized physical sysstem, collisions, force fields, n-dimensional boxing system
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

  @import 'Physic.js'

  @import 'NMusicPorts.js'

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
    Physics: Physics,
    GLNSLCompiler: GLNSLCompiler,
  };
})();
