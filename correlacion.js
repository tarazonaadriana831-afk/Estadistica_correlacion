let dataset = [
    { x: 1, y: 50 },
    { x: 1, y: 80 },
    { x: 2, y: 130 },
    { x: 3, y: 220 },
    { x: 3, y: 65 },
    { x: 2, y: 95 }

];

let varXName = "Tipo de Membresía";
let varYName = "Monto Mensual ($)";

window.onload = function() {
    renderDataTable();
    calcularTodo();
};

function actualizarVariables() {
    varXName = document.getElementById('input-var-x').value || "Variable X";
    varYName = document.getElementById('input-var-y').value || "Variable Y";

    document.getElementById('th-table-x').innerText = `${varXName} (X)`;
    document.getElementById('th-table-y').innerText = `${varYName} (Y)`;
    document.getElementById('th-sp-x').innerText = `Rango (${varXName})`;
    document.getElementById('th-sp-y').innerText = `Rango (${varYName})`;
    document.getElementById('chart-legend-text').innerText = `Eje X: ${varXName} | Eje Y: ${varYName}`;

    renderDataTable();
    calcularTodo();
}

function renderDataTable() {
    const tbody = document.getElementById('data-tbody');
    tbody.innerHTML = '';
    
    dataset.forEach((item, index) => {
        let rowHTML = `<tr class="data-row" id="row-${index}">
            <td><b>#${index + 1}</b></td>
            <td><input type="number" step="any" value="${item.x}" onchange="updateDataValue(${index}, 'x', this.value)"></td>
            <td><input type="number" step="any" value="${item.y}" onchange="updateDataValue(${index}, 'y', this.value)"></td>
        </tr>`;
        tbody.innerHTML += rowHTML;
    });
}

function updateDataValue(index, field, value) {
    dataset[index][field] = parseFloat(value) || 0;
    calcularTodo();
}

function agregarFila() {
    dataset.push({ x: 5, y: 100 });
    renderDataTable();
    calcularTodo();
}

function eliminarFila() {
    if (dataset.length > 3) {
        dataset.pop();
        renderDataTable();
        calcularTodo();
    } else {
        alert("Debes mantener al menos 3 filas para los cálculos estadísticos.");
    }
}

function enfocarFila(index) {
    const seccionTabla = document.getElementById('seccion-tabla');
    seccionTabla.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const fila = document.getElementById(`row-${index}`);
    if (fila) {
        fila.classList.add('highlight-row');
        const primerInput = fila.querySelector('input');
        if (primerInput) primerInput.focus();
        setTimeout(() => {
            fila.classList.remove('highlight-row');
        }, 2000);
    }
}

function calcularRangosExactosIUJO(valores) {
    let indicesOrdenados = valores
        .map((val, idx) => ({ val, idx }))
        .sort((a, b) => a.val - b.val);

    let rangos = new Array(valores.length);
    let i = 0;
    let rangoActual = 1;

    while (i < indicesOrdenados.length) {
        let j = i;
        while (j < indicesOrdenados.length && indicesOrdenados[j].val === indicesOrdenados[i].val) {
            j++;
        }
        let cantidad = j - i;
        if (cantidad === 1) {
            rangos[indicesOrdenados[i].idx] = rangoActual;
            rangoActual++;
        } else {
            for (let k = i; k < j; k++) {
                rangos[indicesOrdenados[k].idx] = rangoActual + (cantidad - 1) / 2;
            }
            rangoActual += cantidad;
        }
        i = j;
    }
    return rangos;
}

