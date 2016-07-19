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

GLNSLCompiler = (function() {
  var GrammarUtil,
    Vartypes;

  /**
  * Used to create recursive expressión trees
  *
  * a and b point to expresions (variable expression) and in
  * operantor == null this.a contains a variable (literal expression)
  */
  function Expression(opts) {
    this.src = opts.src || null;
    this.scope = opts.scope || null;

    this.a = opts.a || null;
    this.b = opts.b || null;
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
        reg: /[^\+\-\^\|&!=<>%\*/](?:\+\+)*(?:--)*(=)[^=]/gi,
      },
      {
        id: '+',
        reg: /[^\+](?:\+\+)*(\+)[^\+=]/gi,
      },
      {
        id: '-',
        reg: /[^\-](?:--)*(-)[^-=]/gi,
      },
      {
        id: '*',
        reg: /(\*)[^=]/gi,
      },
      {
        id: '/',
        reg: /(\/)[^=]/gi,
      },
    ],

    /**
    * returns te end variable type after aplication of the operation
    */
    vartype: function vartype() {

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
    * then, start from lowest precedence operators (the last executing)
    * and splits the expression on the lower it finds into the next
    * two expressions, then, starts the new expressions sending them
    * the code with the parenthesis instead of the variables
    */
    interpret: function interpret() {
      var re, res, i, j, l, l2, str_a, str_b
        code,
        c,
        parenthesis_last,
        parenthesis_level,
        parenthesis,
        parenthesis_symbol,
        parenthesis_table = [],
        operators = ['=', '+', '-', '*', '/'];

      re = /^\s*\((.*)\)\s*$/gi;

      code = this.src;
      while( res = re.exec(code) )
        code = res[1];

      //create parenthesis table

      for(i=0,l=code.length, parenthesis_level=0; i<l;i++) {
        c = code[i];
        if(c == '(') {
          if(parenthesis_level == 0)
            parenthesis_last = i;

          parenthesis_level++;
        }
        if(c == ')') {
          parenthesis_level--;
          if(parenthesis_level == 0) {
            parenthesis = code.substr(parenthesis_last, i+1);

            parenthesis_table.push(parenthesis);
            parenthesis_symbol = ' $'+(parenthesis_table.length-1)+" ";

            code = code.replace(parenthesis, parenthesis_symbol);
            i = parenthesis_last + parenthesis_symbol.length - 1;
          }
        }
      }

      //start spliting the operators from lower precedence into higher

      for(i = 0, l = code.length; i < l; i++) {
        c = code[i];
        for(j=0, l2=operators.length; j<l2; j++)
          if(c == operators[j]) {

            this.a = code.substr(0, i);
            this.b = code.substr(i+1, code.length-i);

            this.operator = operators[j];
            this.a =

            l2 = l = 0;
          }
      }

      //when there was no operator found, this is a variable
      if(!this.a) {

      }
    }
  }

  Vartypes = (function() {
    var types ={
      /**
      *
      */
      vecn: {
        exp: 'vec\d+',
        /**
        * creates type info from variable declaration information
        */
        constructor : function (data) {
          this.size = data.datatype.match(/\d/gi);
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
        exp: 'mat\d(_\d+)',
        constructor: function(data) {

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
      }
    }



    return {
      types: types,
    }
  })();

  GrammarUtil = (function(){
    var grammar_lists;

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
        'mat.*\\s', //n*m matrix
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

  /**
  * represents a single glsl sentence
  * has inf. about variables, post-translation, and source location
  * every range is in global (rootScope) coordinates
  *
  * this.number -> the index of this sentence in the scope sentence list;
  * this.thisScope -> filled only on sentence-block containing sentences
  * types:  declaration, expression (this has subtypes: f.call, operation,
  *         etc), null, etc
  *       null represents an instruction that doesnt needs translation
  *       or that does nothing at all
  */
  function Sentence(opts) {
    this.src = opts.src;
    this.scope = opts.scope || null;
    this.range = opts.range || null;
    this.number = opts.number || -1;

    this.type = opts.type || null;

    //variables or expressions in declaration sentences
    this.components = opts.components || [];
    //only scope containing sentences (ifs, fors, etc)
    this.thisScope = null;
    //only in declaration sentences
    this.variables = null;


    //result sentence
    this.out = null;


    if(this.src && this.scope && this.number) {
      this.scope.addSentence(this);
      this.interpret();
    }
  }
  Sentence.prototype = {
    /**
    * fills the sentence information interpreting the sentence str
    * components list, its type and type related cfg,
    *
    * recognizes the sentence type and configures it accordingly
    * currently only types declaration, expression and null
    * are implemented, expression sentences include assignation
    */
    interpret: function interpret() {
      var src = this.src, re, str, res, i, opts,
        lists = GrammarUtil.grammar_lists, variable;

      if( res = RegExp( //detects declaration
        "\\s*(invariant)*\\s*("+lists.storage_qualifiers.join('|')+")*\\s*"+
        "("+lists.precision_qualifiers.join('|')+")*\\s*"+
        "("+lists.datatypes.join('|')+")*\\s*(.*)", 'gi'
        ).exec(src) ) {

        this.type = 'declaration'

        //verify sentence
        res.shift();
        res[0] = res[0] || null;
        res[1] = res[1] || 'none';
        if(!res[3]) throw "no datatype on variable declaration";


        //variable constructor data
        opts = {
          sentence: this,
          scope: this.scope,
          type: 'primitive',
          qualifiers: res,
          }


        str = res[4];
        re = /([^,]+)/g;

        this.variables = [];  i = 0;
        while(res = re.exec(str)) {
          opts.sentence_place = i++;
          opts.name = (/\w+/g).exec(res);
          if(res.match('=')) {
            //TODO fill with expression
          }

          variable = new Variable(opts);
          this.variables.push(variable);
        }
      }
      else if( src.match(/^\s*\w+\s*/gi) ) { //expression

        this.type = "expression"

      }

      //this.type obnviously is null => this will not be processed in any way
    },
    /**
    * generates a valid GLSL sentence (or group of sentences) that mimics the
    * functionality on this sentence and stores it in this.out as a str
    * it works differently on each sentence type
    */
    translate: function() {

    }
  }

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

  /**
  * represents the code structure as a scope recursive tree that contains
  * variables and sentences
  */
  function CodeTree(src) {
    if(!(this instanceof CodeTree))
      return new CodeTree(src);
    this.src = src;
    this.rootScope = null;
    this.out = null;
    this.sentences = [];
    if(src)
      this.interpret(src);
  }
  CodeTree.prototype = {
    /**
    * create scope tree and fills with sentences
    */
    interpret: function(src) {
      var i, l, c,  //index, length, character
        sentence, //holds last created sentence object
        index_a,  //start of current sentence ( for´s, if´s, etc, also count )
        scope_parent,
        scope_current = new Scope();

      scope_current.src = src;
      scope_current.range = [0, src.length - 1]
      scope_current.code_tree = this;
      for(i = 0, l = src.length, sentence_number = 0, index_a = 0;
          i<l ; i++) {

        c = src[i];

        //{: to recognize also scope-creating sentences
        if(c == ';' || c == '{' || c == '}') {
          sentence = new Sentence({
            src: src.substr(index_a, i),
            range: [index_a, i-1],
            scope: scope_current,
          });
          this.sentences.push(sentence);
          index_a = i+1;
        }

        if(c == '{') {
          scope_parent = scope_current;
          //TODO:program block scope generation on sentence parser
          scope_current = new Scope();  //TODO:get scope from last sentence
          scope_current.setParent(scope_parent);
          scope_current.range = [i];
        }
        if(c == '}') {
          scope_current.range.push(i);
          scope_current = scope_parent;
        }


      }

      this.rootScope = scope_current;
    },
    /**
    * detects sentences that use glnsl syntax or datatypes and ask them to
    * translate
    */
    translate: function(cfg) {
      if(cfg) this.cfg = cfg;
      if(!this.rootScope) return null;

      var i, l, sentences = this.sentences, sentence,
        src = this.src,
        out = "",
        a = 0, b;

      //for each sentence that needs translation
      for(i=0, l = this.sentences.length; i<l; i++) {
        sentence = sentences[i];
        if(sentence.needsTranslation()) {

          //add translated sentence to previous non-translated content into out
          b = sentence.range[0];
          out += src.substr(a, b) + sentence.translate();
          a = sentence.range[1]+1;
        }
      }

      //add remaining piece.
      b = src.length;
      out += src.substr(a,b);
      return this.out = out;
    },
    /**
    * TODO separate code sintesis from code translation
    * code translation should be able to detect specific regions that have
    * changed, and write also should be
    * it uses the translated sentences versions to generate an
    * updated src string
    */
    write: function() {

    }
  }



  function compile(src, cfg) {
    var code_tree = CodeTree(src);

    return code_tree.translate(cfg);
  }

  console.log(document.getElementById("testshader").innerHTML)
  return {
    compile: compile
  }
})();
