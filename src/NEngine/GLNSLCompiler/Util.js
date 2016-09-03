
Vartypes = (function() {
  var types ={
    /**
    *
    */
    vecn: {
      exp: 'vec\d+',
      /**
      * creates type info from variable declaration information
      */
      constructor : function (data) {
        this.size = data.datatype.match(/\d/gi);
      },
      /**
      * expresion operator is an expression!!, not a variable!!
      * expresions only contain datatype info and expresion identifier
      * wich can be a variable identifier or a transparent temporary
      * identifier for temporal operantions cache
      *
      * into_variable can be a variable name or false,indicating to
      * return an array of the sentences without asignment instead
      */
      operations: {
        '[+-]': function addminus(operation, expresion_operator, into_variable) {

        }
      }
    },
    matn_m: {
      exp: 'mat\d(_\d+)',
      constructor: function(data) {

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
    }
  }



  return {
    types: types,
  }
})();

GrammarUtil = (function(){
  var grammar_lists;

  grammar_lists = {
    datatypes: [
      'void',
      'bool',
      'int',
      'float',
      'sampler2D',
      'samplerCube',
      'vec.*\\s',
      'bvec.*\\s',
      'ivec.*\\s',
      'mat.*\\s',
      'mat.*\\s', //n*m matrix
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
  };

  return {
    grammar_lists: grammar_lists,
  }
})()

/**
* removes extra spaces and line feeds
*/
function serialize(str) {
  var i, l, post = '';

  str = str.replace(/\n/ig, ' ');

  for(i = 0, l = str.length; i < l; i++) {
    if(!(str[i] == ' ' && post[post.length-1] == ' '))
      post += str[i];
  }

  return post;
}
