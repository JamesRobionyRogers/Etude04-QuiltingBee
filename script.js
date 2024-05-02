// Defining all of the elements I will need to use 
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const textarea = document.getElementById('textarea__instructions');
const button = document.getElementById('button__generateQuilt');

const slider = document.getElementById('slider__layer')

// Defining the error message popups
const Toast = Swal.mixin({
    toast: true,
    position: "bottom-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
    }
});

const drawQuilt = () => {

    // Remove any existing drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get the instructions from the textarea 
    instructionsArray = extractInstructions();

    // Update the slider info to show the number of layers
    updateSlider(instructionsArray.length);

    // Track all corners positions for drawing subsequent squares onto using a stack
    let allCorners = new Stack(); 

    // Calculate the position of the square - center on the canvas
    const x = canvas.width / 2;
    const y = canvas.height / 2;

    // Pushing the initial corners to the stack
    allCorners.push([x, y]);

    // Iterate over the instructions row by row 
    instructionsArray.forEach((row, layer) => {
        // If the layer is greater than the slider value stop drawing
        if (layer > Number(slider.value)-1) {
            return;
        }

        let [size, r, b, g] = row;

        // Create a new stack to store the corners of the new squares
        let newCorners = new Stack();

        // Calculate the size of the square
        size = Math.min(canvas.width, canvas.height) * size;

        // Iterate over all the corners a new square must be drawn on
        while (allCorners.size() > 0) {
            let currentPosition = allCorners.pop();
            let [x, y] = currentPosition;

            // Adjusting x and y so the square is centered on the corners 
            x = x - size / 2;
            y = y - size / 2;

            // Draw the square
            ctx.fillStyle = `rgb(${r}, ${b}, ${g})`;
            ctx.fillRect(x, y, size, size);

            // Calculate all the corners of the square and add them to the corners array
            const corners = [
                [x, y],
                [x + size, y],
                [x + size, y + size],
                [x, y + size]
            ];

            // Add the corners to the newCorners stack
            corners.forEach(corner => newCorners.push(corner));
        }

        // After drawing all the squares, update the allCorners stack to the newCorners stack
        allCorners = newCorners;
    });

}

const extractInstructions = () => {
    const instructions = textarea.value.trim()

    // Input validation
    validateInstructions(instructions);

    // Split the instructions into a 2d array of numbers
    let instructionsArray = instructions.split('\n').map(row => row.split(/\s+/).map(Number));

    // Normalise so that the sum of the sizes is 1
    let totalSize = instructionsArray.reduce((acc, row) => acc + row[0], 0);
    instructionsArray = instructionsArray.map(row => [row[0] / totalSize, ...row.slice(1)]);

    return instructionsArray;
}

const validateInstructions = (instructions) => {
    // Check if the instructions are not empty 
    if (instructions.trim() === '') {
        Toast.fire({
            icon: 'error',
            title: 'Please enter some instructions'
        });
        return;
    }

    // Check if the instructions contain only numbers (can be floating point) and spaces
    const regex = /^[0-9\s.]+$/;
    if (!instructions.match(regex)) {
        Toast.fire({
            icon: 'error',
            title: 'Instructions can only contain numbers and spaces'
        });
        return;
    }

    // Check that each row has exactly 4 numbers
    const rows = instructions.split('\n');
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i].trim();
        const numbers = row.split(/\s+/);
        if (numbers.length !== 4) {
            Toast.fire({
                icon: 'error',
                title: `Row ${i + 1} does not contain exactly 4 numbers`
            });
            return;
        }
    }
}

const updateSlider = (maxValue) => {
    slider.max = maxValue;

    // Remove all span elements with class of layer__number
    document.querySelectorAll('.layer__number').forEach(element => element.remove());

    // Update the span elements denoting layers 
    for (let i = 0; i <= maxValue; i++) {
        const span = document.createElement('span');
        span.classList.add('layer__number', 'text-sm', 'text-gray-500');
        span.innerText = i;
        document.getElementById('slider__values').appendChild(span);
    }
    
}

const drawExampleQuilt = () => {
    textarea.value = exampleInstructions;
    drawQuilt();
}

// Pre-populate the textarea with some instructions
defaultInstructions = `
100 255 0 0
50 0 255 0
25 0 0 255`.trim();

exampleInstructions = `
1.0 255 0 0
0.8 0 255 0
0.1 0 0 255
`.trim();

textarea.value = defaultInstructions;

// Setting the size of the canvas to be the height of the window and a square 
canvas.width = window.innerHeight;
canvas.height = window.innerHeight;

// Update the canvas every time the textarea changes
textarea.addEventListener('input', drawQuilt);

// Update the canvas every time the slider changes
slider.addEventListener('input', drawQuilt);
