const itemSize = 2;
const box = { min: [0, 0], max: [0, 0] };

function bounds(positions) {
    const count = positions.length / itemSize;
    box.min[0] = positions[0];
    box.min[1] = positions[1];
    box.max[0] = positions[0];
    box.max[1] = positions[1];

    for (let i = 0; i < count; i++) {
        const x = positions[i * itemSize + 0];
        const y = positions[i * itemSize + 1];
        box.min[0] = Math.min(x, box.min[0]);
        box.min[1] = Math.min(y, box.min[1]);
        box.max[0] = Math.max(x, box.max[0]);
        box.max[1] = Math.max(y, box.max[1]);
    }
}

function computeBox(positions, output) {
    bounds(positions);
    output.min.set(box.min[0], box.min[1], 0);
    output.max.set(box.max[0], box.max[1], 0);

    return output;
};

function computeSphere(positions, output) {
    bounds(positions);
    const minX = box.min[0];
    const minY = box.min[1];
    const maxX = box.max[0];
    const maxY = box.max[1];
    const width = maxX - minX;
    const height = maxY - minY;
    const length = Math.sqrt(width * width + height * height);
    output.center.set(minX + width / 2, minY + height / 2, 0);
    output.radius = length / 2;
};

export default {
    computeBox,
    computeSphere,
}