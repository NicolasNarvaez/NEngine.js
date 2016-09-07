/**
* @memberof NEngine.GLNSLCompiler
* @class CodeTree
* @desc Represents the code structure as a scope recursive tree that contains
* variables and sentences, it holds general tree data and objects, the
* recursive scope chain is implemented by the scope objects starting
* by the root "this.rootScope", it also gives you interfaces to manipulate it,
* generate an interpretation (interpret()) of the source, translate it
* (translate()) semantically-structurally, and then write it down (write()).
* :TODO:
*
* @prop {String} src - the source code for this tree
* @prop {String} out - The translated output from the last usage
* @prop {Scope} rootScope - The root of the scope tree, scope objects contain
*   most of the relevant data: variables, sentences, etc.
* @prop {Sentence[]} sentences - The sentences in the whole codetree, they also
*   are indexed in their respective scopes, thought sentence.scope.sentences
*/
function CodeTree(src) {
  if(!(this instanceof CodeTree))
    return new CodeTree(src);

  this.src = src;
  this.out = null;

  this.rootScope = null;
  this.sentences = [];

  if(src)
    this.interpret();
}
CodeTree.prototype = {
  /**
  * @memberof NEngine.GLNSLCompiler.CodeTree
  * @method interpret
  * @desc create scope tree and fills with sentences
  * @param {String} src - The source code to interpret, this.src is default
  */
  interpret: function(src) {
    var i, l, c,  //index, length, character
      sentence, //holds last created sentence object
      index_a,  //start of current sentence ( for´s, if´s, etc, also count )
      scope_parent,
      scope_current = new Scope();

    if(!src) src = this.src
    else this.src = src

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
