/**
@namespace GLNSLCompiler
@memberof NEngine
@desc Contains all related to GLNSLCompiler (:3) classes, functions and
  utilities \n \n
  Using the compiler: \n
  Just call "compile(code, config)", extra information is
  on the function docs
  TODO: scope resolution, currently only non-creating scope sentences are
  translated, like non [ifs, fors, functions, etc]
*/
GLNSLCompiler = (function GLNSLCompilerLoader() {
	var module = {}

	@import 'GLNSLCompiler/Util.js'
	module.Util = Util
	@import "GLNSLCompiler/Expression.js"
	module.Expression = Expression
	@import 'GLNSLCompiler/Variable.js'
	module.Variable = Variable
	@import 'GLNSLCompiler/VarTypes.js'
	module.VarTypes = VarTypes
	@import 'GLNSLCompiler/Sentence.js'
	module.Sentence = Sentence
	@import 'GLNSLCompiler/Scope.js'
	module.Scope = Scope
	@import 'GLNSLCompiler/CodeTree.js'
	module.CodeTree = CodeTree
	@import 'GLNSLCompiler/Shader.js'
	module.Shader = Shader

	/**
	@memberof NEngine.GLNSLCompiler
	@function compile
	@desc Compiles src using cfg
	@param {String} src - Contains the raw GLSL code
	@param {Object} cfg - Config container
	@return {String} translated
	*/
	function compile(src, js_variables) {
		try {
			return CodeTree(src, js_variables).translate()
		}
		catch(e) {
			console.log('Error compiling', e)
		}
	}
	module.compile = compile

	// console.log('precompiled: ', test_code)
	// console.log('compiled', compile(test_code) )

	return module
})();
