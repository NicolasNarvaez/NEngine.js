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
    uniforms = {},
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
    interface_obj;

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

  function init(options) {
    //create context
    if(!options) options = {};

    //config defaults
    var options_default = {

      //no config here relates to NEngine config, but to renderer
      container: document.body,
      resolution_density: 1.0,
      dim : 4,

      color_clear: [0.0, 0.0, 0.0, 1.0],

      //stereo model
      stereo_dim: 3,
      stereo_mode: 'splited',    //splited, polarized, alternation timer, etc.
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
    }, field;

    for(field in options_default)
      if(options[field] === undefined)
        options[field] = options_default[field];

    //those are camera related configs
    if(!options.stereo_separator && options.stereo_dim) {
      if(options.stereo_dim === 3) options.stereo_separator = [-1, 0, 0, 0];
      if(options.stereo_dim === 4) options.stereo_separator = [-1, 0, 0, 0];

      vec4.scale(options.stereo_separator, options.stereo_separator, options.stereo_separation);
    }
    for(field in options)
        config[field] = options[field];

    if(config.camera_disposition_3 === 'observer') {
      vec3.rotateNormalizedRelative(camera3, camera3.rz, camera3.ry, Math.PI/2);
      camera3.p[2] =200;
      camera3.p[1] = -200;
    }

    if(config.camera_disposition_3 === 'hexagon') {
      vec3.rotateNormalizedRelative(camera3, camera3.rz, camera3.ry, -Math.PI/4);
      camera3.p[1] += 200;

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

    ///Normalize context to twgl
    if(options.container === document.body) {
      options.container = document.createElement('canvas',
        {alpha: false, premultipliedAlpha: false});
      options.container.className = 'NEngine_canvas';
      document.body.appendChild(options.container);
    }
    context = twgl.getWebGLContext(options.container,{alpha:false});

    //create shader program, deprecated, use generator:
    //new NEngine.shader(flags)
    //obj.code(), obj.set(), renderer.use(obj)
    //camera: list of n-dimensional cameras for each lower dim
    //rederer.cameras(camera instance, renderer.shader)
    twgl.setAttributePrefix('a_');
    shader_info = twgl.createProgramInfo(context, ["vs", "fs"]);
    context.useProgram(shader_info.program);

    //fill uniform pointers
    uniforms.uPMVMatrix1 = uPMVMatrix1;
    uniforms.uPMVMatrix2 = uPMVMatrix2;

    uniforms.uPMatrix1 = uPMatrix1;
    uniforms.uPMatrix2 = uPMatrix2;
    uniforms.uMVMatrix1 = uMVMatrix1;
    uniforms.uMVMatrix2 = uMVMatrix2;

    uniforms.uPMVMatrix3D = uPMVMatrix3D;

    //adjust canvas size
    interface_obj.canvas = canvas = context.canvas;
    canvas.requestPointerLock = canvas.requestPointerLock ||
                        canvas.mozRequestPointerLock ||
                        canvas.webkitRequestPointerLock;

    context.clearColor(config.color_clear[0],config.color_clear[1],config.color_clear[2],config.color_clear[3]);
    context.enable( context.DEPTH_TEST );

    //blending
    context.enable( context.BLEND );
    //context.disable( context.DEPTH_TEST );
    context.blendFunc( context.SRC_ALPHA, context.ONE_MINUS_SRC_ALPHA );


    math.mat = global_root.NMath['mat'+(config.dim+1)];
    math.mat_cartesian = global_root.NMath['mat'+config.dim];

    math.vec = global_root.NMath['vec'+config.dim];
    math.vec_homogenous = global_root.NMath['vec'+(config.dim+1)];

    //deprecated, to renderer object
    global_root.addEventListener('resize', resize, false);
    resize();
  }

  //reconfigure complex NEngine properties .... duno wich xD
  function set(options) {
    var config_field;
    for(config_field in options.config)
      config[config_field] = options.config[config_field];

    //multiple simultaneous NEngine wont need this, but just renderers
    if(options.mouse_axisRotation) {
    }

  }
  function resize() {
    //regenerate renderer transform matrix to catch canvas reshape
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
          :TODO:
          el visor entereoscopico n-d esta con errores en las regiones de
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
            if(i === 0)
              context.viewport(0, 0, canvas.width/2, canvas.height);
            else
              context.viewport(canvas.width/2, 0, canvas.width/2, canvas.height);
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
    pointerLockAlternate: pointerLockAlternate
  };

  return interface_obj;
})();
