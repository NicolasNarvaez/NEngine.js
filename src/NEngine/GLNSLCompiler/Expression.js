var Expression = (function ExpressionLoader() {
/**
* @memberof NEngine.GLNSLCompiler
* @class Expression
* @desc a and b point to expresions (variable expression) and in
* Used to create recursive translable expressión trees
*
* operator == null this.a contains a variable ("literal expression")
* if operator == 'function' then a points to function and b to parametters
*   expressions
*/
function Expression(opts) {
  this.src = opts.src || null;
  this.sentence = opts.sentence || null
  this.scope = opts.scope || opts.sentence.scope || null;

  this.a = opts.a || null;
  this.b = opts.b || null;
  this.inside_parenthesis = false;
  this.operator = opts.op || null;
  //if operator == "function"
  this.function = opts.function || null;

  if(this.src)
    this.interpret();
}

Expression.prototype = {
  /**
  * each element its a regexp + operator identifier
  * for each expression, there are 3 parenthesis operator a, operator b, and
  * operation
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
  the variable type of the object returned by the expressión
  */
  vartype: function vartype() {

    return {
      replicates: false
    }
  },
  /**
  * indicates wheter the operands-operand combination implicates a
  * right-operator replication,this is for optimization purposes
  * avoiding expresion operations multiplication on after-compilation
  * sentences
  */
  replicates: function replicates() {

  },
  /**
  * first, if this is a parenthesis, cuts the borders so it can process
  * the content. Then, converts all parenthesis into special variables
  * so they dont interfere with operators on this precedence layer
  * then splits the text by the lower precedence operator, and starts
  * the new expressions sending them the code with the parenthesis instead
  * of the variables
  */
  interpret: function interpret() {
    var re, res, i,
      src = this.src, src_map,
      operators = this.operators, op;

	 console.log('variable expression input: ', this.src )

    re = /^\s*\((.*)\)\s*$/gi;
    while( res = re.exec(src) ) {
		this.inside_parenthesis = true
		src = res[1];
    }

    //create parenthesis table
	src_map = Util.SymbolTree(src)
	src_map.strip('(').strip('[')
	src = src_map.root()

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
		console.log('variable exp', src, res)

		if(res && res[1] && !src.match('\\[')) {	//isnt a literal
			this.a = this.scope.getVariable(res[1])
			console.log('getting variable', res[1], this.a)

			if(res[2]) { //function
				this.b = src_map.interpolate(res[3])	//get arguments
				this.op = 'function'
			}
		}
		else
			this.a = src	//literal
    }

  }
}

return Expression
})()
/*
TODO:
	- define constructor dynamic_variables
	- connect dynamic_variables to getVariable
	- test first variable declaration translations
	- translate first expressions
	- start translating full code 
*/
