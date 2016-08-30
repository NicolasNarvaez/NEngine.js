/**
* represents a variable in a scope
*
* opts:
*   sentence
*   sentence_place: place in the declaration sentence
*   scope
*   type : prim or function, etc
*   qualifiers: storage, precission, return value, etc
*   value: given value, if this is a literal variable (value variable)
*   name: variable name
* props:
*   type_data: parsed type data from qualifiers
*/
function Variable(opts) {
  this.sentence = opts.sentence || null;
  this.sentence_place = opts.sentence_place || 0;
  this.scope = opts.scope || null;

  //primitive or function
  this.type = opts.type || null;
  //array with datatype dependant data
  //primitives: variable declaration qualifiers
  //function: return and parameters variables
  this.qualifiers = opts.qualifiers || null;
  //object with more specific datatype data for primitives
  //like length
  this.type_data = null;
  //if this is a literal variable, this will contain the value string
  this.value = opts.value || null;

  this.name = opts.name || '';
  if(qualifiers)
    this.declare();
}
Variable.prototype = {
  operation: function operation() {

  },
  /**
  registers to variable scope, fills type_data
  */
  declare: function() {
    if(this.scope.variables[this.name])
      throw "variable "+this.name+" already declared";

    //fill type_data
    if(this.type == 'primitive') {
      if(this.qualifiers[3].match('vec')) {//vec
        this.type_data = {
            length: Number( (/\d+$/).exec(this.qualifiers[3]) )
        }
        this.qualifiers[3] = 'vec';
      }
      if(this.qualifiers[3].match('mat')) {//mat
        this.type_data = {
          x: Number( (/\d+/).exec(this.qualifiers[3]) ),
          y: Number( (/\d+$/).exec(this.qualifiers[3]) )
        }
        this.qualifiers[3] = 'mat';
      }
    }

    //register to variable scope
    this.scope.variables[this.name] = this;
  }
}
