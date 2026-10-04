let dataset = [
    { x: 1, y: 25 },
    { x: 2, y: 40 },
    { x: 3, y: 55 },
    { x: 4, y: 65},
    { x: 5, y: 80},
];

let varXName = "Cantidad de servicios incluidos en la membresia";
let varYName = "Precio mensual de la membresia";

window.onload = function() {
    renderDataTable();
    calcularTodo();
};

function actualizarVariables() {
    varXName = document.getElementById('input-var-x').value || "Variable X";
    varYName = document.getElementById('input-var-y').value || "Variable Y";

    dataset = [];

    document.getElementById('th-table-x').innerText = `${varXName} (X)`;
    document.getElementById('th-table-y').innerText = `${varYName} (Y)`;
    document.getElementById('th-p-x').innerText = `${varXName} (X)`;
    document.getElementById('th-p-y').innerText = `${varYName} (Y)`;
    document.getElementById('th-sp-x').innerText = `${varXName} (X)`;
    document.getElementById('th-sp-y').innerText = `${varYName} (Y)`;
    document.getElementById('chart-legend-text').innerText = `Eje X (${varXName}) vs Eje Y (${varYName})`;

    renderDataTable();
    calcularTodo();
}

function renderDataTable() {
    const tbody = document.getElementById('data-tbody');
    tbody.innerHTML = '';
    
    if (dataset.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#64748b;">No hay casillas. Agrega una nueva fila para comenzar.</td></tr>`;
        return;
    }

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
    dataset.push({ x: 0, y: 0 });
    renderDataTable();
    calcularTodo();
}

function eliminarFila() {
    if (dataset.length > 0) {
        dataset.pop();
        renderDataTable();
        calcularTodo();
    } else {
        alert("No hay casillas para eliminar.");
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
        setTimeout(() => { fila.classList.remove('highlight-row'); }, 2000);
    }
}

function calcularRangosAscendentesEnteros(valores) {
    let indicesOrdenados = valores
        .map((val, idx) => ({ val, idx }))
        .sort((a, b) => a.val - b.val);

    let rangos = new Array(valores.length);
    for (let i = 0; i < indicesOrdenados.length; i++) {
        rangos[indicesOrdenados[i].idx] = i + 1;
    }
    return rangos;
}

function obtenerInterpretacionFuerzaSimple(val) {
    let abs = Math.abs(val);
    let signo = val >= 0 ? "Positiva" : "Negativa";
    let fuerza = "";

    if (abs >= 0.81) fuerza = "Muy Fuerte";
    else if (abs >= 0.61) fuerza = "Fuerte";
    else if (abs >= 0.41) fuerza = "Moderada";
    else if (abs >= 0.20) fuerza = "Débil";
    else fuerza = "Muy Débil o Nula";

    return `${signo} y ${fuerza}`;
}

