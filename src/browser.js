try {
  if(twgl)  //requires
    try {
      (function() {

        var global_root = this;

        @import 'NEngine/NEngine.js'

      })();
    }
    catch(e) {
      console.log('NEngine error: ', e);
    }
}
 catch(e) {
  console.log('You dont have an NEngine requeriment, NEngine not loaded', e);
}
