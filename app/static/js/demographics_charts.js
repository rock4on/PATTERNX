// app/static/js/demographics_charts.js

document.addEventListener('DOMContentLoaded', function () {
    if (typeof L === 'undefined' || typeof Chart === 'undefined') {
        console.error("Leaflet or Chart.js is not loaded.");
        return;
    }

    // --- Global Variables & Chart Instances ---
    let romaniaMap;
    let geojsonLayer;
    let mapInfoControl;
    let mapLegendControl;
    const chartInstances = {}; // To store chart instances for updates/destruction
    let drilldownModalInstance; // For Bootstrap Modal

    const mapElement = document.getElementById('romaniaMap');
    const mapSpinner = document.getElementById('mapSpinner');
    const chartsContainer = document.getElementById('chartsContainer');
    const noDataMessage = document.getElementById('noDataMessage');

    const drilldownModalElement = document.getElementById('drilldownModal');
    if (drilldownModalElement) {
        drilldownModalInstance = new bootstrap.Modal(drilldownModalElement);
    }
    const drilldownSpinner = document.getElementById('drilldownSpinner');
    const drilldownContent = document.getElementById('drilldownContent');
    const drilldownCountyNameElement = document.getElementById('drilldownCountyName');
    const drilldownCountyNameTexts = document.querySelectorAll('.drilldownCountyNameText');
    const noDrilldownDataMessage = document.getElementById('noDrilldownDataMessage');


    // --- Map Initialization & Functions ---
    function initMap(countyDataForMap) {
        if (mapElement) {
             if (romaniaMap) { // If map already exists, just update data or remove layer
                if(geojsonLayer) romaniaMap.removeLayer(geojsonLayer);
             } else { // First time initialization
                romaniaMap = L.map('romaniaMap').setView([45.9432, 24.9668], 7);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 18,
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(romaniaMap);

                mapInfoControl = L.control();
                mapInfoControl.onAdd = function (map) { this._div = L.DomUtil.create('div', 'info'); this.update(); return this._div; };
                mapInfoControl.update = function (props) {
                    const countyName = props ? (props.name || props.VARNAME_1 || props.JUDET) : null;
                    const userCount = props && countyName && countyDataForMap ? (countyDataForMap[countyName] || 0) : null;
                    this._div.innerHTML = '<h4>User Density</h4>' +  (props ? '<b>' + countyName + '</b><br />' + (userCount !== null ? userCount + ' users' : 'No data') : 'Hover over a county');
                };
                mapInfoControl.addTo(romaniaMap);

                mapLegendControl = L.control({position: 'bottomright'});
                mapLegendControl.onAdd = function (map) {
                    const div = L.DomUtil.create('div', 'info legend');
                    const grades = [0, 1, 3, 6, 11, 21, 51, 101]; // Users
                    const labels = [];
                    for (let i = 0; i < grades.length; i++) {
                        const from = grades[i];
                        const to = grades[i + 1];
                        labels.push(`<i style="background:${getColor(from + 1)}"></i> ${from}${to ? '&ndash;' + (to - 1) : '+'}`);
                    }
                    div.innerHTML = labels.join('<br>'); return div;
                };
                mapLegendControl.addTo(romaniaMap);
            }

            if (mapSpinner) mapSpinner.style.display = 'block';

            fetch(geoJsonPath)
                .then(response => { if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); } return response.json(); })
                .then(data => {
                    if (geojsonLayer) romaniaMap.removeLayer(geojsonLayer); // Remove old layer if exists
                    geojsonLayer = L.geoJson(data, {
                        style: feature => styleGeoJson(feature, countyDataForMap),
                        onEachFeature: (feature, layer) => onEachMapFeature(feature, layer, countyDataForMap)
                    }).addTo(romaniaMap);
                    if (mapSpinner) mapSpinner.style.display = 'none';
                })
                .catch(error => {
                    console.error('Error loading GeoJSON:', error);
                    if (mapElement) mapElement.innerHTML = '<p class="text-danger text-center">Could not load map data.</p>';
                    if (mapSpinner) mapSpinner.style.display = 'none';
                });
        }
    }

    function getColor(d) { // User count
        return d > 100 ? '#800026' : d > 50  ? '#BD0026' : d > 20  ? '#E31A1C' : d > 10  ? '#FC4E2A' : d > 5   ? '#FD8D3C' : d > 2   ? '#FEB24C' : d > 0   ? '#FED976' : '#FFEDA0';
    }

    function styleGeoJson(feature, countyData) {
        const countyName = feature.properties.name || feature.properties.VARNAME_1 || feature.properties.JUDET;
        const userCount = (countyData && countyData[countyName]) ? countyData[countyName] : 0;
        return { fillColor: getColor(userCount), weight: 1, opacity: 1, color: 'white', dashArray: '2', fillOpacity: 0.7 };
    }

    function highlightFeature(e) {
        const layer = e.target;
        layer.setStyle({ weight: 3, color: '#555', dashArray: '', fillOpacity: 0.9 });
        layer.bringToFront();
        mapInfoControl.update(layer.feature.properties);
    }

    function resetHighlight(e) {
        if (geojsonLayer) geojsonLayer.resetStyle(e.target);
        mapInfoControl.update();
    }

    function onEachMapFeature(feature, layer, countyData) {
        const countyName = feature.properties.name || feature.properties.VARNAME_1 || feature.properties.JUDET;
        const userCount = (countyData && countyData[countyName]) ? countyData[countyName] : 0;
        layer.bindPopup(`<strong>${countyName}</strong><br/>Users: ${userCount}`);
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: (e) => handleCountyClick(e, countyName)
        });
    }


    // --- Chart.js Initialization & Update Functions ---
    const chartColors = {
        qualitative: ['rgba(54, 162, 235, 0.8)', 'rgba(255, 99, 132, 0.8)', 'rgba(255, 206, 86, 0.8)', 'rgba(75, 192, 192, 0.8)', 'rgba(153, 102, 255, 0.8)', 'rgba(255, 159, 64, 0.8)', 'rgba(128, 0, 128, 0.8)', 'rgba(0, 128, 128, 0.8)'],
        age: 'rgba(75, 192, 192, 0.8)',
        residence: ['rgba(153, 102, 255, 0.8)', 'rgba(255, 159, 64, 0.8)'],
    };

    function getColorsForChart(numValues, baseColors) {
        if (!Array.isArray(baseColors)) return baseColors; // Single color string
        let colors = [];
        for (let i = 0; i < numValues; i++) {
            colors.push(baseColors[i % baseColors.length]);
        }
        return colors;
    }


    function createOrUpdateChart(canvasId, chartType, data, chartLabel, backgroundColors, indexAxis = 'x', isDrilldown = false) {
        

        
        const ctx = document.getElementById(canvasId);
        if (!ctx) {
            console.warn(`Canvas element with ID ${canvasId} not found.`);
            return;
        }

        if (chartInstances[canvasId]) {
            chartInstances[canvasId].destroy();
        }
        
        if (!data || !data.labels || !data.values || data.labels.length === 0) {
             console.warn(`No data provided for chart: ${canvasId}. Hiding chart.`);
             ctx.style.display = 'none';
             const parentContainer = ctx.closest('.chart-container') || ctx.closest('.drilldown-chart-container');
             if(parentContainer) {
                let noDataMsg = parentContainer.querySelector('.no-chart-data-msg');
                if(!noDataMsg) {
                    noDataMsg = document.createElement('p');
                    noDataMsg.className = 'text-center text-muted mt-3 no-chart-data-msg';
                    noDataMsg.textContent = 'No data available for this view.';
                    parentContainer.appendChild(noDataMsg);
                }
                noDataMsg.style.display = 'block';
             }
             return;
        } else {
            ctx.style.display = 'block';
            const parentContainer = ctx.closest('.chart-container') || ctx.closest('.drilldown-chart-container');
            if(parentContainer) {
                const noDataMsg = parentContainer.querySelector('.no-chart-data-msg');
                if(noDataMsg) noDataMsg.style.display = 'none';
            }
        }


        const colors = getColorsForChart(data.labels.length, backgroundColors);

        chartInstances[canvasId] = new Chart(ctx, {
            type: chartType,
            data: {
                labels: data.labels,
                datasets: [{
                    label: chartLabel,
                    data: data.values,
                    backgroundColor: colors,
                    borderColor: Array.isArray(colors) ? colors.map(c => c.replace('0.8', '1')) : colors.replace('0.8', '1'),
                    borderWidth: 1,
                    hoverOffset: chartType === 'pie' ? 4 : 0
                }]
            },
            options: {
                indexAxis: indexAxis,
                responsive: true,
                maintainAspectRatio: false,
                scales: (chartType === 'bar' || chartType === 'line') ? {
                    [indexAxis === 'x' ? 'y' : 'x']: { beginAtZero: true, ticks: { precision: 0 } } // precision 0 for integer ticks
                } : {},
                plugins: {
                    legend: { display: chartType === 'pie' || (isDrilldown && chartType !== 'bar') }, // More selective legend display
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null && chartType !== 'pie') {
                                    label += context.parsed.y;
                                }
                                if (context.parsed !== null && chartType === 'pie') {
                                     label += context.label + ': ' + context.raw
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }

    function updateAllCharts(newChartData) {
        if (Object.keys(newChartData).length === 0) {
            if (chartsContainer) chartsContainer.style.display = 'none';
            if (noDataMessage) noDataMessage.style.display = 'block';
            return;
        }
        if (chartsContainer) chartsContainer.style.display = 'block';
        if (noDataMessage) noDataMessage.style.display = 'none';

        createOrUpdateChart('countyChart', 'bar', newChartData.county_distribution, 'Number of Users', chartColors.qualitative);
        createOrUpdateChart('ageChart', 'bar', newChartData.age_distribution, 'Number of Users', chartColors.age);
        createOrUpdateChart('genderChart', 'pie', newChartData.gender_distribution, 'Gender', chartColors.qualitative);
        createOrUpdateChart('educationChart', 'bar', newChartData.education_level_distribution, 'Number of Users', chartColors.qualitative, 'y');
        createOrUpdateChart('residenceChart', 'bar', newChartData.residence_distribution, 'Number of Users', chartColors.residence);
    }


    // --- Filter Logic ---
    const filterForm = document.getElementById('demographicsFilterForm');
    if (filterForm) {
        // No automatic AJAX on form submit. User will click "Apply Filters" which reloads the page.
        // For AJAX version, you would preventDefault and use fetch.
        // For now, the page reload with GET params is simpler to ensure all data (including initial for map) is correctly passed.
    }


    // --- County Click Drilldown Logic ---
    async function handleCountyClick(event, countyName) {
        if (!drilldownModalInstance || !countyName) return;

        if (drilldownCountyNameElement) drilldownCountyNameElement.textContent = countyName;
         drilldownCountyNameTexts.forEach(el => el.textContent = countyName);

        if (drilldownContent) drilldownContent.style.display = 'none';
        if (noDrilldownDataMessage) noDrilldownDataMessage.style.display = 'none';
        if (drilldownSpinner) drilldownSpinner.style.display = 'block';
        
        drilldownModalInstance.show();

        const currentParams = new URLSearchParams();
        if (currentFilters.start_date) currentParams.append('start_date', currentFilters.start_date);
        if (currentFilters.end_date) currentParams.append('end_date', currentFilters.end_date);
        if (currentFilters.segment_id) currentParams.append('segment_id', currentFilters.segment_id);
        currentParams.append('county_drilldown', countyName);
        
        try {
            const response = await fetch(`${demographicsDataApiUrl}?${currentParams.toString()}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const drilldownResponse = await response.json(); // Renamed to avoid confusion with global chartData

            if (drilldownSpinner) drilldownSpinner.style.display = 'none';
            if (drilldownContent) drilldownContent.style.display = 'block';

            if (drilldownResponse.error || !drilldownResponse.data || Object.keys(drilldownResponse.data).length === 0) {
                console.warn("No drilldown data in response or error:", drilldownResponse.error || "Empty data object");
                if (noDrilldownDataMessage) noDrilldownDataMessage.style.display = 'block';
                ['drilldownAgeChart', 'drilldownEducationChart', 'drilldownCityChart'].forEach(id => {
                    if (chartInstances[id]) chartInstances[id].destroy();
                    const canvas = document.getElementById(id);
                    if(canvas) canvas.style.display = 'none';
                     const parentContainer = canvas.closest('.drilldown-chart-container');
                     if(parentContainer) {
                        let msg = parentContainer.querySelector('.no-chart-data-msg');
                        if(!msg) {
                            msg = document.createElement('p');
                            msg.className = 'text-center text-muted mt-3 no-chart-data-msg';
                            parentContainer.appendChild(msg);
                        }
                        // More specific message if possible
                        const chartTypeMsg = id.replace('drilldown','').replace('Chart','').replace(/([A-Z])/g, ' $1').trim();
                        msg.textContent = `No ${chartTypeMsg} data available for this county.`;
                        msg.style.display = 'block';
                     }
                });
                return;
            }
            if (noDrilldownDataMessage) noDrilldownDataMessage.style.display = 'none';

            // Specifically log the data objects being passed to createOrUpdateChart

            // Create/Update drilldown charts
            createOrUpdateChart('drilldownAgeChart', 'bar', drilldownResponse.data.age_distribution, `Age in ${countyName}`, chartColors.age, 'x', true);
            createOrUpdateChart('drilldownEducationChart', 'bar', drilldownResponse.data.education_level_distribution, `Education in ${countyName}`, chartColors.qualitative, 'y', true);
            createOrUpdateChart('drilldownCityChart', 'bar', drilldownResponse.data.city_distribution, `Top Cities in ${countyName}`, chartColors.qualitative, 'y', true);

        } catch (error) {
            console.error('Failed to fetch or process drilldown data:', error);
            if (drilldownSpinner) drilldownSpinner.style.display = 'none';
            if (drilldownContent) drilldownContent.style.display = 'block'; 
            if (noDrilldownDataMessage) {
                 noDrilldownDataMessage.textContent = "Error loading details for this county.";
                 noDrilldownDataMessage.style.display = 'block';
            }
        }
    }

    // --- Initial Load ---
    // Data is now passed directly via `initialChartData` and `initialCountyDataForMap`
    // Make sure these are defined in the HTML before this script runs.
    if (typeof initialChartData !== 'undefined' && typeof initialCountyDataForMap !== 'undefined') {
        updateAllCharts(initialChartData);
        initMap(initialCountyDataForMap);
    } else {
        console.error("Initial chart or map data not provided to demographics_charts.js");
        if (chartsContainer) chartsContainer.style.display = 'none';
        if (noDataMessage) noDataMessage.style.display = 'block';
        if (mapElement) mapElement.innerHTML = '<p class="text-danger text-center">Map data not initialized.</p>';
    }
});