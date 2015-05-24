attribute vec4 position;
attribute vec4 color;

uniform mat4 uPMVMatrix1;
uniform mat4 uPMVMatrix2;

varying highp vec4 vColor;
void main(void) {
  //those are the trasposed matrixes, for optimized multiplication
  //for adding more than 4-dim proyection data:
  //the format of extra information: matn, n> 4, its to continue
  //going down, filling vertically, for first column, then 2, etc, and
  //those that cant get to fit, should be added to other places,
  //anyway, thats a lot further by now...

  gl_position = vec4(
    uPMVMatrix1[0]*position + uPMVMatrix2[1][0],
    uPMVMatrix1[1]*position + uPMVMatrix2[1][1],
    uPMVMatrix1[2]*position + uPMVMatrix2[1][2],
    0 //uPMVMatrix1[3]*position + uPMVMatrix2[1][3] we wont need
    //homogenous 4D inf. just linear proj

    //uPMVMatrix2[0]*position + uPMVMatrix2[2][0] we arent goint to process any n-depth-data yet
  );
  vColor = color;
}
