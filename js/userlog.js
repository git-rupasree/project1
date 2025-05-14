var page = 1;
document.addEventListener('DOMContentLoaded', () => {
    fetchData(page);
});
var activitys = {};
async function fetchData(page) {
    try {
        const uid = localStorage.uid;
        const response = await fetch('  https://atman.onrender.com/user/activity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ uid: uid,page:parseInt(page) })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json(); // Assuming the response is JSON
        // Get the activity log ul element
        activitys  = {...activitys,...data?.activityLog}
        const activityLog = document.getElementById('activity-log');

        // Clear existing content
        if(page <2){
        activityLog.innerHTML = '';
        }

        // Iterate over the data and create list items
        Object.values(activitys).forEach(activity => {
            const li = document.createElement('li');
            li.innerHTML = `
			<div class="activity-meta">
				<i>${formatTimeDifference(activity.timestamp)}</i>
				<span><a href="#" title="">${activity.activity}</a></span>
			</div>
											
            `;
            activityLog.appendChild(li);
        });
        document.getElementById('get-more').innerHTML = `<button onclick="fetchData('${page+1}')" class="btn d-flex align-center"><i class="bi bi-arrow-clockwise"></i></button>`
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

function formatTimeDifference(timestamp) {
    const currentTime = new Date();
    const commentTime = new Date(timestamp);

    const differenceInSeconds = Math.floor((currentTime - commentTime) / 1000);
    const differenceInMinutes = Math.floor(differenceInSeconds / 60);
    const differenceInHours = Math.floor(differenceInMinutes / 60);
    const differenceInDays = Math.floor(differenceInHours / 24);
    if (differenceInDays > 7) {
        // If it crosses more than a week, display the date
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return commentTime.toLocaleDateString('en-US', options);
    } else if (differenceInDays > 0) {
        // If it's within a week, but more than a day, display days ago
        return differenceInDays === 1 ? '1 day ago' : `${differenceInDays} days ago`;
    } else if (differenceInHours > 0) {
        // If it's within a day, but more than an hour, display hours ago
        return differenceInHours === 1 ? '1 hr ago' : `${differenceInHours} hrs ago`;
    } else {
        // If it's within an hour, display minutes ago
        return differenceInMinutes <= 1 ? 'just now' : `${differenceInMinutes} mins ago`;
    }
}