
Shader = (function() {
  function Shader() {
    this.src = null;
    this.src_compiled = null;
    this.compiled = null;
  }

  Shader.prototype = {
    compile: function compile() {
      if(!this.src) return false;
      this.src_compiled = ShaderCompiler.compile(this.src);
    },
    load: function load(context) {

    }
  }

  return Shader;
})();
