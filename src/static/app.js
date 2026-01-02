document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;
        
        // Create title
        const title = document.createElement("h4");
        title.textContent = name;
        activityCard.appendChild(title);
        
        // Create description
        const description = document.createElement("p");
        description.textContent = details.description;
        activityCard.appendChild(description);
        
        // Create schedule
        const schedule = document.createElement("p");
        const scheduleLabel = document.createElement("strong");
        scheduleLabel.textContent = "Schedule:";
        schedule.appendChild(scheduleLabel);
        schedule.appendChild(document.createTextNode(" " + details.schedule));
        activityCard.appendChild(schedule);
        
        // Create availability
        const availability = document.createElement("p");
        const availabilityLabel = document.createElement("strong");
        availabilityLabel.textContent = "Availability:";
        availability.appendChild(availabilityLabel);
        availability.appendChild(document.createTextNode(" " + spotsLeft + " spots left"));
        activityCard.appendChild(availability);
        
        // Create participants section
        const participantsSection = document.createElement("div");
        participantsSection.className = "participants-section";
        
        const participantsLabel = document.createElement("p");
        participantsLabel.className = "participants-label";
        const participantsLabelStrong = document.createElement("strong");
        participantsLabelStrong.textContent = "Participants:";
        participantsLabel.appendChild(participantsLabelStrong);
        participantsSection.appendChild(participantsLabel);
        
        if (details.participants.length > 0) {
          const participantsList = document.createElement("ul");
          participantsList.className = "participants-list";
          
          details.participants.forEach(email => {
            const listItem = document.createElement("li");
            listItem.className = "participant-item";
            
            const emailSpan = document.createElement("span");
            emailSpan.className = "participant-email";
            emailSpan.textContent = email;
            listItem.appendChild(emailSpan);
            
            const deleteButton = document.createElement("button");
            deleteButton.className = "delete-icon";
            deleteButton.type = "button";
            deleteButton.title = "Remove participant";
            deleteButton.setAttribute("aria-label", "Remove participant");
            deleteButton.setAttribute("data-activity", name);
            deleteButton.setAttribute("data-email", email);
            deleteButton.innerHTML = "&#128465;";
            listItem.appendChild(deleteButton);
            
            participantsList.appendChild(listItem);
          });
          
          participantsSection.appendChild(participantsList);
        } else {
          const noParticipants = document.createElement("p");
          noParticipants.className = "no-participants";
          noParticipants.textContent = "No participants yet. Be the first to sign up!";
          participantsSection.appendChild(noParticipants);
        }
        
        activityCard.appendChild(participantsSection);
        activitiesList.appendChild(activityCard);
      // Add delete icon click handler
      activityCard.addEventListener("click", async (event) => {
        if (event.target.classList.contains("delete-icon")) {
          const activityName = event.target.getAttribute("data-activity");
          const email = event.target.getAttribute("data-email");
          if (confirm(`Remove ${email} from ${activityName}?`)) {
            try {
              const response = await fetch(`/activities/${encodeURIComponent(activityName)}/unregister?email=${encodeURIComponent(email)}`, {
                method: "POST",
              });
              const result = await response.json();
              if (response.ok) {
                fetchActivities();
              } else {
                alert(result.detail || "Failed to remove participant.");
              }
            } catch (error) {
              alert("Error removing participant.");
            }
          }
        }
      });

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
