precision lowp float;
varying vec4 vColor;
varying vec3 vNormal;
varying vec4 vModelView;

uniform vec3 uLightPos[4];
uniform vec3 uLight;
uniform vec3 uDiffuse[4];

void main()
{
    vec3 vLight;
    vec3 totalDiffuse = vec3(0,0,0);
    vec3 totalSpecular = vec3(0,0,0);
    vec3 viewerPos = vec3(0.0, 0.0, 3.0);

    float specularReflect;
    //vec4 reflection = vec4(0,0,0,0);
    for(int i = 0; i < 4; i ++){
          vLight = normalize(uLightPos[i] - vModelView.xyz);
          float IDiffuse = dot(vLight, normalize(vNormal));
          IDiffuse = clamp(IDiffuse, 0.0, 1.0);

          
           vec3 reflection = 2.0*IDiffuse*normalize(vNormal) - vLight;
           vec3 V = normalize(viewerPos - vModelView.xyz);

           //float cosReflect = dot(normvNormal, vLight);

          if (IDiffuse > 0.0){
                specularReflect = pow(dot(V, normalize(reflection)), 5.0);
           }
           else{
               specularReflect = 0.0;
           }
         
             // specularReflect = 1.0;
          
          totalSpecular += uDiffuse[i] * specularReflect;

          totalDiffuse += uDiffuse[i] * IDiffuse;
    }

    vec3 totalLight = totalDiffuse + uLight + totalSpecular;
    vec3 totalColor;
    totalColor = totalLight*vColor.rgb;

    gl_FragColor = vec4(totalColor, 1.0);
}
