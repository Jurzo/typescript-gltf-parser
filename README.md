## Asset
- Consists of root nodes
- Optionally animations
- Can be rendered by looping through nodes and rendering them

## Node
Can contain a
- Mesh
- Skin(only if a mesh is also present)
- optionally local transforms
- create current transform when necessary
    - for joints and/or animations

## Mesh
- Is made up of separately drawable primitives

## Primitive
- Vertex data
- Possibly material

## Skin
- Consists of joints
- Inverse bind matrix for each joint in the order they are listed in joints
- Generate joint matrices by looping through the joints list and getting node's current transform

## Joint
- Joints refer to node indices

## Animation
- can have multiple samplers
    - samplers target a node's property
        - rot, loc, scale, mat
    - input accessor defines accepted time input and output
    - output accessor gives new value for node property

```pseudo
draw():
    for root in asset:
        if (updated) updateNode(root)
        drawNode(root)

drawNode(node):
    if (mesh in node) draw mesh primitives with current local transform
    for childNode in node:
        drawNode(childNode)

animate(time):
    for sampler in current animation:
        update target node property with new sampler values

updateNode(node, parent = null):
    if (parent):
        node.currentTransform = node.transform * parent.transform
    for childNode in node:
        updateNode(childNode, node)
```