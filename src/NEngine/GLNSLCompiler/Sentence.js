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
