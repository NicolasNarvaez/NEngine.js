/**
@memberof NEngine.GLNSLCompiler
@class Scope
@desc Represents a recursive Scope tree

@prop {CodeTree} code_tree - On rootScope, points to container CodeTree
@prop {Scope} rootScope - Root Scope of the tree
@prop {String} src - Contained code, currently only root-scope has

@prop {Scope} parent - Parent Scope
@prop {Scope[]} childs - Child Scopes

@prop {Integer[]} range - Start and end index of code in rootScope.src
@prop {Object.<String, Variable>} variables - Dictionary object for scope variables
@prop {Sentence[]} sentences - Holds scope sentences

@prop {Variable[]} cachedVariables -  contains current new temp_variables for
  extended datatypes

*/
function Scope() {
  this.code_tree = null;

  this.rootScope = null;
  this.src = null; //only rootScope has

  this.parent = null;
  this.childs = [];

  this.range = null;
  this.variables = {};
  this.sentences = [];

  this.cacheVariables = [];
}
Scope.prototype = {
  /**
  @memberof NEngine.GLNSLCompiler.Scope 
  @desc Correctly sets the parentScope
  */
  setParent: function(parent) {
    this.unsetParent();
    this.parent = parent;
    parent.childs.push(this);

    this.rootScope = parent.rootScope || parent;
  },
  /**
  @memberof NEngine.GLNSLCompiler.Scope
  @desc Correctly unsets the parentScope
  */
  unsetParent: function() {
    if(!this.parent) return;

    this.parent.childs.splice(this.parent.childs.indexOf(this),1);
    this.parent = null;
  },
  /**
  @memberof NEngine.GLNSLCompiler.Scope
  @desc Recursively in the scope tree searches the variable

  @param {String} varname - Target variable name
  @return {Variable} Return null if it cant be find
  */
  getVariable: function(varname) {
    var link, scope = this, variable;

    while(!(variable = scope.variables[varname]) && scope.parent)
      scope = scope.parent;

    return variable;
  },
  /**
  * ensures that a given type has its cache variables instantiated for
  * operations upon it
  * this is useful only during translation and final code writting
  *
  * adds them to variables array and cacheVariables sentence array for
  * post-writting usage
  */
  ensureTypeCache: function ensureTypeCache(type) {
    if(this != this.rootScope )
      this.rootScope.ensureTypeCache(type)
  },
  addSentence: function(sentence) {
    sentence.number = this.sentences.push[sentence];
  },
}
