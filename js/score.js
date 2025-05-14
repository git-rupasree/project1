var graphdata;
var fetchCounter = 0;

async function fetchData() {
    try {
        if (localStorage.graphdata) {
            // Data is available in local storage, use it directly
            graphdata = JSON.parse(localStorage.graphdata);
        } else if (sessionStorage.graphdata && fetchCounter < 3) {
            // Data is available in session storage and fetch counter is less than 3
            graphdata = JSON.parse(sessionStorage.graphdata);
        } else {
            const response = await axios.post(
                "https://atman.onrender.com/get-analysis-of-student",
                { uid: localStorage.uid }
            );
            graphdata = response;
            localStorage.setItem("graphdata", JSON.stringify(graphdata));
            // Update session storage only if fetch counter is less than 3
            if (fetchCounter < 3) {
                sessionStorage.setItem("graphdata", JSON.stringify(graphdata));
                fetchCounter++;
            }
            
        }
        streakdata(graphdata.data.longestStreak, graphdata.data.currentStreak, graphdata);
        displayMoodChart();

    } catch (error) {
        console.error("Error fetching data:", error);
    }
}


// Call fetchData function when DOM is loaded
document.addEventListener("DOMContentLoaded", fetchData);

function displayMoodChart() {

    var selectedweek = 0;
    const dates = graphdata?.data?.moodDate;
    const scores = graphdata?.data?.analyticsResult?.moodScore;
    const label = [];
    const subLabels = [];
    const subScores = [];
    const days = [];
    var week = 1;
    dates.forEach((date, index) => {
        const currentDate = new Date(date);
        const currentWeek = currentDate.getWeek(); // Assuming getWeek() returns week number

        // If current week is different from previous week, update week and weekStart
        if (currentWeek !== week) {
            week = currentWeek;
            label.push(`Week ${week}`);
            subLabels.push([]);
            subScores.push([]);
            days.push([]); // Initialize sub-scores array for the week
            weekStart = index;
        }

        // Add day name as sublabel
        const dayName = new Intl.DateTimeFormat("en-US", {
            weekday: "short",
        }).format(currentDate);
        subLabels[subLabels.length - 1].push(dayName);
        days[days.length - 1].push(date);
        // Add mood score for the day
        subScores[subScores.length - 1].push(scores[index]);
    });
    week = subScores.length - 1;

    const ctx = document.getElementById("moodChart").getContext("2d");
    const canvas = document.getElementById("moodChart")
    canvas.classList.add('card')
 
    canvas.style.height = '225px'
    const labels = [...subLabels[week]];

    const data = {
        labels: labels,
        datasets: [
            {
                label: "Mood Level",
                data: [...subScores[week]],
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                borderColor: 'rgb(75, 192, 192)',
                borderWidth: 2,
                tension: 0.1
            },
        ],
    };

    const options = {
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value, index, values) {
                        // Custom label mapping
                        const labelMap = {
                            1: "😩",
                            2: "😢",
                            3: "😞",
                            4: "😄",
                            5: "😊",
                        };
                        return labelMap[value] || value;
                    },

                },
                title: {
                    display: true,
                    text: "Mood Level",
                },
            },
            x: {
                title: {
                    display: true,
                    text: "day",
                },
            },
        },
        // Set fixed height for the chart
        maintainAspectRatio: true, // Disable aspect ratio
        responsive: false, // Enable responsive


    };

    moodChart = new Chart(ctx, {
        type: "line",
        data: data,
        options: options,
    });

    const controls = document.getElementById("moodChartControl");

    const control = `
 <div class='' style='display:flex; flex-direction:row;align-content: space-between;justify-content: center;'>
<div style="width:fit-content;">
<button id='prev' class= 'btn btn-outline-primary' ><</button>
</div>
<div id='weekdata' style="width:fit-content;" class="ml-5 mr-5" >
</div>
<div style="width:fit-content;">
<button id='next' class= 'btn btn-outline-primary' >></button>
</div>
 </div>
 
 `;
    controls.innerHTML = control;

    const prevButton = document.getElementById("prev");
    prevButton.classList.add("btn");
    prevButton.textContent = "<";
    prevButton.addEventListener("click", function () {
        if (selectedweek > 0) {
            selectedweek--;
            week = selectedweek;
            updateGraph();
        }
    });

    // Create and append Week Data

    const weekdata = document.getElementById("weekdata");
    weekdata.innerHTML = ` <p>${days[week][0]} <br> ${days[week][days[week].length - 1]
        }</p>`;

    // Create and append Next Week button

    document.getElementById("next").addEventListener("click", function () {
        if (selectedweek < subLabels.length - 1) {
            selectedweek++;
            week = selectedweek;
            updateGraph();
        }
    });

    // Append the container to the controls

    // Function to update the graph
    function updateGraph() {
        moodChart.data.labels = [...subLabels[selectedweek]];
        moodChart.data.datasets[0].data = [...subScores[selectedweek]];
        moodChart.update();
        weekdata.innerHTML = `<p>${days[selectedweek][0]} <br>${days[selectedweek][days[selectedweek].length - 1]}<p>`;
    }
}
// streak data --------------------------------
const formatDate = (date) => {
    const options = { month: "short", day: "numeric", year: "numeric" };
    return new Date(date).toLocaleDateString("en-US", options);
};

// Function to generate calendar HTML
const generateCalendarHTML = (dates) => {
    const calendar = {};
    dates.forEach((date) => {
        const key = formatDate(date);
        calendar[key] = true;
    });
    return calendar;
};

