document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('appointments').innerHTML = "<div class='text-center card text-danger'> no appointments found</div>";
   


    var approvedAppointments = [];
    var pendingAppointments = [];

    async function getAppointments() {
        const puid = localStorage.puid;
        try {
            const response = await axios.post('https://atman.onrender.com/getAppointmentsByDoctor', { puid });
            const appointments = response.data;

            if(appointments){
                approvedAppointments = [...appointments.approvedAppointments]
                pendingAppointments = [...appointments.pendingAppointments]  
                displayAppointments([...appointments.approvedAppointments] );
                document.getElementById('approvedbtn').addEventListener('click', () => {
                    displayAppointments(approvedAppointments);
                    document.getElementById('pendingbtn').classList.remove('slot');
                    document.getElementById('approvedbtn').classList.add('slot');
                   
                });
                
                document.getElementById('pendingbtn').addEventListener('click', () => {
                   
                    displayAppointments(pendingAppointments,"pending");
                    document.getElementById('approvedbtn').classList.remove('slot');
                    document.getElementById('pendingbtn').classList.add('slot');
                });
                


            }else{
                document.getElementById('appointments').textContent = 'No appointments found for this doctor.';
                document.getElementById('buttons-div').style.display = 'none';

            }
         
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    }

    function displayAppointments(appointments ,ispending) {

        document.getElementById('countofstudents').textContent = appointments?.length ;
        const appointmentsDiv = document.getElementById('appointments');
        document.getElementById('appointments').innerHTML = "";

        if (appointments.length === 0) {
            appointmentsDiv.textContent = 'No appointments found for this doctor.';
        } else {
            
            appointments.map(appointment => {
                const appointmentHTML = `
                   
                   <div class="card mb-3" >
 <div class="row no-gutters">
    <div class="col-md-4">
      <img src="${appointment.userDetails.profile|| "./images/resources/defaultpic.jpg"}" alt="${appointment.userDetails.name}" class="img-fluid rounded-start" >
    </div>
   <div class="col-md-8">
      <div class="card-body">
        <h5 class="card-title">                                <h1 class="appointment-title"> ${appointment.userDetails.name?.toUpperCase()}</h1>
</h5>
        <p class="card-text">  <div class="newpst-input  groups">
                                <h5>Gender: ${appointment.userDetails.gender}</h5>
                                <h5>Age: ${appointment.userDetails.age}</h5>
                                <h5>Occupation: ${appointment.userDetails.occupation}</h5>
                                <span class="slot">Time Slot: ${appointment.date} /  ${appointment.timeSlot}</span><br>

                                ${ispending === "pending" ?  `<div><button class="btn btn-success" onclick="approve('${appointment.uid}','approved')">Accept</button><button class="btn btn-danger ms-3" onclick="approve('${appointment.uid}','deny')">Deny</button> </div>`:"" }
                                <br>
                            </div></p>
      </div>
    </div>
  </div>
</div>
                     
                 
                `;
                appointmentsDiv.innerHTML += appointmentHTML;
            });
        }
    }

    getAppointments();
});



async function approve(uid,status){
    const puid = localStorage.puid;
    console.log(uid);
    const response = await axios.post('https://atman.onrender.com/updateAppointmentStatus',{uid,puid,status})


    if(response.data){
        alert(response.data.message)
        window.location.reload();
    }



}