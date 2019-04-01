uniform mat4 uAspect;
uniform mat4 uProjection;
uniform mat4 uView;

attribute vec4 aPosition;

varying vec3 vTexCoords;

void main()
{
    mat4 mView2 = mat4(mat3(uView));
    
    mat4 mFinal = uAspect * uProjection * mView2;

    vTexCoords = aPosition.xyz;
    gl_Position = mFinal*aPosition;
}