// Function to render calendar for a specific month and year
const renderCalendar = (calendar, monthIndex, year) => {
    let html = '<div class="calendar">';
    const today = new Date();
    const firstDayOfMonth = new Date(year, monthIndex, 1);
    const lastDayOfMonth = new Date(year, monthIndex + 1, 0);

    for (let date = new Date(firstDayOfMonth); date <= lastDayOfMonth; date.setDate(date.getDate() + 1)) {
        const key = formatDate(date);
        const isStreakDay = calendar[key] ? "streak-day" : "";
        const isCompletedDay = calendar[key] ? "" : date <= today ? "completed-day" : "";
        html += `<div class="calendar-day ${isStreakDay} ${isCompletedDay}">${date.getDate()}</div>`;
    }
    html += "</div>";
    return html;
}
const isPrevMonthDisabled = (earliestDate, monthIndex, year) => {
    const earliest = new Date(earliestDate.getFullYear(), earliestDate.getMonth(), 1);
    const current = new Date(year, monthIndex, 1);
    return current <= earliest;
};

const isNextMonthDisabled = (latestDate, monthIndex, year) => {
    const latest = new Date(latestDate.getFullYear(), latestDate.getMonth(), 1);
    const current = new Date(year, monthIndex, 1);
    return current >= latest;
};
// Function to update calendar with navigation
const updateCalendar = (calendar, monthIndex, year, earliestDate, latestDate) => {
    const monthNames = [
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ];
    const monthName = monthNames[monthIndex];
    const navigation = `
    <div class="calendar-navigation mb-2" style="display: flex;
  justify-content: space-between;">
        <button class="prevMonthBtn btn btn-dark"${isPrevMonthDisabled(earliestDate, monthIndex, year) ? " disabled" : ""}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-left" viewBox="0 0 16 16">
                <path d="M10 12.796V3.204L4.519 8zm-.659.753-5.48-4.796a1 1 0 0 1 0-1.506l5.48-4.796A1 1 0 0 1 11 3.204v9.592a1 1 0 0 1-1.659.753"/>
            </svg>
        </button>
        <span class="mx-2">${monthName} ${year}</span>
        <button class="nextMonthBtn btn btn-dark"${isNextMonthDisabled(latestDate, monthIndex, year) ? " disabled" : ""}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-right" viewBox="0 0 16 16">
                <path d="M6 12.796V3.204L11.481 8zm.659.753 5.48-4.796a1 1 0 0 0 0-1.506L6.66 2.451C6.011 1.885 5 2.345 5 3.204v9.592a1 1 0 0 0 1.659.753"/>
            </svg>
        </button>
    </div>
`;



    const calendarHtml = renderCalendar(calendar, monthIndex, year);
    return navigation + calendarHtml;
};

// Main function to set up the streak data
function streakdata(longest, current) {
    const datesLongest = longest.dates.map(date => new Date(date));
    const datesCurrent = current.dates.map(date => new Date(date));
    const allDates = datesLongest.concat(datesCurrent);

    const earliestDate = new Date(Math.min.apply(null, allDates));
    const latestDate = new Date(Math.max.apply(null, allDates));

    let monthIndex = new Date().getMonth();
    let currentYear = new Date().getFullYear();

    const calendarLongest = generateCalendarHTML(datesLongest);
    const calendarCurrent = generateCalendarHTML(datesCurrent);

    const updateAndRender = () => {
        document.getElementById("longestCalendar").innerHTML = updateCalendar(calendarLongest, monthIndex, currentYear, earliestDate, latestDate);
        document.getElementById("currentCalendar").innerHTML = updateCalendar(calendarCurrent, monthIndex, currentYear, earliestDate, latestDate);
        setUpEventListeners();
    };

    const navigateMonth = (increment) => {
        monthIndex += increment;
        if (monthIndex < 0) {
            monthIndex = 11;
            currentYear--;
        } else if (monthIndex > 11) {
            monthIndex = 0;
            currentYear++;
        }
        updateAndRender();
    };

    const setUpEventListeners = () => {
        document.querySelectorAll('.prevMonthBtn').forEach(btn => btn.addEventListener('click', () => navigateMonth(-1)));
        document.querySelectorAll('.nextMonthBtn').forEach(btn => btn.addEventListener('click', () => navigateMonth(1)));
    };

    // Insert initial HTML
    document.getElementById("streak-data").innerHTML = `
        <div class="row">
            <div class="col-md-10 card ">
                <h5>Longest Streak</h5>
                <p>Length: ${longest.length}</p>
                <div class="month-year">${formatDate(new Date(datesLongest[0]))}</div>
                <div id="longestCalendar">${updateCalendar(calendarLongest, monthIndex, currentYear, earliestDate, latestDate)}</div>
            </div>
            <div class="col-md-10 card ">
                <h5>Current Streak</h5>
                <p>Length: ${current.length}</p>
                <div class="month-year">${formatDate(new Date(datesCurrent[0]))}</div>
                <div id="currentCalendar" >${updateCalendar(calendarCurrent, monthIndex, currentYear, earliestDate, latestDate)}</div>
            </div>
        </div>
    `;

    setUpEventListeners();

    document.getElementById('averagemoodscore').innerHTML = `
        <div class='card mt-2 ml-2'>
            <div class='card-title widget-title'>Resilience points</div>
            <div class='card-body'><h1>${graphdata?.data?.moodDate.length * 5}</h1><img src='./images/points_coin.png' class="points_logo"></div>
        </div>`;
}


Date.prototype.getWeek = function () {
    const onejan = new Date(this.getFullYear(), 0, 1);
    const weekStart = new Date(
        onejan.getFullYear(),
        onejan.getMonth(),
        onejan.getDate() - onejan.getDay()
    );
    const diff = this - weekStart;
    return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
};
