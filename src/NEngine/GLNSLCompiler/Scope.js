/**
* represents a single scope
* cachedVariables contains current new temp_variables for extended datatypes
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
  setParent: function(parent) {
    this.unsetParent();
    this.parent = parent;
    parent.childs.push(this);

    this.rootScope = parent.rootScope || parent;
  },
  unsetParent: function() {
    if(!this.parent) return;

    this.parent.childs.splice(this.parent.childs.indexOf(this),1);
    this.parent = null;
  },
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
