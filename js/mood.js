document.addEventListener('DOMContentLoaded', function () {
    const emojis = document.querySelectorAll('.emoji');
    const trackButton = document.querySelector('.track-button');

    emojis.forEach(function (emoji) {
        emoji.addEventListener('click', function () {
            emojis.forEach(function (emoji) {
                emoji.style.opacity = 1;
            });
            this.style.opacity = 0.5;
            trackButton.style.display = 'block';
            trackButton.setAttribute('data-mood', this.getAttribute('data-mood'));
        });
    });

    trackButton.addEventListener('click', async function () {
        const mood = this.getAttribute('data-mood');
        showToast(mood)

        document.getElementById('popup-button').textContent = setmood(mood) || "open";

        try {
            const response = await axios.post('https://atman.onrender.com/submit-daily-mood', {
                uid: uid,
                answer: mood,
            })
            if (response.data) {
              showToast(response.data.message)
                const uid = localStorage.uid;
                localStorage.setItem('mood', mood)
                localStorage.setItem('moodDate', `${date.getDate()}${date.getMonth() + 1}${date.getFullYear()}`)
            }
        } catch (error) {
            console.log(error)
        } finally {
            document.getElementById('popup').style.display = 'none';
        }



    });
});

const date = new Date();
const today = `${date.getDate()}${date.getMonth() + 1}${date.getFullYear()}`



document.addEventListener("DOMContentLoaded", function () {
    // Show popup after 5 seconds
    document.getElementById('popup-button').style.display = 'none';
    if (today !== localStorage.moodDate) {

        document.getElementById('popup').style.display = 'block';
    }

    document.getElementById('popup-button').textContent = setmood(localStorage.mood) || "open";
    setTimeout(function () {
        document.getElementById('popup').style.display = 'none';
        document.getElementById('popup-button').style.display = 'block';
    }, 5000);
    let popup = document.getElementById('popup');

    document.getElementById('popup-button').addEventListener('click', function () {
        if (popup.style.display === 'none' || popup.style.display === '') {
            document.getElementById('popup-button').textContent = 'close';
            popup.style.display = 'block';

        } else {
            popup.style.display = 'none';
            document.getElementById('popup-button').textContent = setmood(localStorage.mood) || "open";
        }
    });
});

const moodmap = {
    "amazing": "😊",
    "happy": "😄",
    "terrible": "😩",
    "sad": "😢",
    "bad": "😞"
}
function setmood(mood) {
    return moodmap[mood];



}







function showToast(message) {
    const messageToast = document.getElementById('messageToast');
    messageToast.innerText = message;
    messageToast.style.display = 'block'; // Show the message
    setTimeout(() => {
      closeToast(); // Automatically close after 5 seconds
    }, 5000);
  }
  
  // Function to close the toast message
  function closeToast() {
    const messageToast = document.getElementById('messageToast');
    messageToast.style.animation = 'slideOutRight 1s forwards'; // Animation for exit
    setTimeout(() => {
      messageToast.style.display = 'none'; // Hide the message after animation
      messageToast.style.animation = ''; // Reset animation
    }, 500); // Wait for animation to complete
  }