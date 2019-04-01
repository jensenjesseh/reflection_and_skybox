precision lowp float;
varying vec3 vTexCoords;
uniform samplerCube uSampler;

void main()
{
    gl_FragColor = textureCube(uSampler, vTexCoords);
}