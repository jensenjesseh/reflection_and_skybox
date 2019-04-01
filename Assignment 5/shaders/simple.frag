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
    for(int i = 0; i < 4; i ++){
           vLight = normalize(uLightPos[i] - vModelView.xyz);
           float IDiffuse = dot(vLight, normalize(vNormal));
           IDiffuse = clamp(IDiffuse, 0.0, 1.0);
           totalDiffuse += uDiffuse[i] * IDiffuse;
    }
    vec3 totalLight = totalDiffuse + uLight;
    
    vec3 totalColor;
    totalColor = totalLight*vColor.rgb;
    //vec3 totalColor = (uLight)*vColor.rgb;
    gl_FragColor = vec4(totalColor, 1.0);
    //gl_FragColor.rgb = totalColor;
    //gl_FragColor.a = 1.0;
}
