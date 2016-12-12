var Scope = (function ScopeLoader() {

/**
@memberof NEngine.GLNSLCompiler
@class Scope
@desc Represents a recursive Scope tree. <br/> <br/>
  The rootScope contains the cache of the temp variables
  used in intermediate operations (on translated code). This cache
  gets added to the begining during translation

@prop {CodeTree} code_tree - On rootScope, points to container CodeTree
@prop {Scope} rootScope - Root Scope of the tree
@prop {String} src - Contained code, currently only root-scope has

@prop {Scope} parent - Parent Scope
@prop {Scope[]} childs - Child Scopes

@prop {Integer[]} range - Start and end index of code in rootScope.src
@prop {Object.<String, Variable>} variables - Dictionary object for scope variables
@prop {Object.<String, Variable>} variables - scope variables generated on ask
		constructor functions, dim-dependant functions, etc
@prop {Sentence[]} sentences - Holds scope sentences

@prop {Object.<TypeCodeName, CacheData>} cacheVariables -  contains
  current new temp_variables for extended datatypes
@prop {Object} cacheVariables.typeCodeName - A specific datatype cache
@prop {Variable[]} cacheVariables.typeCodeName.vars - The cache variables
@prop {Variable[]} cacheVariables.typeCodeName.history - The cachevariables
  arranged by last used
*/
function Scope(opts) {
  this.code_tree = null;

  this.rootScope = null;
  this.src = null;

  this.parent = null;
  this.childs = [];

  this.range = null;
  this.variables = {};
  this.dynamic_variables = {};
  this.sentences = [];

  this.cacheVariables = {};
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
    while(scope) {
      if(variable = scope.variables[varname]) break

      scope = scope.parent;
    }

    return variable;
  },
  /**
  @memberof NEngine.GLNSLCompiler.Scope
  @desc If this scope is the scopeRoot or not
  @return {Boolean} isScopeRoot
  */
  isRoot: function() {
    return !this.rootScope || (this.rootScope == this)
  },
  /**
  @memberof NEngine.GLNSLCompiler.Scope
  @desc Ensures that a given type has its cache variables instantiated for
    operations upon it, this is useful only during translation and final
    code writting. <br/>
    Adds them to variables array (avoid colisions) and cacheVariables
    (inform cache creation) sentence array. This affects only rootScope
    (only a single copy of each typecache is necessary) <br/> <br/>
    cache variable names: ___GLNSL_cache_(typeCodeName)_(cacheindex)
  @param {Variable} variable - The variable to ensure cache, needs to
    have its qualifiers, and type_data set
  */
  ensureTypeCache: function ensureTypeCache(variable) {
    if( !this.isRoot() )
      return this.rootScope.ensureTypeCache(variable)

    var cache, i, l, type=variable.data_type,
      codename = type.codename

    if(! (cache = this.cacheVariables[codename]) ) {
      cache = this.cacheVariables[codename] = {
        vars: [],
        history: []
      }

      //create cache
      for(i=0,l=3; i<l; i++) {
        cache.vars.push(
          Variable({
            scope: this,
            type: 'primitive',
            qualifiers: [null, 'none',  //those arent relevant to cache scoping
              variable.qualifiers[2],
              variable.qualifiers[3]],
            name: "___GLNSL_cache_"+ codename +'_'+i
          })
        )
        cache.history[i] = cache.vars[i]
      }
    }

  },
  /**
  @memberof NEngine.GLNSLCompiler.Scope
  @desc Iterates over the cached variables to avoid dataloss on
    two-handed cache operations (they require 3 cache vars)
  @param {Variable} variable - Contains datatype description
    (precision+datatype)
  @return {Variable} variable - The cache variable you needed
  */
  getTypeCache: function getTypeCache(variable) {
    this.ensureTypeCache(variable)
    var codename = variable.data_type.codename,
      cache = this.cacheVariables[codename],
      res = cache.history.shift()

    cache.history.push(res)

    return res
  },
  addSentence: function(sentence) {
    sentence.number = this.sentences.push[sentence];
  },
  built_in: {
	  variables: {
	  },
	  dynamic_variables: {
		  'vecn': {
			  regexp: /vec(\d+)/gi,
			  //generator functions have to be called from a scope
			  gen: function vecn_constructor_scopevarinit(reg_res) {
				  return new Variable({
					  scope: this,
					  type: 'function',
					  name: reg_res[0]
				  })
			  }

		  },
	  },
  },
}

return Scope
})()
