// Environment
uniform mat4 uAspect;
uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;
uniform mat4 uInverseModel;

// Geometry
attribute vec4 aPosition;
attribute vec4 aColor;
attribute vec4 aNormal;

// Output
varying vec4 vColor;
varying vec3 vNormal;
varying vec4 vModelView;

void main()
{
    vec4 modelView = uModel*aPosition;
    vModelView = modelView;

    vec3 newNormal = normalize(uInverseModel*normalize(aNormal)).xyz;
    vNormal = newNormal;

    vColor = aColor;
    
    mat4 mFinal = uAspect * uProjection * uView * uModel;

    gl_Position = mFinal * aPosition;
}
