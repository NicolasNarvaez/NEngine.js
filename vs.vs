attribute vec4 a_position;
attribute vec4 a_color;

uniform mat4 uPMVMatrix1;
uniform mat4 uPMVMatrix2;
uniform mat4 uPMVMatrix3D;

varying highp vec4 vColor;
void main(void) {
  //those are the trasposed matrixes, for optimized multiplication
  //for adding more than 4-dim proyection data:    //the format of extra information: matn, n> 4, its to continue
  //going down, filling vertically, for first column, then 2, etc, and
  //those that cant get to fit, should be added to other places,
  //anyway, thats a lot further by now...

  //convert to NDC
  gl_Position = uPMVMatrix1*a_position;
  //currently, a_position.v will always be 1 when vertices reach here
  gl_Position.x += uPMVMatrix2[1][0];
  gl_Position.y += uPMVMatrix2[1][1];
  gl_Position.z += uPMVMatrix2[1][2];
  gl_Position.w += uPMVMatrix2[1][3];

  highp float a_position_v = uPMVMatrix2[0][0]*a_position.x + uPMVMatrix2[1][0]*a_position.y +
  uPMVMatrix2[2][0]*a_position.z + uPMVMatrix2[3][0]*a_position.w + uPMVMatrix2[0][2];

  //use homogenous cooordinate
  gl_Position /= a_position_v;
  //already in NDC !!!

  a_position_v = gl_Position.w;

  //convert to 3D eyespace
  gl_Position.z += -1.0;
  gl_Position *= 50.0;
  gl_Position.w = 1.0;
  //convert to NDC
  gl_Position *= uPMVMatrix3D;

  //if(a_position_v > 1.0 || a_position_v < -1.0)
      //gl_Position.z = 1000.0*gl_Position.w;
  vColor = a_color;
}