function calcularTodo() {
    const n = dataset.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;

    dataset.forEach(d => {
        sumX += d.x;
        sumY += d.y;
        sumXY += (d.x * d.y);
        sumX2 += (d.x * d.x);
        sumY2 += (d.y * d.y);
    });

    let numerator = (n * sumXY) - (sumX * sumY);
    let denominator = Math.sqrt(((n * sumX2) - (sumX * sumX)) * ((n * sumY2) - (sumY * sumY)));
    let r = denominator !== 0 ? numerator / denominator : 0;

    let r2 = r * r;
    let noDet = 1 - r2;
    let r2Percent = (r2 * 100).toFixed(4);
    let noDetPercent = (noDet * 100).toFixed(4);

    let xVals = dataset.map(d => d.x);
    let yVals = dataset.map(d => d.y);
    let rangosX = calcularRangosExactosIUJO(xVals);
    let rangosY = calcularRangosExactosIUJO(yVals);

    let sumD2 = 0;
    let spearmanTbody = document.getElementById('spearman-tbody');
    spearmanTbody.innerHTML = '';

    dataset.forEach((d, index) => {
        let rx = rangosX[index];
        let ry = rangosY[index];
        let diff = rx - ry;
        let diff2 = diff * diff;
        sumD2 += diff2;

        let row = `<tr>
            <td>#${index + 1}</td>
            <td>${d.x}</td>
            <td>${rx % 1 === 0 ? rx : rx.toFixed(1)}</td>
            <td>${d.y}</td>
            <td>${ry % 1 === 0 ? ry : ry.toFixed(1)}</td>
            <td>${diff % 1 === 0 ? diff : diff.toFixed(1)}</td>
            <td>${diff2 % 1 === 0 ? diff2 : diff2.toFixed(1)}</td>
        </tr>`;
        spearmanTbody.innerHTML += row;
    });

    document.getElementById('sum-x').innerHTML = `<b>${sumX}</b>`;
    document.getElementById('sum-y').innerHTML = `<b>${sumY}</b>`;
    document.getElementById('sum-d2').innerHTML = `<b>${sumD2}</b>`;

    let rs = 1 - ((6 * sumD2) / (n * (n * n - 1)));

    document.getElementById('r-value').innerText = r.toFixed(4);
    document.getElementById('r2-value').innerText = r2Percent + "%";
    document.getElementById('nd-value').innerText = noDetPercent + "%";
    document.getElementById('rs-value').innerText = rs.toFixed(4);

    document.getElementById('text-pearson').innerText = 
        `El coeficiente de Pearson (r = ${r.toFixed(4)}) describe la intensidad y dirección lineal de la relación entre "${varXName}" y "${varYName}".`;

    document.getElementById('text-r2').innerText = 
        `En base a las observaciones tomadas, la variación de "${varYName}" se debe en un ${r2Percent}% a la variación de "${varXName}".`;

    document.getElementById('text-nodet').innerText = 
        `En base a las observaciones tomadas, la variación de "${varYName}" NO se debe en un ${noDetPercent}% a la variación de "${varXName}".`;

    document.getElementById('text-spearman').innerText = 
        `El coeficiente de correlación de rango de Spearman (Rs = ${rs.toFixed(4)}) evalúa la asociación basada en la jerarquía u orden de importancia asignado a los datos.`;

    renderChartSVG(dataset);
}

function renderChartSVG(data) {
    const svgGroup = document.getElementById('chart-elements');
    const gridGroup = document.getElementById('grid-lines');
    svgGroup.innerHTML = '';
    gridGroup.innerHTML = '';

    let minX = Math.min(...data.map(d => d.x));
    let maxX = Math.max(...data.map(d => d.x), minX + 1);
    let minY = Math.min(...data.map(d => d.y));
    let maxY = Math.max(...data.map(d => d.y), minY + 1);

    for (let i = 1; i <= 4; i++) {
        let gx = 40 + i * 50;
        let lineX = document.createElementNS("http://www.w3.org/2000/svg", "line");
        lineX.setAttribute("x1", gx); lineX.setAttribute("y1", 20);
        lineX.setAttribute("x2", gx); lineX.setAttribute("y2", 160);
        gridGroup.appendChild(lineX);

        let gy = 20 + i * 28;
        let lineY = document.createElementNS("http://www.w3.org/2000/svg", "line");
        lineY.setAttribute("x1", 40); lineY.setAttribute("y1", gy);
        lineY.setAttribute("x2", 300); lineY.setAttribute("y2", gy);
        gridGroup.appendChild(lineY);
    }

    let pointsCoords = data.map(d => {
        let cx = 40 + ((d.x - minX) / (maxX - minX || 1)) * 240;
        let cy = 160 - ((d.y - minY) / (maxY - minY || 1)) * 130;
        return { cx, cy, x: d.x, y: d.y };
    });

    if (pointsCoords.length > 1) {
        let first = pointsCoords[0];
        let last = pointsCoords[pointsCoords.length - 1];
        let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", first.cx); line.setAttribute("y1", first.cy);
        line.setAttribute("x2", last.cx); line.setAttribute("y2", last.cy);
        line.setAttribute("class", "trend-line");
        svgGroup.appendChild(line);
    }

    pointsCoords.forEach((p, index) => {
        let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", p.cx);
        circle.setAttribute("cy", p.cy);
        circle.setAttribute("r", "6");
        circle.setAttribute("class", "point");
        
        let title = document.createElementNS("http://www.w3.org/2000/svg", "title");
        title.textContent = `Casilla #${index + 1} -> ${varXName}: ${p.x} | ${varYName}: ${p.y}`;
        circle.appendChild(title);

        circle.addEventListener('click', () => {
            enfocarFila(index);
        });

        svgGroup.appendChild(circle);
    });
}