function calcularTodo() {
    const n = dataset.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;

    let pearsonTbody = document.getElementById('pearson-tbody');
    pearsonTbody.innerHTML = '';

    let spearmanTbody = document.getElementById('spearman-tbody');
    spearmanTbody.innerHTML = '';

    if (n === 0) {
        document.getElementById('sum-x').innerHTML = `<b>0</b>`;
        document.getElementById('sum-y').innerHTML = `<b>0</b>`;
        document.getElementById('sum-x2').innerHTML = `<b>0</b>`;
        document.getElementById('sum-y2').innerHTML = `<b>0</b>`;
        document.getElementById('sum-xy').innerHTML = `<b>0</b>`;
        document.getElementById('sum-d2').innerHTML = `<b>0</b>`;
        document.getElementById('r-value').innerText = "0.00";
        document.getElementById('r2-value').innerText = "0.00%";
        document.getElementById('nd-value').innerText = "0.00%";
        document.getElementById('rs-value').innerText = "0.00";
        document.getElementById('text-tipo-correlacion').innerText = "Sin datos";
        document.getElementById('text-pearson').innerText = "Agrega datos para ver la interpretación.";
        document.getElementById('text-r2').innerText = "Agrega datos para ver el cálculo.";
        document.getElementById('text-nodet').innerText = "Agrega datos para ver el cálculo.";
        document.getElementById('text-spearman').innerText = "Agrega datos para ver la interpretación.";
        renderChartSVG(dataset);
        return;
    }

    dataset.forEach((d, index) => {
        let x2 = d.x * d.x;
        let y2 = d.y * d.y;
        let xy = d.x * d.y;

        sumX += d.x;
        sumY += d.y;
        sumX2 += x2;
        sumY2 += y2;
        sumXY += xy;

        pearsonTbody.innerHTML += `<tr>
            <td>#${index + 1}</td>
            <td>${d.x}</td>
            <td>${d.y}</td>
            <td>${x2}</td>
            <td>${y2}</td>
            <td>${xy}</td>
        </tr>`;
    });

    document.getElementById('sum-x').innerHTML = `<b>${sumX}</b>`;
    document.getElementById('sum-y').innerHTML = `<b>${sumY}</b>`;
    document.getElementById('sum-x2').innerHTML = `<b>${sumX2}</b>`;
    document.getElementById('sum-y2').innerHTML = `<b>${sumY2}</b>`;
    document.getElementById('sum-xy').innerHTML = `<b>${sumXY}</b>`;

    let numerator = (n * sumXY) - (sumX * sumY);
    let denominator = Math.sqrt(((n * sumX2) - (sumX * sumX)) * ((n * sumY2) - (sumY * sumY)));
    let r = denominator !== 0 ? numerator / denominator : 0;

    let r2 = r * r;
    let noDet = 1 - r2;
    let r2Percent = (r2 * 100).toFixed(2);
    let noDetPercent = (noDet * 100).toFixed(2);

    let xVals = dataset.map(d => d.x);
    let yVals = dataset.map(d => d.y);
    let rangosX = calcularRangosAscendentesEnteros(xVals);
    let rangosY = calcularRangosAscendentesEnteros(yVals);

    let sumD2 = 0;

    dataset.forEach((d, index) => {
        let rx = rangosX[index];
        let ry = rangosY[index];
        let diff = rx - ry;
        let diff2 = diff * diff;
        sumD2 += diff2;

        spearmanTbody.innerHTML += `<tr>
            <td>#${index + 1}</td>
            <td>${d.x}</td>
            <td>${rx}</td>
            <td>${d.y}</td>
            <td>${ry}</td>
            <td>${diff}</td>
            <td>${diff2}</td>
        </tr>`;
    });

    document.getElementById('sum-d2').innerHTML = `<b>${sumD2}</b>`;

    let rs = n > 1 ? 1 - ((6 * sumD2) / (n * (n * n - 1))) : 0;

    document.getElementById('r-value').innerText = r.toFixed(4);
    document.getElementById('r2-value').innerText = r2Percent + "%";
    document.getElementById('nd-value').innerText = noDetPercent + "%";
    document.getElementById('rs-value').innerText = rs.toFixed(4);

    let tipoTexto = obtenerInterpretacionFuerzaSimple(r);
    document.getElementById('text-tipo-correlacion').innerText = `${tipoTexto}`;

    document.getElementById('text-pearson').innerText = 
        `La relación entre "${varXName}" y "${varYName}" es de tipo ${tipoTexto.toLowerCase()}. Esto significa que a medida que una variable sube, la otra tiende a comportarse de la misma manera (o en sentido contrario si es negativa).`;

    document.getElementById('text-r2').innerText = 
        `El ${r2Percent}% de los cambios en "${varYName}" se explican directamente por los cambios en "${varXName}".`;

    document.getElementById('text-nodet').innerText = 
        `El ${noDetPercent}% restante de los cambios en "${varYName}" se debe a otros motivos ajenos a la variable independiente.`;

    document.getElementById('text-spearman').innerText = 
        `Al ordenar los datos por jerarquía (Spearman = ${rs.toFixed(4)}), se confirma una tendencia ${tipoTexto.toLowerCase()} entre ambas variables.`;

    renderChartSVG(dataset);
}

function renderChartSVG(data) {
    const svgGroup = document.getElementById('chart-elements');
    const gridGroup = document.getElementById('grid-lines');
    svgGroup.innerHTML = '';
    gridGroup.innerHTML = '';

    if (data.length === 0) return;

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

        circle.addEventListener('click', () => { enfocarFila(index); });
        svgGroup.appendChild(circle);
    });
}