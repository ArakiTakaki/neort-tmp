// ref https://wgld.org/d/glsl/g012.html
// exec https://neort.io/createfromglsl
precision highp float;
uniform vec2 resolution;
uniform float time;
uniform vec2 mouse;
uniform sampler2D backbuffer;


const float PI = 3.14159265;
const vec3 lightDir = vec3(-0.577, 0.577, 0.577);
const float angle = 60.0;
const float fov = angle * 0.5 * PI / 180.0;

const float sphereSize = 1.0; // 球の半径
                              //
vec3 trans(vec3 p){
    return mod(p, 4.0) - 2.0;
}

float distanceFunc(vec3 p){
    return length(trans(p)) - sphereSize;
}

vec3 getNormal(vec3 p){
    float d = 0.0001;
    return normalize(vec3(
        distanceFunc(p + vec3(  d, 0.0, 0.0)) - distanceFunc(p + vec3( -d, 0.0, 0.0)),
        distanceFunc(p + vec3(0.0,   d, 0.0)) - distanceFunc(p + vec3(0.0,  -d, 0.0)),
        distanceFunc(p + vec3(0.0, 0.0,   d)) - distanceFunc(p + vec3(0.0, 0.0,  -d))
    ));
}

void main(void) {
    vec2 p = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);

    // camera
    vec3 cPos = vec3(0.0,  0.0,  2.0);
    cPos.x += sin(time) * 10.0;
    cPos.y += cos(time) * 10.0;
    vec3 cDir = vec3(0.0,  0.0, -1.0);
    cDir.x += sin(time);
    cDir.y += cos(time);
    vec3 cUp  = vec3(0.0,  1.0,  0.0);
    vec3 cSide = cross(cDir, cUp);

    float targetDepth = 1.0;

    // ray
    // vec3 ray = normalize(cSide * p.x + cUp * p.y + cDir * targetDepth);
    vec3 ray = normalize(vec3(sin(fov) * p.x, sin(fov) * p.y, -cos(fov)));

    // marching loop
    float distance = 0.0; // レイとオブジェクト間の最短距離
    float rLen = 0.0;     // レイに継ぎ足す長さ
    vec3  rPos = cPos;    // レイの先端位置

    for(int i = 0; i < 128; i++){
        distance = distanceFunc(rPos);
        rLen += distance;
        rPos = cPos + ray * rLen;
    }

    // hit check
    if(abs(distance) < 0.001){
        vec3 normal = getNormal(rPos);
        // float diff = clamp(dot(lightDir, normal), 0.1, 1.0);
        // gl_FragColor = vec4(vec3(diff), 1.0);
        gl_FragColor = vec4(normal, 1.0);
    }else{
        gl_FragColor = vec4(vec3(0.0), 1.0);
    }
}
