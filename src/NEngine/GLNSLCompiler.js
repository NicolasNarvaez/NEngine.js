
ShaderCompiler = (function() {
  var datatypes;

  datatypes = {

  }

  function nmat_at_fill(i,j,n) {

  }

  function nmat_at(i,j,n) {
    var p = j*n+i,
      mat = Math.floor( p/16 ); //matrix holding position
    p = mat*16 - p;
    j = Math.floor( p/4 );
    i = p - j*4;
    return ''+mat+'['+i+']['+j+']';
  }

  //a = b*c
  function nmat_mult(a,b,c) {

  }

  function compile(src, cfg) {
    var res;
    //detect, list, matN datatypes
    src.match(/[\w]+[\s]+mat[\i]+[\s]+[_\w][_\w\d]+[\s]+;/gi)
  }

  return {
    compile: compile
  }
})();
