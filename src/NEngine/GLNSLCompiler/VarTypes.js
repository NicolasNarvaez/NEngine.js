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
  var type, types ={
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
      constructor : function (qualifiers, reg_res) {
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
      exp: /mat(\d+)(_(\d+))*/gi,
      /**
      Sets codename from variable
      */
      constructor: function(qualifiers, reg_res) {
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
  }

  /**
  Append to each type construcotr, the type name to the resulting type object
  */
  for(type in types)
    types[type].constructor = (function() {
    var type_name = type,
      type_obj = types[type],
      type_constructor = type_obj.constructor;

    function VarType(qualifiers) {
      if( !(this instanceof VarType) )
        return new VarType()

      type_constructor.call(this, qualifiers)
      this.type = type_name
      this.codename = qualifiers[2] || '' + qualifiers[3]
    }
    VarType.prototype = type_obj

    return VarType
  })()


  return {
    types: types,
  }
})();
