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

geometry = (function() {

  function clone(g) {

  }

  function boundingBox(g) {
    var box = {};

    return box;
  }

  function boundingSphere(g) {

  }

  function merge() {

  }

  /*
  creates new geom space and fills it with the geoms in the given order
  if entity passed, applies transformatios before adding
  TODO: n geoms to one (optimize), keep_geom applies to first
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
      console.log(offset_to)
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

  function forEach() {

  }

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
  }

  function Geom() {
    this.boundingBoxMin = 0;
    this.boundingBoxMax = 0;
    this.boundingSphereRadius = 0;

    this.dim;

    this.data = {
      vertex: null,
      color: null,

      edges: null,
      faces: null,
    };
    this.buffers = {};
  }
  Geom.prototype = (function() {
    //function
    function concat_geom(b) {
      return concat(this, b);
    }
    function twglize_geom() {
      twglize(this);
    }
    return {
      concat: concat_geom,
      twglize: twglize_geom,
    };
  })();

  @import 'geoms.js'

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
