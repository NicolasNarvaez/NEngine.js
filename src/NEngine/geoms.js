
  function grid4(options) {
    if(!options) options = {};

    var
      size_x = options.size_x || options.size || 2,
      size_y = options.size_y || options.size || size_x,
      size_z = options.size_z || options.size || size_y,
      size_w = options.size_w || options.size || size_z,

      length_x = options.length_x || options.length || 1,
      length_y = options.length_y || options.length || length_x,
      length_z = options.length_z || options.length || length_y,
      length_w = options.length_w || options.length || length_z,

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
      i_w, i_z, i_y, i_x, i_dir, i_dir2;

    //just a recursion, calm down guys
    if(options.iteration || options.recursion_depth) {
      var p = NMath.vec4.create(),
        recursion_i = Array(4);

      if(options.recursion_depth) {
        if(!options.recursion_depth_total) {
          options.recursion_depth_total = options.recursion_depth;
          options.recursion_depth_current = 0;
        }

        if(!options.recursion_is)
          options.recursion_is = [recursion_i];
        else
          options.recursion_is.push(recursion_i);

        if(!options.recursion_ps)
          options.recursion_ps = [p];
        else
          options.recursion_ps.push(p);
      }

      for(recursion_i[3] = size_w; recursion_i[3]--;)
        for(recursion_i[2] = size_z; recursion_i[2]--;)
          for(recursion_i[1] = size_y; recursion_i[1]--;)
            for(recursion_i[0] = size_x; recursion_i[0]--;) {

              p[0] =  recursion_i[0]*length_step_x - length_x_m;
              p[1] =  recursion_i[1]*length_step_y - length_y_m;
              p[2] =  recursion_i[2]*length_step_z - length_z_m;
              p[3] =  recursion_i[3]*length_step_w - length_w_m;

              options.recursion_i = recursion_i;
              options.iteration(p, options);

              if(options.recursion_depth) {
                options.recursion_depth--;
                options.recursion_depth_current++;
                grid4(options);
                options.recursion_depth++;
                options.recursion_depth_current--;
              }
            }
        if(options.functional)
          return
    }

    var position = new GLMAT_ARRAY_TYPE(size_w*size_z*size_y*size_x*4),
      color = new GLCOLOR_ARRAY_TYPE(size_w*size_z*size_y*size_x*4),
      indices = (options.wire)? new GLINDEX_ARRAY_TYPE(2*(
        size_w*size_z*size_y*(size_x-1) +
        size_w*size_z*(size_y-1)*size_x +
        size_w*(size_z-1)*size_y*size_x +
        (size_w-1)*size_z*size_y*size_x
      )) : new GLINDEX_ARRAY_TYPE(

      );

    if(options.wire){
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


      Geom.apply(this);
      this.dim = 4;

      this.length_x = length_x;
      this.length_y = length_y;
      this.length_z = length_z;
      this.length_w = length_w;

      this.size_x = size_x;
      this.size_y = size_y;
      this.size_z = size_z;
      this.size_w = size_w;

      this.data = {}
      this.data.vertex = position;
      if(options.wire)
        this.data.edges = indices;
      else
        this.data.faces = indices;

      this.data.color = color;

      twglize(this);
      return this;
  }
  grid4.prototype = Geom.prototype;
  function simplex4(ops) {
    var size = ops.size, type = ops.enemy,
     p = new GLMAT_ARRAY_TYPE([
        -0.5, -0.28867512941360474, -0.2041241452319315, -0.15811388194561005,
        0.5, -0.28867512941360474, -0.2041241452319315, -0.15811388194561005,
        0, 0.5773502743708339, -0.2041241452319315, -0.15811388194561005,
        0, 0, 0.6123724431685174, -0.15811388194561005,
        0, 0, 0, 0.6324555330964848
      ]),
      c,
      i = (ops.wire)?new GLINDEX_ARRAY_TYPE([
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
      new GLINDEX_ARRAY_TYPE([
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

      if(type)
      c = new GLCOLOR_ARRAY_TYPE([
        1, 0, 0, 1,
        1, 0, 0, 1,
        0, 1, 0, 1,
        0, 1, 0, 1,
        1, 1, 0, 1,
      ])
      else
      c = new GLCOLOR_ARRAY_TYPE([
        1, 0, 1, 1,
        0, 1, 1, 1,
        1, 1, 1, 1,
        1, 1, 0, 1,
        0, 0, 0, 1,
      ])


      /*
      v_tmp[0] = 1.0 + 0.5*3;
      v_tmp[1] = 0.8660254037844386 + 0.28867513459481287*2;
      v_tmp[2] = 0.816496580927726 + 0.2041241452319315;
      v_tmp[3] = 0.7905694150420949;
      */

    return {

      buffers: {
        position: {numComponents: 4, data: p , type: GLMAT_ARRAY_TYPE},
        indices: {numComponents: (ops.wire)?2:3, data: i, type: GLINDEX_ARRAY_TYPE},
        color: {numComponents: 4, data: c, type: GLCOLOR_ARRAY_TYPE}
        }
      }
  }
  function octahedron4(ops) {
    var size = ops.size,
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

    return {
      boundingSphereRadius: size,
      boundingBoxMax: size,
      boundingBoxMin: size,
      buffers: {
        position: {numComponents: 4, data: p , type: GLMAT_ARRAY_TYPE},
        indices: {numComponents: (ops.wire)?2:3, data: i, type: GLINDEX_ARRAY_TYPE},
        color: {numComponents: 4, data: c, type: GLCOLOR_ARRAY_TYPE}
        }
      }
  }

  function axis4(options){
    var s = options.size,p = new GLMAT_ARRAY_TYPE([
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
    return {
      buffers: {
        position: {numComponents: 4, data: p , type: GLMAT_ARRAY_TYPE},
        indices: {numComponents: 2, data: i, type: GLINDEX_ARRAY_TYPE},
        color: {numComponents: 4, data: c, type: GLCOLOR_ARRAY_TYPE}
        }
      }
  }

  function tree4(options) {

  }
