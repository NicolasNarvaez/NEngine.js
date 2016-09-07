/**
* Used to create recursive translable expressión trees
*
*
* a and b point to expresions (variable expression) and in
* operator == null this.a contains a variable ("literal expression")
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

    //split by the lower operator precedence
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
