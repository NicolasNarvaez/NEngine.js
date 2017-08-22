 var Expression = (function ExpressionLoader() {
/**
@memberof NEngine.GLNSLCompiler
@class Expression
@desc Used to create recursive translable expressión trees
	a and b point to expresions (variable expression) and in
	operator == null this.a contains a variable ("literal expression")
	if operator == 'function' then a points to function and b to parametters
	expressions. If src is given, executes interpret on exit


@prop {String} src - source code
@prop {String} content - str content of the expression
@prop {Boolean} inside_parenthesis=false - Tells if expression is inside
	parenthesis. this.content contains the unparenthesized version

@prop {Sentence} sentence - The sentence that contains the expression
@prop {Scope} scope - expression scope

@prop {(Variable|Expression)} a - variable, function or expression
@prop {(Variable|Expression)} b - variable, expression or parameters
	expression array
@prop {String} operator - the operator if any, or 'function'

@param {Object} opts - options object
@param {String} opts.src=null
@param {Sentence} opts.sentence=null
@param {Scope} opts.scope=sentence.scope

@param {Mixed} opts.a=null
@param {Mixed} opts.b=null
@param {String} opts.op=null - operator
*/
function Expression(opts) {
	this.src = opts.src || null
	this.content = null
	this.inside_parenthesis = false

	this.sentence = opts.sentence || null
	this.scope = opts.scope || opts.sentence.scope || null

	this.a = opts.a || null
	this.b = opts.b || null
	this.operator = opts.op || null

	if(this.src)
		this.interpret()
}

Expression.prototype = {
	/**
	@memberof NEngine.GLNSLCompiler.Expression.prototype
	@desc each element its a regexp + operator identifier
	for each expression, there are 3 parenthesis operator a, operator b, and
	operation
	*/
	operators: [
		{
			id: '=',
			//EQUALITY REQUIRES THAT LEFT SIDE OPERAND ITS THE VARIABLE
			//CONTAINER AND NOT ITS VALUE, FOR ELEMENT SELECTION, THIS CHANGES
			//NORMAL TRANSLATION.
			reg: /([^\+\-\^\|&!=<>%\*/](?:\+\+)*(?:--)*)(=)([^=])/gi,
		},
		{
			id: '+',
			reg: /([^\+](?:\+\+)*)(\+)([^\+=])/gi,
		},
		{
			id: '-',
			reg: /([^\-](?:--)*)(-)([^-=])/gi,
		},
		{
			id: '*',
			reg: /()(\*)([^=])/gi,
		},
		{
			id: '/',
			reg: /()(\/)([^=])/gi,
		},
	],

	/**
	* @memberof NEngine.GLNSLCompiler.Expression.prototype
	* @desc the variable type of the object returned by the expressión
	*/
	vartype: function vartype() {

		return {
			replicates: false
		}
	},
	/**
	* @memberof NEngine.GLNSLCompiler.Expression.prototype
	* @desc indicates wheter the operands-operand combination implicates a
	* right-operator replication,this is for optimization purposes
	* avoiding expresion operations multiplication on after-compilation
	* sentences
	*/
	replicates: function replicates() {

	},
	/**
	* @memberof NEngine.GLNSLCompiler.Expression.prototype
	* @desc first, if this is a parenthesis, cuts the borders so it can process
	* the content. Then, converts all parenthesis into special variables
	* so they dont interfere with operators on this precedence layer
	* then splits the text by the lower precedence operator, and starts
	* the new expressions sending them the code with the parenthesis instead
	* of the variables
	*/
	interpret: function interpret() {
		var re, res, i, l, self = this,
			src = this.src, src_map, arguments_map,
			operators = this.operators, op,
			SymbolTree = Util.SymbolTree

		console.log('expression: variable expression input: ', this.src )

		//delete containing parenthesis and mark this as being
		//inside_parenthesis
		re = /^\s*\((.*)\)\s*$/gi
		while( res = re.exec(src) ) {
			this.inside_parenthesis = true
			src = res[1]
		}
		this.content = src

		//create parenthesis table
		// console.log('empezando',src)
		src_map = new SymbolTree(src)
		src_map.strip('(').strip('[')
		src = src_map.root()
		// console.log(src, src_map)

		//split by the lower operator precedence, if found, start resolving
		//recursively
		for(i = 0, l = operators.length; i < l; i++) {
			op = operators[i]
			res = op.reg.exec(src)

			if(res) {
				this.operator = op

				this.a = new Expression({
					sentence: this.sentence,
					src: src_map.interpolate(
					src.substr(0, res.index+res[1].length) )
				})

				this.b = new Expression({
					sentence: this.sentence,
					src: src_map.interpolate(
					src.substr(res.index+res[1].length +res[2].length) ),
				})

				i=l
			}
		}

		//when there was no operator found, this is a variable or a literal
		//or a function
		if(!this.a) {
			res = (/^\s*([_a-z][_a-z0-9]*)\s*(\(([^]*)\))*/gi).exec(src)
			console.log('expression: variable exp', src, res)

			if(res && res[1] && !src.match('\\[')) {	//isnt a literal
				this.a = this.scope.getVariable(res[1])
				this.op = 'variable'
				console.log('expression: getting variable', res[1], this.a)

				if(res[2]) { //function
					this.b = src_map.interpolate(res[3])	//get arguments
					//scape expressions
					arguments_map = new SymbolTree(this.b).strip('(').strip('[')
					//map expressions from splited arguments
					this.b = arguments_map.root().split(',').map(function(e) {
						return new Expression({
							sentence: self.sentence,
							src: arguments_map.interpolate()
						})
					})

					this.op = 'function'
				}
			}
			else {
				this.a = src	//literal
				this.op = 'literal'
			}
		}

	},
	/**
	* @memberof NEngine.GLNSLCompiler.Expression.prototype
	* @desc returns an expression translation object
	* it contains:
	*	already translated sentences, that go before
	*	current translating sentence (can be an array)
	*	current vartype of the expression
	*/
	translate: function() {

	},
}

return Expression
})()
/**
	TODO Extremly important (next version deps):
	- define constructor dynamic_variables (ready)
	- connect dynamic_variables to getVariable (ready)
	- test first variable declaration translations (current)
		- making expression and expression translation work (current)
	- translate first expressions
	- start translating full code

	Added variables.identifierToken:
		suṕports multiple function on same variable definition
		empty qualifiers encode free-vaue generalizattion on generators
		and scope

	For funcion translation:
		treat return value as parametter if bigger (maybe
			already defined caches)
		add function_inline object to inline-translating functions:
			function_inline: {
				[translate: ] //custom translator
				type: 'fallback_parametrization' //vec5() to
												//	vec4, type 1: 1 sentences
				fallback: 'vec'	//each vecn parametter
			}
			used in translate
		add general function call expression translation:
			parametrer expansion
		add function identifier token to identifiers dict:
			calculated from qualifiers (general identifier function from
			variable, takes qualifiers, name params), add function to generate
			regexp to those tokens (for dyn-built-in regexp prop) from general
			qualifiers
			new token proposal: function:qualifier1,qualifier2,..
			use old syntax on no candidate as fallback
				new politik be lik:
					full function qualified identifier: get that
					just name -> match any qualifications :3
		add dynamic built-in function include() function, called in built-in
			function creation, adds function code to scope.precode
		add firsts built-in from dyn-built-in functions (standard defined)


Important (relevant for stability) (cant the remember ths note):
	- check scope of builtin variables and getVariable interaction
		with getVariableBuiltin

*/
