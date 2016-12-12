/**
@namespace Util
@memberof NEngine.GLNSLCompiler
@desc General utilities, that could be rehusable outside this application,
	like glsl grammar dictionaries, or more atomic and agnostic
	transcompiling utils.
*/
var Util = (function UtilLoader() {
var module = {}
/**
@namespace Grammar
@memberof NEngine.GLNSLCompiler.Util
@desc Contains glsl grammar definition, useful grammar lists
*/
module.Grammar = (function(){
  var grammar_lists, grammar_;

  grammar_ = {
    identifier: "[_a-zA-Z][_\\w]*"
  }

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
      'mat.*\\s',//n*m matrix
      '[\\w\\s]+["\']', //dynamic type
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
    grammar_: grammar_,
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
/**
returns if given char is scaped or not
*/
function is_scaped(src, i) {
  var scape = 0
  while(src[i-scape-1] == '\\') scape++
  return scape%2 != 0
}

/**
@class SymbolTree
@memberof NEngine.GLNSLCompiler.Util
@desc This was created in a moment of despair. Now i cant find a use to it...
	mmmm, maybe just a middle-level tool
  <br/>
  Helps handling source mapping, stripping, scaping, etc. Provides
  functions to translate on its context (subsections of it, etc) like
  interpolate. </br> </br>
  the level of source mapping it makes is low, doesnt create recursive
  SymbolTree trees, but does create symbols trees
@prop {String} src - Initial src str
@prop {Object<Symbol_key, str>} symbols - Maps mapped source symbols into
  the src, each symbol contains the mapping into src from mapped
@param {String} src -
*/
function SymbolTree(src) { if(!(this instanceof SymbolTree)) return new SymbolTree(src)
	this.src = src
	this.symbols = {root: src}
	this.symbols_count = 0
}
SymbolTree.prototype = {
	delimiter_pairs: {
	'(': ['\\(','\\)'],
	'{': ['\\{','\\}'],
	'[': ['\\[','\\]'],
	},
	/**
	@method
	@memberof NEngine.GLNSLCompiler.Util.SymbolTree
	@desc rot tree accessor
	*/
	root: function root() {
		return this.symbols['root']
	},
	/**
	@method
	@memberof NEngine.GLNSLCompiler.Util.SymbolTree
	@desc returns symbols found in str as a dictionary
	*/
	symbols: function symbols(str) {
		var syms = [], sym,
			reg = RegExp(/\"(.*?)\"/gi),
			res

		while(res = reg.exec(str))
			if(sym = this.symbols[res[1]]) syms.push(sym)

		return syms
	},
	/**
	@method
	@memberof NEngine.GLNSLCompiler.Util.SymbolTree
	@desc interpolates all the symbols in the str
	*/
	interpolate: function interpolate(str) {
		var syms = this.symbols, sym

		while(res = (/".*"/gi).exec(str))
			str = str.replace(res[0], syms[res[0]])

		return str
	},
	/**
	@method
	@memberof NEngine.GLNSLCompiler.Util.SymbolTree
	@desc Takes the strings delimited by the delimiter off, into a mapping
	avoids scaped delimiters and transparently resolves nested expressions
	including them in each strip ( 'aaa(asd(ss)asd)l' => 'aaa"symbolkey"l' ),
	stripts every encounter
	*/
	strip: function(delimiter, exclude) {
		var regexp, res, res_list=[], regexp_,
			map = this.root(),
			symkey, sym, self = this

		delimiter = this.delimiter_pairs[delimiter] || delimiter

		if(delimiter instanceof Array) {
			regexp = delimiter[0]+'(.*)'+delimiter[1]
			regexp = new RegExp(regexp, 'gim')

			while(res = regexp.exec(map))	res_list.push(res)

			res_list.forEach(function(e) {
				symkey = '"'+self.symbols_count+'"'
				sym = (exclude)? e[0]: e[1]

				map = map.replace( sym, symkey)
				self.symbols[symkey] = sym

				self.symbols_count++
			})

		}
		this.symbols['root'] = map
		return this
	},
}

module.serialize = serialize
module.is_scaped = is_scaped
module.SymbolTree =  SymbolTree
return module;
})()
