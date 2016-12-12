var CodeTree = (function CodeTreeLoader() {

/**
@memberof NEngine.GLNSLCompiler
@class CodeTree
@desc Represents the code structure as a scope recursive tree that contains
variables and sentences, it holds general tree data and objects, the
recursive scope chain is implemented by the scope objects starting
by the root "this.rootScope", it also gives you interfaces to manipulate it,
generate an interpretation (interpret()) of the source, translate it
(translate()) semantically-structurally, and then write it down (write()).
:TODO:
  implement SrcMap usage, to standarize code manipulation across different
    semantic-level objects

@prop {String} src - the source code for this tree
@prop {String} out - The translated output from the last usage
@prop {Scope} rootScope - The root of the scope tree, scope objects contain
  most of the relevant data: variables, sentences, etc.
@prop {Sentence[]} sentences - The sentences in the whole codetree, they also
  are indexed in their respective scopes, thought sentence.scope.sentences
*/
function CodeTree(src, js_variables) {
  if(!(this instanceof CodeTree))
    return new CodeTree(src, js_variables);

  this.js_variables = js_variables || {}
  this.src = {
    original: src,
    mapped: null,
    symbols: {
      strings: [],
    }
  }
  this.out = null;

  this.rootScope = null;
  this.sentences = [];

  if(src)
    this.interpret();
}
CodeTree.prototype = {
  /**
  @memberof NEngine.GLNSLCompiler.CodeTree
  @method interpret
  @desc create scope tree and fills with sentences, also maps each string to
    a symbols in the src mapping, referenced has "string_number"

    TODO: pass all transofgmrations to srcmap actions

  @param {String} src - The source code to interpret, this.src is default
  */
  interpret: function interpret(src) {
    var r, reg, str,
      i, i_o, l, c,  //index, index_original, length, character
      in_string = false,
      in_string_scape,
      strings = [],
      strings_map,
      string,
      sentence, //holds last created sentence object
      index_a,  //start of current sentence ( for´s, if´s, etc, also count )
      scope_parent,
      scope_current;

    if(!src) src = this.src.original
    else this.src.original = src

    // remove comments
    this.src.original = src = src.
      replace(/\/\*.*?\*\//gi, '').
      replace(/\/\/.*?\n/gi, '')

    //execute js
    reg = /'(.*?)'/gi
    while(r=reg.exec(src))
      //replace each captured js str with its execution
      this.src.original = src = src.
        replace(r[0], this.shader.js_execute(r[1]).res )

    strings_map = this.src.symbols.strings
    this.src.mapped = src

    scope_current = new Scope()
    scope_current.src = this.src;
    scope_current.range = [0]
    scope_current.code_tree = this;

    for(i=0, i_o=0, l = src.length, sentence_number = 0, index_a = 0;
        i<l ; i++, i_o++) {

      c = src[i];

      //end string
      if(in_string) {
        if(c == in_string) {

          //handle scaped string delimitter
          in_string_scape = 0 //will contain number of scapes
          while(src[i-in_string_scape-1] == '\\')
            in_string_scape++

          if(in_string_scape%2) { //wasnt scaped

            string.range.push(i_o)
            string.value = src.substr(string.range_mapped[0],
              string.range_mapped[1] - string.range_mapped[0] + 1)
            //strip the string
            src = this.src.mapped = src.substr(0, string.range_mapped[0]+1) +
              (strings_map.length-1) +
              src.substr( string.range_mapped[1])

            //restore index, state
            i = string.range_mapped
            in_string = false
            continue
          }
        }
      }
      //start string
      else if(c == '"' || c == "'") {
        in_string = c

        string = {
          value: null,
          range: [i_o], //the range on src.original
          range_mapped: [i] //the range on the src.mapped
        }
        strings.push(string)
        strings_map.push(string)
        string.range_mapped.push(
          i+ (""+(strings_map.length-1)).length + 1
        )
        continue
      }

      if(!in_string) {

        if(c == '{') {
          scope_parent = scope_current;
          scope_current = new Scope();  //TODO:get scope from last sentence
          scope_current.setParent(scope_parent);
          scope_current.range = [i];
        }
        //{: to recognize also scope-creating sentences
        if(c == ';' || c == '{' || c == '}') {
          sentence = new Sentence({
            src: src.substr(index_a, i),
            range: [index_a, i-1],
            scope: (c=='{')? scope_parent: scope_current,
            thisScope: (c=='{')? scope_current: null,
            strings: strings,
          });
          this.sentences.push(sentence)
          index_a = i+1  //inmediatly after [{,}] symbol
          strings = []
        }
        if(c == '}') {
          scope_current.range.push(i);
          scope_current = scope_parent;
        }

      }

    }
    scope_current.range.push(src.length - 1)

    this.rootScope = scope_current;
  },
  /**
  * detects sentences that use glnsl syntax or datatypes and ask them to
  * translate
  */
  translate: function translate() {
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
  write: function write() {

  },
}

return CodeTree
})()
