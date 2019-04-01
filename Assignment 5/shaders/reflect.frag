 precision lowp float;
 uniform samplerCube uSampler;

 varying vec4 vModelView;
 varying vec3 vNormal;

void main()
{
     vec4 eye = vec4(0.0, 0.0, 1.0, 1.0);
     vec3 r = reflect(vNormal,normalize(vModelView.xyz - eye.xyz));
     gl_FragColor = textureCube(uSampler, r);
}