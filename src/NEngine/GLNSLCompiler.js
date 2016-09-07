/*
The MIT License (MIT)

Copyright (c) 2015 Nicolás Narváez

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/**
@namespace GLNSLCompiler
@memberof NEngine
@desc Contains all related to GLNSLCompiler classes, functions and
  utilities \n \n
  Using the compiler: \n
  Just call "compile(code, config)", extra information is
  on the function docs
  TODO: scope resolution, currently only non-creating scope sentences are
  translated, like non [ifs, fors, functions, etc]
*/
GLNSLCompiler = (function() {
  var module = {},
    //used by Util.js
    Util;

  @import 'GLNSLCompiler/Util.js'

  @import "GLNSLCompiler/Expression.js"

  @import 'GLNSLCompiler/Variable.js'

  @import 'GLNSLCompiler/Sentence.js'

  @import 'GLNSLCompiler/Scope.js'

  @import 'GLNSLCompiler/CodeTree.js'

  /**
  @memberof NEngine.GLNSLCompiler
  @function compile
  @desc Compiles src using cfg
  @param {String} src - Contains the raw GLSL code
  @param {Object} cfg - Config container
  @return {String} translated
  */
  function compile(src, cfg) {
    var code_tree = CodeTree(src);

    return code_tree.translate(cfg);
  }
  module.compile = compile

  console.log(document.getElementById("testshader").innerHTML)
  return module
})();
