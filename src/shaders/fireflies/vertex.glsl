uniform float uPixelRatio;
uniform float uSize;
uniform float uTime;
attribute float aScale;

void main(){
    vec4 modelPosition = modelMatrix * vec4(position, 1.1);

 // Calculate rotation angle
    float angle = 0.01; // 'speed' controls the rotation speed

    // modelPosition.x += sin(uTime + modelPosition.x * 100.0) * aScale * 0.2;

     // Rotate around a point
    float rotatedX = cos(angle) * modelPosition.x - sin(angle) * modelPosition.z;
    float rotatedZ = sin(angle) * modelPosition.x + cos(angle) * modelPosition.z;

   float elevation = 0.2;
   
    modelPosition.x = rotatedX + sin(uTime + modelPosition.x * 100.0) * aScale * 0.2;
    modelPosition.y += elevation + cos(uTime + modelPosition.y * 100.0) * aScale * 0.2;
    modelPosition.z = rotatedZ;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;
    gl_PointSize = uSize * aScale * uPixelRatio;
    gl_PointSize *= (1.0 / - viewPosition.z);
}