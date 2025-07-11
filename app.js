// Main JavaScript file (app.js)

// Initialize resume data structure
let resumeData = {
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      jobTitle: "",
      location: "",
      website: "",
      summary: ""
    },
    experience: [],
    education: [],
    skills: [],
    projects: []
  };
  
  let currentTemplate = "professional";
  let currentSection = "editor";
  let currentTab = "personal-info";
  
  // Track editing state
  let editingSkillIndex = null;
  let currentDateField = null;
  let currentDateIndex = null;
  
  // DOM elements
  // ✅ Tab Navigation Logic — enables switching between tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault(); // prevent default button behavior

    // Remove 'active' class from all buttons and tab panes
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

    // Add 'active' class to clicked tab button
    btn.classList.add('active');

    // Show the corresponding tab pane
    const tab = btn.getAttribute('data-tab');
    document.getElementById(tab).classList.add('active');
  });
});

  document.addEventListener('DOMContentLoaded', () => {
    // Navigation
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('.app-sections > section');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    // Personal Info form
    const personalInfoInputs = document.querySelectorAll('#personal-info input, #personal-info textarea');
    
    // Experience section
    const addExperienceBtn = document.getElementById('add-experience');
    const experiencesContainer = document.getElementById('experiences-container');
    const emptyExperienceMessage = document.getElementById('empty-experience');
    
    // Education section
    const addEducationBtn = document.getElementById('add-education');
    const educationContainer = document.getElementById('education-container');
    const emptyEducationMessage = document.getElementById('empty-education');
    
    // Skills section
    const skillInput = document.getElementById('skill-input');
    const addSkillBtn = document.getElementById('add-skill');
    const skillsContainer = document.getElementById('skills-container');
    const emptySkillsMessage = document.getElementById('empty-skills');
    const aiSuggestions = document.getElementById('ai-suggestions');
    const suggestionBadges = document.getElementById('suggestion-badges');
    const suggestionsLoading = document.getElementById('suggestions-loading');
    
    // Projects section
    const addProjectBtn = document.getElementById('add-project');
    const projectsContainer = document.getElementById('projects-container');
    const emptyProjectsMessage = document.getElementById('empty-projects');
    
    // Preview section
    const templateSelect = document.getElementById('template-select');
    const resumePreview = document.getElementById('resume-preview');
    const exportBtn = document.getElementById('export-btn');
    const saveBtn = document.getElementById('save-btn');
    
    // Templates section
    const templateCards = document.querySelectorAll('.template-card');
    const templateSelectButtons = document.querySelectorAll('.btn-select-template');
    
    // Modals
    const modalOverlay = document.getElementById('modal-overlay');
    const skillEditModal = document.getElementById('skill-edit-modal');
    const skillLevelSlider = document.getElementById('skill-level-slider');
    const skillLevelValue = document.getElementById('skill-level-value');
    const saveSkillEditBtn = document.getElementById('save-skill-edit');
    const cancelSkillEditBtn = document.getElementById('cancel-skill-edit');
    const editSkillTitle = document.getElementById('edit-skill-title');
    
    const datepickerModal = document.getElementById('date-picker-modal');
    const monthSelect = document.getElementById('month-select');
    const yearSelect = document.getElementById('year-select');
    const setAsPresentBtn = document.getElementById('set-as-present');
    const saveDatePickerBtn = document.getElementById('save-date-picker');
    const cancelDatePickerBtn = document.getElementById('cancel-date-picker');
    const datepickerTitle = document.getElementById('date-picker-title');
    const presentOption = document.getElementById('present-option');
    
    // Initialize date picker years
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= currentYear - 50; year--) {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
    }
    
    // Navigation handlers
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetSection = link.getAttribute('data-section');
        
        // Update nav links
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Show target section
        sections.forEach(section => {
          if (section.id === `${targetSection}-section`) {
            section.classList.add('active-section');
            currentSection = targetSection;
          } else {
            section.classList.remove('active-section');
          }
        });
        
        // If switching to preview, update the preview
        if (targetSection === 'preview') {
          updateResumePreview();
        }
      });
    });
    
    // Tab navigation
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        
        // Update tab buttons
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Show target tab pane
        tabPanes.forEach(pane => {
          if (pane.id === targetTab) {
            pane.classList.add('active');
            currentTab = targetTab;
          } else {
            pane.classList.remove('active');
          }
        });
      });
    });
    
    // Personal info form handlers
    personalInfoInputs.forEach(input => {
      input.addEventListener('input', () => {
        const field = input.id;
        resumeData.personalInfo[field] = input.value;
        
        // If job title changes, fetch skill suggestions
        if (field === 'jobTitle' && input.value.trim().length > 0) {
          getSkillSuggestions(input.value);
        }
      });
    });
    
    // Add experience
    addExperienceBtn.addEventListener('click', () => {
      addExperienceItem();
    });
    
    // Add education
    addEducationBtn.addEventListener('click', () => {
      addEducationItem();
    });
    
    // Add skill
    addSkillBtn.addEventListener('click', () => {
      addSkill();
    });
    
    skillInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addSkill();
      }
    });
    
    // Add project
    addProjectBtn.addEventListener('click', () => {
      addProjectItem();
    });
    
    // Template selection
    templateSelect.addEventListener('change', () => {
      currentTemplate = templateSelect.value;
      updateResumePreview();
    });
    
    templateSelectButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const template = btn.parentElement.getAttribute('data-template');
        currentTemplate = template;
        templateSelect.value = template;
        
        // Switch to preview section
        navLinks.forEach(l => {
          if (l.getAttribute('data-section') === 'preview') {
            l.click();
          }
        });
      });
    });
    
    // Export resume to PDF
    exportBtn.addEventListener("click", window.generatePDF);
    
    // Save resume
    saveBtn.addEventListener('click', () => {
      saveResumeData();
    });
    
    // Modal handlers
    function closeAllModals() {
      modalOverlay.classList.add('hidden');
      skillEditModal.classList.add('hidden');
      datepickerModal.classList.add('hidden');
    }
    
    document.querySelectorAll('.close-modal').forEach(btn => {
      btn.addEventListener('click', closeAllModals);
    });
    
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeAllModals();
      }
    });
    
    // Skill level slider
    skillLevelSlider.addEventListener('input', () => {
      updateSkillLevelText();
    });
    
    // Update skill level text based on slider value
    function updateSkillLevelText() {
      const value = parseInt(skillLevelSlider.value);
      let levelText = 'Intermediate';
      
      if (value <= 25) levelText = 'Beginner';
      else if (value <= 50) levelText = 'Intermediate';
      else if (value <= 75) levelText = 'Advanced';
      else levelText = 'Expert';
      
      skillLevelValue.textContent = levelText;
    }
    
    // Save skill edit
    saveSkillEditBtn.addEventListener('click', () => {
      if (editingSkillIndex !== null) {
        const value = parseInt(skillLevelSlider.value);
        let levelText = 'Intermediate';
        
        if (value <= 25) levelText = 'Beginner';
        else if (value <= 50) levelText = 'Intermediate';
        else if (value <= 75) levelText = 'Advanced';
        else levelText = 'Expert';
        
        resumeData.skills[editingSkillIndex].level = levelText;
        updateSkillsList();
      }
      
      closeAllModals();
    });
    
    // Cancel skill edit
    cancelSkillEditBtn.addEventListener('click', closeAllModals);
    
    // Date picker handlers
    saveDatePickerBtn.addEventListener('click', () => {
      if (currentDateField && currentDateIndex !== null) {
        const month = monthSelect.value.padStart(2, '0');
        const year = yearSelect.value;
        const dateString = `${month}/${year}`;
        
        // Update the correct field in the correct data array
        if (currentDateField.includes('experience')) {
          const field = currentDateField.includes('start') ? 'startDate' : 'endDate';
          resumeData.experience[currentDateIndex][field] = dateString;
          updateExperiencesList();
        } else if (currentDateField.includes('edu')) {
          const field = currentDateField.includes('start') ? 'startDate' : 'endDate';
          resumeData.education[currentDateIndex][field] = dateString;
          updateEducationList();
        } else if (currentDateField.includes('project')) {
          const field = currentDateField.includes('start') ? 'startDate' : 'endDate';
          resumeData.projects[currentDateIndex][field] = dateString;
          updateProjectsList();
        }
      }
      
      closeAllModals();
    });
    
    // Set date as "Present"
    setAsPresentBtn.addEventListener('click', () => {
      if (currentDateField && currentDateIndex !== null) {
        // Only allow setting end dates as "Present"
        if (currentDateField.includes('end')) {
          if (currentDateField.includes('experience')) {
            resumeData.experience[currentDateIndex].endDate = "Present";
            updateExperiencesList();
          } else if (currentDateField.includes('edu')) {
            resumeData.education[currentDateIndex].endDate = "Present";
            updateEducationList();
          } else if (currentDateField.includes('project')) {
            resumeData.projects[currentDateIndex].endDate = "Present";
            updateProjectsList();
          }
        }
      }
      
      closeAllModals();
    });
    
    // Cancel date picker
    cancelDatePickerBtn.addEventListener('click', closeAllModals);
    
    // Initialize sortable lists
    initializeSortableLists();
    
    // Load data from localStorage if available
    loadResumeData();
    
    // Initialize the UI with the loaded data
    initializeUI();
  });
  
  // Functions for adding items
  
  function addSkill() {
    const skillInput = document.getElementById('skill-input');
    const skillName = skillInput.value.trim();
    
    if (skillName === '') return;
    
    // Check for duplicates
    const isDuplicate = resumeData.skills.some(skill => 
      skill.name.toLowerCase() === skillName.toLowerCase()
    );
    
    if (isDuplicate) {
      skillInput.value = '';
      return;
    }
    
    resumeData.skills.push({
      name: skillName,
      level: 'Intermediate'
    });
    
    skillInput.value = '';
    updateSkillsList();
  }
  
  function addExperienceItem() {
    resumeData.experience.push({
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      location: '',
      description: '',
      achievements: []
    });
    
    updateExperiencesList();
  }
  
  function addEducationItem() {
    resumeData.education.push({
      school: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      location: '',
      description: ''
    });
    
    updateEducationList();
  }
  
  function addProjectItem() {
    resumeData.projects.push({
      name: '',
      startDate: '',
      endDate: '',
      url: '',
      description: ''
    });
    
    updateProjectsList();
  }
  
  // Update UI functions
  
  function updateSkillsList() {
    const skillsContainer = document.getElementById('skills-container');
    const emptySkillsMessage = document.getElementById('empty-skills');
    
    skillsContainer.innerHTML = '';
    
    if (resumeData.skills.length === 0) {
      emptySkillsMessage.classList.remove('hidden');
    } else {
      emptySkillsMessage.classList.add('hidden');
      
      resumeData.skills.forEach((skill, index) => {
        const template = document.getElementById('skill-item-template');
        const skillItem = document.importNode(template.content, true);
        
        skillItem.querySelector('.skill-name').textContent = skill.name;
        skillItem.querySelector('.skill-level').textContent = skill.level || 'Intermediate';
        
        // Set up edit button
        const editBtn = skillItem.querySelector('.edit-skill');
        editBtn.addEventListener('click', () => {
          editSkill(index);
        });
        
        // Set up delete button
        const deleteBtn = skillItem.querySelector('.delete-skill');
        deleteBtn.addEventListener('click', () => {
          deleteSkill(index);
        });
        
        skillsContainer.appendChild(skillItem);
      });
    }
  }
  
  function updateExperiencesList() {
    const experiencesContainer = document.getElementById('experiences-container');
    const emptyExperienceMessage = document.getElementById('empty-experience');
    
    experiencesContainer.innerHTML = '';
    
    if (resumeData.experience.length === 0) {
      emptyExperienceMessage.classList.remove('hidden');
    } else {
      emptyExperienceMessage.classList.add('hidden');
      
      resumeData.experience.forEach((experience, index) => {
        const template = document.getElementById('experience-item-template');
        const experienceItem = document.importNode(template.content, true);
        
        // Set the title based on available data
        const titleElement = experienceItem.querySelector('.experience-title');
        if (experience.position || experience.company) {
          titleElement.textContent = `${experience.position || ''}${experience.company ? ` at ${experience.company}` : ''}`;
        } else {
          titleElement.textContent = `Experience Entry ${index + 1}`;
        }
        
        // Fill in form fields
        experienceItem.querySelector('.position-input').value = experience.position || '';
        experienceItem.querySelector('.company-input').value = experience.company || '';
        experienceItem.querySelector('.location-input').value = experience.location || '';
        experienceItem.querySelector('.description-input').value = experience.description || '';
        
        // Set date button text
        const startDateBtn = experienceItem.querySelector('.start-date-btn');
        const startDateText = startDateBtn.querySelector('.date-text');
        startDateText.textContent = experience.startDate || 'Select Date';
        
        const endDateBtn = experienceItem.querySelector('.end-date-btn');
        const endDateText = endDateBtn.querySelector('.date-text');
        endDateText.textContent = experience.endDate || 'Select Date';
        
        // Add event listeners for input fields
        experienceItem.querySelector('.position-input').addEventListener('input', (e) => {
          resumeData.experience[index].position = e.target.value;
          
          // Update card title
          const card = e.target.closest('.experience-item');
          const title = card.querySelector('.experience-title');
          if (e.target.value || resumeData.experience[index].company) {
            title.textContent = `${e.target.value || ''}${resumeData.experience[index].company ? ` at ${resumeData.experience[index].company}` : ''}`;
          } else {
            title.textContent = `Experience Entry ${index + 1}`;
          }
        });
        
        experienceItem.querySelector('.company-input').addEventListener('input', (e) => {
          resumeData.experience[index].company = e.target.value;
          
          // Update card title
          const card = e.target.closest('.experience-item');
          const title = card.querySelector('.experience-title');
          if (resumeData.experience[index].position || e.target.value) {
            title.textContent = `${resumeData.experience[index].position || ''}${e.target.value ? ` at ${e.target.value}` : ''}`;
          } else {
            title.textContent = `Experience Entry ${index + 1}`;
          }
        });
        
        experienceItem.querySelector('.location-input').addEventListener('input', (e) => {
          resumeData.experience[index].location = e.target.value;
        });
        
        experienceItem.querySelector('.description-input').addEventListener('input', (e) => {
          resumeData.experience[index].description = e.target.value;
        });
        
        // Set up date picker buttons
        startDateBtn.addEventListener('click', () => {
          openDatePicker('experience-start', index);
        });
        
        endDateBtn.addEventListener('click', () => {
          openDatePicker('experience-end', index);
        });
        
        // Set up delete button
        const deleteBtn = experienceItem.querySelector('.delete-experience');
        deleteBtn.addEventListener('click', () => {
          deleteExperience(index);
        });
        
        // Set up toggle expand button
        const toggleBtn = experienceItem.querySelector('.toggle-expand');
        toggleBtn.addEventListener('click', () => {
          const card = toggleBtn.closest('.experience-item');
          const content = card.querySelector('.card-content');
          
          if (content.style.display === 'none') {
            content.style.display = 'block';
            toggleBtn.querySelector('.icon-expand').textContent = '▼';
          } else {
            content.style.display = 'none';
            toggleBtn.querySelector('.icon-expand').textContent = '▶';
          }
        });
        
        // Set up achievements
        const achievementsContainer = experienceItem.querySelector('.achievements-container');
        const emptyAchievements = experienceItem.querySelector('.empty-achievements');
        const achievementInput = experienceItem.querySelector('.achievement-input');
        const addAchievementBtn = experienceItem.querySelector('.add-achievement');
        
        // Function to update the achievements display
        function updateAchievements() {
          achievementsContainer.innerHTML = '';
          
          if (!experience.achievements || experience.achievements.length === 0) {
            achievementsContainer.appendChild(emptyAchievements);
          } else {
            const template = document.getElementById('achievement-badge-template');
            
            experience.achievements.forEach((achievement, achievementIndex) => {
              const badge = document.importNode(template.content, true);
              badge.querySelector('.achievement-text').textContent = achievement;
              
              // Set up delete button
              const deleteBtn = badge.querySelector('.delete-achievement');
              deleteBtn.addEventListener('click', () => {
                resumeData.experience[index].achievements.splice(achievementIndex, 1);
                updateAchievements();
              });
              
              achievementsContainer.appendChild(badge);
            });
          }
        }
        
        // Initial update
        updateAchievements();
        
        // Add achievement event handlers
        addAchievementBtn.addEventListener('click', () => {
          const achievement = achievementInput.value.trim();
          if (achievement) {
            if (!resumeData.experience[index].achievements) {
              resumeData.experience[index].achievements = [];
            }
            resumeData.experience[index].achievements.push(achievement);
            achievementInput.value = '';
            updateAchievements();
          }
        });
        
        achievementInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            addAchievementBtn.click();
          }
        });
        
        experiencesContainer.appendChild(experienceItem);
      });
      
      // Initialize drag-and-drop for this list
      initializeSortable(experiencesContainer, 'experience');
    }
  }
  
  function updateEducationList() {
    const educationContainer = document.getElementById('education-container');
    const emptyEducationMessage = document.getElementById('empty-education');
    
    educationContainer.innerHTML = '';
    
    if (resumeData.education.length === 0) {
      emptyEducationMessage.classList.remove('hidden');
    } else {
      emptyEducationMessage.classList.add('hidden');
      
      resumeData.education.forEach((education, index) => {
        const template = document.getElementById('education-item-template');
        const educationItem = document.importNode(template.content, true);
        
        // Set the title based on available data
        const titleElement = educationItem.querySelector('.education-title');
        if (education.school || education.degree) {
          titleElement.textContent = `${education.degree || ''}${education.school ? ` from ${education.school}` : ''}`;
        } else {
          titleElement.textContent = `Education Entry ${index + 1}`;
        }
        
        // Fill in form fields
        educationItem.querySelector('.school-input').value = education.school || '';
        educationItem.querySelector('.degree-input').value = education.degree || '';
        educationItem.querySelector('.field-input').value = education.fieldOfStudy || '';
        educationItem.querySelector('.edu-location-input').value = education.location || '';
        educationItem.querySelector('.edu-description-input').value = education.description || '';
        
        // Set date button text
        const startDateBtn = educationItem.querySelector('.edu-start-date-btn');
        const startDateText = startDateBtn.querySelector('.date-text');
        startDateText.textContent = education.startDate || 'Select Date';
        
        const endDateBtn = educationItem.querySelector('.edu-end-date-btn');
        const endDateText = endDateBtn.querySelector('.date-text');
        endDateText.textContent = education.endDate || 'Select Date';
        
        // Add event listeners for input fields
        educationItem.querySelector('.school-input').addEventListener('input', (e) => {
          resumeData.education[index].school = e.target.value;
          
          // Update card title
          const card = e.target.closest('.education-item');
          const title = card.querySelector('.education-title');
          if (resumeData.education[index].degree || e.target.value) {
            title.textContent = `${resumeData.education[index].degree || ''}${e.target.value ? ` from ${e.target.value}` : ''}`;
          } else {
            title.textContent = `Education Entry ${index + 1}`;
          }
        });
        
        educationItem.querySelector('.degree-input').addEventListener('input', (e) => {
          resumeData.education[index].degree = e.target.value;
          
          // Update card title
          const card = e.target.closest('.education-item');
          const title = card.querySelector('.education-title');
          if (e.target.value || resumeData.education[index].school) {
            title.textContent = `${e.target.value || ''}${resumeData.education[index].school ? ` from ${resumeData.education[index].school}` : ''}`;
          } else {
            title.textContent = `Education Entry ${index + 1}`;
          }
        });
        
        educationItem.querySelector('.field-input').addEventListener('input', (e) => {
          resumeData.education[index].fieldOfStudy = e.target.value;
        });
        
        educationItem.querySelector('.edu-location-input').addEventListener('input', (e) => {
          resumeData.education[index].location = e.target.value;
        });
        
        educationItem.querySelector('.edu-description-input').addEventListener('input', (e) => {
          resumeData.education[index].description = e.target.value;
        });
        
        // Set up date picker buttons
        startDateBtn.addEventListener('click', () => {
          openDatePicker('edu-start', index);
        });
        
        endDateBtn.addEventListener('click', () => {
          openDatePicker('edu-end', index);
        });
        
        // Set up delete button
        const deleteBtn = educationItem.querySelector('.delete-education');
        deleteBtn.addEventListener('click', () => {
          deleteEducation(index);
        });
        
        // Set up toggle expand button
        const toggleBtn = educationItem.querySelector('.toggle-expand');
        toggleBtn.addEventListener('click', () => {
          const card = toggleBtn.closest('.education-item');
          const content = card.querySelector('.card-content');
          
          if (content.style.display === 'none') {
            content.style.display = 'block';
            toggleBtn.querySelector('.icon-expand').textContent = '▼';
          } else {
            content.style.display = 'none';
            toggleBtn.querySelector('.icon-expand').textContent = '▶';
          }
        });
        
        educationContainer.appendChild(educationItem);
      });
      
      // Initialize drag-and-drop for this list
      initializeSortable(educationContainer, 'education');
    }
  }
  
  function updateProjectsList() {
    const projectsContainer = document.getElementById('projects-container');
    const emptyProjectsMessage = document.getElementById('empty-projects');
    
    projectsContainer.innerHTML = '';
    
    if (resumeData.projects.length === 0) {
      emptyProjectsMessage.classList.remove('hidden');
    } else {
      emptyProjectsMessage.classList.add('hidden');
      
      resumeData.projects.forEach((project, index) => {
        const template = document.getElementById('project-item-template');
        const projectItem = document.importNode(template.content, true);
        
        // Set the title based on available data
        const titleElement = projectItem.querySelector('.project-title');
        if (project.name) {
          titleElement.textContent = project.name;
        } else {
          titleElement.textContent = `Project Entry ${index + 1}`;
        }
        
        // Fill in form fields
        projectItem.querySelector('.project-name-input').value = project.name || '';
        projectItem.querySelector('.project-url-input').value = project.url || '';
        projectItem.querySelector('.project-description-input').value = project.description || '';
        
        // Set date button text
        const startDateBtn = projectItem.querySelector('.project-start-date-btn');
        const startDateText = startDateBtn.querySelector('.date-text');
        startDateText.textContent = project.startDate || 'Select Date';
        
        const endDateBtn = projectItem.querySelector('.project-end-date-btn');
        const endDateText = endDateBtn.querySelector('.date-text');
        endDateText.textContent = project.endDate || 'Select Date';
        
        // Add event listeners for input fields
        projectItem.querySelector('.project-name-input').addEventListener('input', (e) => {
          resumeData.projects[index].name = e.target.value;
          
          // Update card title
          const card = e.target.closest('.project-item');
          const title = card.querySelector('.project-title');
          if (e.target.value) {
            title.textContent = e.target.value;
          } else {
            title.textContent = `Project Entry ${index + 1}`;
          }
        });
        
        projectItem.querySelector('.project-url-input').addEventListener('input', (e) => {
          resumeData.projects[index].url = e.target.value;
        });
        
        projectItem.querySelector('.project-description-input').addEventListener('input', (e) => {
          resumeData.projects[index].description = e.target.value;
        });
        
        // Set up date picker buttons
        startDateBtn.addEventListener('click', () => {
          openDatePicker('project-start', index);
        });
        
        endDateBtn.addEventListener('click', () => {
          openDatePicker('project-end', index);
        });
        
        // Set up delete button
        const deleteBtn = projectItem.querySelector('.delete-project');
        deleteBtn.addEventListener('click', () => {
          deleteProject(index);
        });
        
        // Set up toggle expand button
        const toggleBtn = projectItem.querySelector('.toggle-expand');
        toggleBtn.addEventListener('click', () => {
          const card = toggleBtn.closest('.project-item');
          const content = card.querySelector('.card-content');
          
          if (content.style.display === 'none') {
            content.style.display = 'block';
            toggleBtn.querySelector('.icon-expand').textContent = '▼';
          } else {
            content.style.display = 'none';
            toggleBtn.querySelector('.icon-expand').textContent = '▶';
          }
        });
        
        projectsContainer.appendChild(projectItem);
      });
      
      // Initialize drag-and-drop for this list
      initializeSortable(projectsContainer, 'projects');
    }
  }
  
  // Delete item functions
  
  function deleteSkill(index) {
    resumeData.skills.splice(index, 1);
    updateSkillsList();
  }
  
  function deleteExperience(index) {
    resumeData.experience.splice(index, 1);
    updateExperiencesList();
  }
  
  function deleteEducation(index) {
    resumeData.education.splice(index, 1);
    updateEducationList();
  }
  
  function deleteProject(index) {
    resumeData.projects.splice(index, 1);
    updateProjectsList();
  }
  
  // Edit skill function
  function editSkill(index) {
    editingSkillIndex = index;
    const skill = resumeData.skills[index];
    
    document.getElementById('edit-skill-title').textContent = `Edit Skill Level: ${skill.name}`;
    
    // Set slider value based on skill level
    let sliderValue = 50; // Default to intermediate
    switch (skill.level) {
      case 'Beginner': sliderValue = 25; break;
      case 'Intermediate': sliderValue = 50; break;
      case 'Advanced': sliderValue = 75; break;
      case 'Expert': sliderValue = 100; break;
    }
    
    document.getElementById('skill-level-slider').value = sliderValue;
    updateSkillLevelText();
    
    // Show modal
    document.getElementById('modal-overlay').classList.remove('hidden');
    document.getElementById('skill-edit-modal').classList.remove('hidden');
  }
  
  // Date picker functions
  function openDatePicker(fieldType, index) {
    currentDateField = fieldType;
    currentDateIndex = index;
    
    // Set title based on field type
    let title = 'Select Date';
    if (fieldType.includes('start')) {
      title = 'Select Start Date';
    } else if (fieldType.includes('end')) {
      title = 'Select End Date';
    }
    
    document.getElementById('date-picker-title').textContent = title;
    
    // Show/hide present option based on whether it's an end date
    if (fieldType.includes('end')) {
      document.getElementById('present-option').classList.remove('hidden');
    } else {
      document.getElementById('present-option').classList.add('hidden');
    }
    
    // Set current values if available
    let currentDate = '';
    
    if (fieldType.includes('experience')) {
      currentDate = fieldType.includes('start') ? 
        resumeData.experience[index].startDate : 
        resumeData.experience[index].endDate;
    } else if (fieldType.includes('edu')) {
      currentDate = fieldType.includes('start') ? 
        resumeData.education[index].startDate : 
        resumeData.education[index].endDate;
    } else if (fieldType.includes('project')) {
      currentDate = fieldType.includes('start') ? 
        resumeData.projects[index].startDate : 
        resumeData.projects[index].endDate;
    }
    
    // Parse date if it exists and isn't "Present"
    if (currentDate && currentDate !== 'Present') {
      const [month, year] = currentDate.split('/');
      document.getElementById('month-select').value = month;
      document.getElementById('year-select').value = year;
    } else {
      // Default to current month/year
      const now = new Date();
      document.getElementById('month-select').value = (now.getMonth() + 1).toString();
      document.getElementById('year-select').value = now.getFullYear().toString();
    }
    
    // Show modal
    document.getElementById('modal-overlay').classList.remove('hidden');
    document.getElementById('date-picker-modal').classList.remove('hidden');
  }
  
  // Initialize UI with data
  function initializeUI() {
    // Fill personal info form
    for (const field in resumeData.personalInfo) {
      const input = document.getElementById(field);
      if (input) {
        input.value = resumeData.personalInfo[field] || '';
      }
    }
    
    // Update all lists
    updateExperiencesList();
    updateEducationList();
    updateSkillsList();
    updateProjectsList();
    
    // Set template
    document.getElementById('template-select').value = currentTemplate;
    
    // If job title exists, fetch skill suggestions
    if (resumeData.personalInfo.jobTitle) {
      getSkillSuggestions(resumeData.personalInfo.jobTitle);
    }
  }
  
  // Initialize sortable lists
  function initializeSortableLists() {
    const experiencesContainer = document.getElementById('experiences-container');
    const educationContainer = document.getElementById('education-container');
    const projectsContainer = document.getElementById('projects-container');
    
    initializeSortable(experiencesContainer, 'experience');
    initializeSortable(educationContainer, 'education');
    initializeSortable(projectsContainer, 'projects');
  }
  
  function initializeSortable(container, type) {
    if (container && container.children.length > 0) {
      Sortable.create(container, {
        handle: '.card-drag-handle',
        animation: 150,
        onEnd: function(evt) {
          const oldIndex = evt.oldIndex;
          const newIndex = evt.newIndex;
          
          if (oldIndex !== newIndex) {
            // Reorder the array
            const item = resumeData[type].splice(oldIndex, 1)[0];
            resumeData[type].splice(newIndex, 0, item);
            
            // Update UI
            if (type === 'experience') {
              updateExperiencesList();
            } else if (type === 'education') {
              updateEducationList();
            } else if (type === 'projects') {
              updateProjectsList();
            }
          }
        }
      });
    }
  }
  
  // Resume preview generation
  function updateResumePreview() {
    const resumePreview = document.getElementById('resume-preview');
    
    // First, check if there's data to display
    const hasData = resumeData.personalInfo.firstName || 
                    resumeData.personalInfo.lastName || 
                    resumeData.personalInfo.jobTitle;
    
    if (!hasData) {
      resumePreview.innerHTML = `
        <div class="empty-preview">
          <p>Add your information in the editor to see a preview of your resume here.</p>
        </div>
      `;
      return;
    }
    
    // Generate the preview based on the selected template
    let previewHTML = '';
    
    switch (currentTemplate) {
      case 'professional':
        previewHTML = generateProfessionalTemplate();
        break;
      case 'modern':
        previewHTML = generateModernTemplate();
        break;
      case 'creative':
        previewHTML = generateCreativeTemplate();
        break;
      case 'simple':
      default:
        previewHTML = generateSimpleTemplate();
        break;
    }
    
    resumePreview.innerHTML = previewHTML;
  }
  
  // Template generation functions
  function generateSimpleTemplate() {
    const { personalInfo, experience, education, skills, projects } = resumeData;
    
    return `
      <div class="resume-template simple-template">
        <div class="resume-header">
          <h1>${personalInfo.firstName || ''} ${personalInfo.lastName || ''}</h1>
          ${personalInfo.jobTitle ? `<h2>${personalInfo.jobTitle}</h2>` : ''}
        </div>
        
        <div class="resume-contact">
          ${personalInfo.email ? `<div><span>Email:</span> ${personalInfo.email}</div>` : ''}
          ${personalInfo.phone ? `<div><span>Phone:</span> ${personalInfo.phone}</div>` : ''}
          ${personalInfo.location ? `<div><span>Location:</span> ${personalInfo.location}</div>` : ''}
          ${personalInfo.website ? `<div><span>Website:</span> ${personalInfo.website}</div>` : ''}
        </div>
        
        ${personalInfo.summary ? `
          <div class="resume-section">
            <h3>Summary</h3>
            <p>${personalInfo.summary}</p>
          </div>
        ` : ''}
        
        ${experience.length > 0 ? `
          <div class="resume-section">
            <h3>Experience</h3>
            ${experience.map(exp => `
              <div class="resume-item">
                <div class="resume-item-header">
                  <div class="resume-item-title">
                    ${exp.position ? `<h4>${exp.position}</h4>` : ''}
                    ${exp.company ? `<h5>${exp.company}</h5>` : ''}
                  </div>
                  <div class="resume-item-date">
                    ${exp.startDate ? `${exp.startDate}` : ''}
                    ${exp.startDate && exp.endDate ? ' - ' : ''}
                    ${exp.endDate ? `${exp.endDate}` : ''}
                  </div>
                </div>
                ${exp.location ? `<div class="resume-item-location">${exp.location}</div>` : ''}
                ${exp.description ? `<p>${exp.description}</p>` : ''}
                ${exp.achievements && exp.achievements.length > 0 ? `
                  <ul>
                    ${exp.achievements.map(achievement => `
                      <li>${achievement}</li>
                    `).join('')}
                  </ul>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${education.length > 0 ? `
          <div class="resume-section">
            <h3>Education</h3>
            ${education.map(edu => `
              <div class="resume-item">
                <div class="resume-item-header">
                  <div class="resume-item-title">
                    ${edu.degree ? `<h4>${edu.degree}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}</h4>` : ''}
                    ${edu.school ? `<h5>${edu.school}</h5>` : ''}
                  </div>
                  <div class="resume-item-date">
                    ${edu.startDate ? `${edu.startDate}` : ''}
                    ${edu.startDate && edu.endDate ? ' - ' : ''}
                    ${edu.endDate ? `${edu.endDate}` : ''}
                  </div>
                </div>
                ${edu.location ? `<div class="resume-item-location">${edu.location}</div>` : ''}
                ${edu.description ? `<p>${edu.description}</p>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${skills.length > 0 ? `
          <div class="resume-section">
            <h3>Skills</h3>
            <div class="resume-skills">
              ${skills.map(skill => `
                <div class="resume-skill">
                  <span class="skill-name">${skill.name}</span>
                  <span class="skill-level">(${skill.level})</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        ${projects.length > 0 ? `
          <div class="resume-section">
            <h3>Projects</h3>
            ${projects.map(project => `
              <div class="resume-item">
                <div class="resume-item-header">
                  <div class="resume-item-title">
                    <h4>${project.name || 'Unnamed Project'}</h4>
                  </div>
                  <div class="resume-item-date">
                    ${project.startDate ? `${project.startDate}` : ''}
                    ${project.startDate && project.endDate ? ' - ' : ''}
                    ${project.endDate ? `${project.endDate}` : ''}
                  </div>
                </div>
                ${project.url ? `<div class="resume-item-url"><a href="${project.url}">${project.url}</a></div>` : ''}
                ${project.description ? `<p>${project.description}</p>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }
  
  function generateProfessionalTemplate() {
    const { personalInfo, experience, education, skills, projects } = resumeData;
    
    return `
      <div class="resume-template professional-template">
        <div class="resume-header">
          <div class="resume-title">
            <h1>${personalInfo.firstName || ''} ${personalInfo.lastName || ''}</h1>
            ${personalInfo.jobTitle ? `<h2>${personalInfo.jobTitle}</h2>` : ''}
          </div>
          <div class="resume-contact">
            ${personalInfo.email ? `<div><i class="icon">📧</i> ${personalInfo.email}</div>` : ''}
            ${personalInfo.phone ? `<div><i class="icon">📱</i> ${personalInfo.phone}</div>` : ''}
            ${personalInfo.location ? `<div><i class="icon">📍</i> ${personalInfo.location}</div>` : ''}
            ${personalInfo.website ? `<div><i class="icon">🌐</i> ${personalInfo.website}</div>` : ''}
          </div>
        </div>
        
        ${personalInfo.summary ? `
          <div class="resume-section">
            <h3>Professional Summary</h3>
            <div class="section-content">
              <p>${personalInfo.summary}</p>
            </div>
          </div>
        ` : ''}
        
        ${experience.length > 0 ? `
          <div class="resume-section">
            <h3>Work Experience</h3>
            <div class="section-content">
              ${experience.map(exp => `
                <div class="resume-item">
                  <div class="resume-item-header">
                    <div class="resume-item-title">
                      ${exp.position ? `<h4>${exp.position}</h4>` : ''}
                      ${exp.company ? `<h5>${exp.company}${exp.location ? ` | ${exp.location}` : ''}</h5>` : ''}
                    </div>
                    <div class="resume-item-date">
                      ${exp.startDate ? `${exp.startDate}` : ''}
                      ${exp.startDate && exp.endDate ? ' - ' : ''}
                      ${exp.endDate ? `${exp.endDate}` : ''}
                    </div>
                  </div>
                  ${exp.description ? `<p>${exp.description}</p>` : ''}
                  ${exp.achievements && exp.achievements.length > 0 ? `
                    <div class="achievements">
                      <h6>Key Achievements:</h6>
                      <ul>
                        ${exp.achievements.map(achievement => `
                          <li>${achievement}</li>
                        `).join('')}
                      </ul>
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        ${education.length > 0 ? `
          <div class="resume-section">
            <h3>Education</h3>
            <div class="section-content">
              ${education.map(edu => `
                <div class="resume-item">
                  <div class="resume-item-header">
                    <div class="resume-item-title">
                      ${edu.degree ? `<h4>${edu.degree}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}</h4>` : ''}
                      ${edu.school ? `<h5>${edu.school}${edu.location ? ` | ${edu.location}` : ''}</h5>` : ''}
                    </div>
                    <div class="resume-item-date">
                      ${edu.startDate ? `${edu.startDate}` : ''}
                      ${edu.startDate && edu.endDate ? ' - ' : ''}
                      ${edu.endDate ? `${edu.endDate}` : ''}
                    </div>
                  </div>
                  ${edu.description ? `<p>${edu.description}</p>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        <div class="resume-columns">
          ${skills.length > 0 ? `
            <div class="resume-section">
              <h3>Skills</h3>
              <div class="section-content">
                <div class="skills-list">
                  ${skills.map(skill => `
                    <div class="skill-item">
                      <span class="skill-name">${skill.name}</span>
                      <div class="skill-level-bar">
                        <div class="skill-level-fill ${skill.level.toLowerCase()}" data-level="${skill.level}"></div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          ` : ''}
          
          ${projects.length > 0 ? `
            <div class="resume-section">
              <h3>Projects</h3>
              <div class="section-content">
                ${projects.map(project => `
                  <div class="resume-item">
                    <div class="resume-item-header">
                      <div class="resume-item-title">
                        <h4>${project.name || 'Unnamed Project'}</h4>
                      </div>
                      <div class="resume-item-date">
                        ${project.startDate ? `${project.startDate}` : ''}
                        ${project.startDate && project.endDate ? ' - ' : ''}
                        ${project.endDate ? `${project.endDate}` : ''}
                      </div>
                    </div>
                    ${project.url ? `<div class="resume-item-url"><a href="${project.url}">${project.url}</a></div>` : ''}
                    ${project.description ? `<p>${project.description}</p>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }
  
  function generateModernTemplate() {
    const { personalInfo, experience, education, skills, projects } = resumeData;
    
    return `
      <div class="resume-template modern-template">
        <div class="resume-header">
          <div class="resume-name">
            <h1>${personalInfo.firstName || ''} ${personalInfo.lastName || ''}</h1>
            ${personalInfo.jobTitle ? `<h2>${personalInfo.jobTitle}</h2>` : ''}
          </div>
        </div>
        
        <div class="resume-body">
          <div class="resume-sidebar">
            <div class="sidebar-section contact-info">
              <h3>Contact</h3>
              <div class="contact-list">
                ${personalInfo.email ? `<div class="contact-item"><i class="icon">📧</i> ${personalInfo.email}</div>` : ''}
                ${personalInfo.phone ? `<div class="contact-item"><i class="icon">📱</i> ${personalInfo.phone}</div>` : ''}
                ${personalInfo.location ? `<div class="contact-item"><i class="icon">📍</i> ${personalInfo.location}</div>` : ''}
                ${personalInfo.website ? `<div class="contact-item"><i class="icon">🌐</i> ${personalInfo.website}</div>` : ''}
              </div>
            </div>
            
            ${skills.length > 0 ? `
              <div class="sidebar-section skills-section">
                <h3>Skills</h3>
                <div class="skills-list">
                  ${skills.map(skill => `
                    <div class="skill-item">
                      <div class="skill-header">
                        <span class="skill-name">${skill.name}</span>
                        <span class="skill-level">${skill.level}</span>
                      </div>
                      <div class="skill-bar">
                        <div class="skill-progress ${skill.level.toLowerCase()}"></div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
            
            ${education.length > 0 ? `
              <div class="sidebar-section education-section">
                <h3>Education</h3>
                ${education.map(edu => `
                  <div class="sidebar-item">
                    <div class="sidebar-item-title">
                      ${edu.degree ? `<h4>${edu.degree}</h4>` : ''}
                      ${edu.fieldOfStudy ? `<div class="subtitle">${edu.fieldOfStudy}</div>` : ''}
                    </div>
                    ${edu.school ? `<div class="small-heading">${edu.school}</div>` : ''}
                    <div class="date-range">
                      ${edu.startDate ? `${edu.startDate}` : ''}
                      ${edu.startDate && edu.endDate ? ' - ' : ''}
                      ${edu.endDate ? `${edu.endDate}` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
          
          <div class="resume-main">
            ${personalInfo.summary ? `
              <div class="main-section summary-section">
                <h3>Profile</h3>
                <p>${personalInfo.summary}</p>
              </div>
            ` : ''}
            
            ${experience.length > 0 ? `
              <div class="main-section experience-section">
                <h3>Work Experience</h3>
                ${experience.map(exp => `
                  <div class="main-item">
                    <div class="item-header">
                      <div class="item-title-group">
                        ${exp.position ? `<h4>${exp.position}</h4>` : ''}
                        <div class="item-subtitle">
                          ${exp.company ? `<span class="company">${exp.company}</span>` : ''}
                          ${exp.company && exp.location ? ' | ' : ''}
                          ${exp.location ? `<span class="location">${exp.location}</span>` : ''}
                        </div>
                      </div>
                      <div class="date-range">
                        ${exp.startDate ? `${exp.startDate}` : ''}
                        ${exp.startDate && exp.endDate ? ' - ' : ''}
                        ${exp.endDate ? `${exp.endDate}` : ''}
                      </div>
                    </div>
                    ${exp.description ? `<p class="item-description">${exp.description}</p>` : ''}
                    ${exp.achievements && exp.achievements.length > 0 ? `
                      <div class="achievements">
                        <h5>Achievements:</h5>
                        <ul>
                          ${exp.achievements.map(achievement => `
                            <li>${achievement}</li>
                          `).join('')}
                        </ul>
                      </div>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            ${projects.length > 0 ? `
              <div class="main-section projects-section">
                <h3>Projects</h3>
                ${projects.map(project => `
                  <div class="main-item">
                    <div class="item-header">
                      <div class="item-title-group">
                        <h4>${project.name || 'Unnamed Project'}</h4>
                        ${project.url ? `<a href="${project.url}" class="project-link">${project.url}</a>` : ''}
                      </div>
                      <div class="date-range">
                        ${project.startDate ? `${project.startDate}` : ''}
                        ${project.startDate && project.endDate ? ' - ' : ''}
                        ${project.endDate ? `${project.endDate}` : ''}
                      </div>
                    </div>
                    ${project.description ? `<p class="item-description">${project.description}</p>` : ''}
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }
  
  function generateCreativeTemplate() {
    const { personalInfo, experience, education, skills, projects } = resumeData;
    
    return `
      <div class="resume-template creative-template">
        <div class="resume-header">
          <div class="header-left">
            <h1>
              <span class="first-name">${personalInfo.firstName || ''}</span>
              <span class="last-name">${personalInfo.lastName || ''}</span>
            </h1>
            ${personalInfo.jobTitle ? `<h2>${personalInfo.jobTitle}</h2>` : ''}
          </div>
          <div class="header-right">
            ${personalInfo.email ? `<div class="contact-item"><span class="icon">📧</span> ${personalInfo.email}</div>` : ''}
            ${personalInfo.phone ? `<div class="contact-item"><span class="icon">📱</span> ${personalInfo.phone}</div>` : ''}
            ${personalInfo.location ? `<div class="contact-item"><span class="icon">📍</span> ${personalInfo.location}</div>` : ''}
            ${personalInfo.website ? `<div class="contact-item"><span class="icon">🌐</span> ${personalInfo.website}</div>` : ''}
          </div>
        </div>
        
        <div class="creative-divider"></div>
        
        ${personalInfo.summary ? `
          <div class="summary-section">
            <h3><span class="section-icon">👤</span> About Me</h3>
            <p>${personalInfo.summary}</p>
          </div>
        ` : ''}
        
        <div class="creative-layout">
          <div class="creative-main">
            ${experience.length > 0 ? `
              <div class="creative-section">
                <h3><span class="section-icon">💼</span> Work Experience</h3>
                ${experience.map(exp => `
                  <div class="creative-item">
                    <div class="creative-timeline">
                      <div class="timeline-dot"></div>
                      <div class="timeline-line"></div>
                      <div class="timeline-date">
                        ${exp.startDate ? `${exp.startDate}` : ''}
                        ${exp.startDate && exp.endDate ? '<br>|<br>' : ''}
                        ${exp.endDate ? `${exp.endDate}` : ''}
                      </div>
                    </div>
                    <div class="creative-content">
                      <div class="creative-title">
                        ${exp.position ? `<h4>${exp.position}</h4>` : ''}
                        <div class="creative-subtitle">
                          ${exp.company ? `<span>${exp.company}</span>` : ''}
                          ${exp.company && exp.location ? ' • ' : ''}
                          ${exp.location ? `<span>${exp.location}</span>` : ''}
                        </div>
                      </div>
                      ${exp.description ? `<p>${exp.description}</p>` : ''}
                      ${exp.achievements && exp.achievements.length > 0 ? `
                        <div class="achievements-list">
                          <h5>Key Achievements:</h5>
                          <ul>
                            ${exp.achievements.map(achievement => `
                              <li>${achievement}</li>
                            `).join('')}
                          </ul>
                        </div>
                      ` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            ${projects.length > 0 ? `
              <div class="creative-section">
                <h3><span class="section-icon">🚀</span> Projects</h3>
                <div class="projects-grid">
                  ${projects.map(project => `
                    <div class="project-card">
                      <div class="project-header">
                        <h4>${project.name || 'Unnamed Project'}</h4>
                        <div class="project-duration">
                          ${project.startDate ? `${project.startDate}` : ''}
                          ${project.startDate && project.endDate ? ' - ' : ''}
                          ${project.endDate ? `${project.endDate}` : ''}
                        </div>
                      </div>
                      ${project.description ? `<p>${project.description}</p>` : ''}
                      ${project.url ? `<a href="${project.url}" class="project-link">${project.url}</a>` : ''}
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
          
          <div class="creative-sidebar">
            ${skills.length > 0 ? `
              <div class="creative-section">
                <h3><span class="section-icon">🛠️</span> Skills</h3>
                <div class="creative-skills">
                  ${skills.map(skill => `
                    <div class="creative-skill">
                      <div class="skill-tag">${skill.name}</div>
                      <div class="skill-level ${skill.level.toLowerCase()}">${skill.level}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
            
            ${education.length > 0 ? `
              <div class="creative-section">
                <h3><span class="section-icon">🎓</span> Education</h3>
                ${education.map(edu => `
                  <div class="education-item">
                    ${edu.degree ? `<h4>${edu.degree}</h4>` : ''}
                    ${edu.fieldOfStudy ? `<div class="edu-field">${edu.fieldOfStudy}</div>` : ''}
                    ${edu.school ? `<div class="edu-school">${edu.school}</div>` : ''}
                    <div class="edu-details">
                      ${edu.location ? `<span>${edu.location}</span>` : ''}
                      ${edu.startDate || edu.endDate ? `<span class="edu-dates">
                        ${edu.startDate ? `${edu.startDate}` : ''}
                        ${edu.startDate && edu.endDate ? ' - ' : ''}
                        ${edu.endDate ? `${edu.endDate}` : ''}
                      </span>` : ''}
                    </div>
                    ${edu.description ? `<p class="edu-description">${edu.description}</p>` : ''}
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }
  
  // AI Skills Suggestions
  async function getSkillSuggestions(jobTitle) {
    const suggestionsLoading = document.getElementById('suggestions-loading');
    const suggestionBadges = document.getElementById('suggestion-badges');
    const message = document.getElementById('suggestion-message');
    
    // Show loading state
    suggestionsLoading.classList.remove('hidden');
    suggestionBadges.innerHTML = '';
    message.textContent = 'Getting AI suggestions for skills...';
    
    // In a real implementation, this would call an API for OpenAI
    // For this example, we'll simulate with predefined skills based on job titles
    setTimeout(() => {
      let suggestions = [];
      const title = jobTitle.toLowerCase();
      
      if (title.includes('software') || title.includes('developer') || title.includes('engineer')) {
        suggestions = ['JavaScript', 'React', 'Node.js', 'Python', 'Git', 'API Design', 'Problem Solving', 'SQL'];
      } else if (title.includes('data') || title.includes('analyst')) {
        suggestions = ['SQL', 'Python', 'Data Visualization', 'Excel', 'Statistics', 'Power BI', 'Tableau', 'R'];
      } else if (title.includes('design') || title.includes('ux') || title.includes('ui')) {
        suggestions = ['Figma', 'Adobe XD', 'User Research', 'Wireframing', 'Prototyping', 'Visual Design', 'CSS', 'Typography'];
      } else if (title.includes('market')) {
        suggestions = ['Social Media Marketing', 'SEO', 'Content Strategy', 'Google Analytics', 'Email Marketing', 'CRM', 'A/B Testing', 'Copywriting'];
      } else if (title.includes('product')) {
        suggestions = ['Product Strategy', 'User Research', 'Agile Methodology', 'Roadmapping', 'Data Analysis', 'Stakeholder Management', 'Wireframing', 'User Stories'];
      } else {
        suggestions = ['Communication', 'Teamwork', 'Problem Solving', 'Time Management', 'Microsoft Office', 'Project Management', 'Organization', 'Leadership'];
      }
      
      // Display suggestions
      displaySkillSuggestions(suggestions);
      suggestionsLoading.classList.add('hidden');
      message.textContent = 'AI-suggested skills based on your job title:';
    }, 1000);
  }
  
  function displaySkillSuggestions(suggestions) {
    const container = document.getElementById('suggestion-badges');
    container.innerHTML = '';
    
    const template = document.getElementById('skill-suggestion-template');
    
    suggestions.forEach(skill => {
      const badge = document.importNode(template.content, true);
      
      badge.querySelector('.suggestion-text').textContent = skill;
      
      // Add event listener to add the skill when clicked
      badge.querySelector('.add-suggestion').addEventListener('click', () => {
        // Check if skill already exists
        const exists = resumeData.skills.some(s => s.name.toLowerCase() === skill.toLowerCase());
        
        if (!exists) {
          resumeData.skills.push({
            name: skill,
            level: 'Intermediate'
          });
          
          updateSkillsList();
        }
      });
      
      container.appendChild(badge);
    });
  }
  
  // Storage functions
 function saveResumeData() {
  console.log("✅ Save button clicked");

  // Personal Info
  const personalInfo = {
    firstName: document.getElementById("firstName")?.value || "",
    lastName: document.getElementById("lastName")?.value || "",
    email: document.getElementById("email")?.value || "",
    phone: document.getElementById("phone")?.value || "",
    jobTitle: document.getElementById("jobTitle")?.value || "",
    location: document.getElementById("location")?.value || "",
    website: document.getElementById("website")?.value || "",
    summary: document.getElementById("summary")?.value || ""
  };

  // Experience
  const experienceCards = document.querySelectorAll(".experience-item");
  const experience = Array.from(experienceCards).map(card => ({
    position: card.querySelector(".position-input")?.value || "",
    company: card.querySelector(".company-input")?.value || "",
    startDate: card.querySelector(".start-date-btn .date-text")?.textContent.trim() || "",
    endDate: card.querySelector(".end-date-btn .date-text")?.textContent.trim() || "",
    location: card.querySelector(".location-input")?.value || "",
    achievements: Array.from(card.querySelectorAll(".achievement-badge .achievement-text"))
      .map(a => a.textContent.trim())
  }));

  // Education
  const educationCards = document.querySelectorAll(".education-item");
  const education = Array.from(educationCards).map(card => ({
    school: card.querySelector(".school-input")?.value || "",
    degree: card.querySelector(".degree-input")?.value || "",
    fieldOfStudy: card.querySelector(".field-input")?.value || "",
    startDate: card.querySelector(".start-date-btn .date-text")?.textContent.trim() || "",
    endDate: card.querySelector(".end-date-btn .date-text")?.textContent.trim() || "",
    location: card.querySelector(".location-input")?.value || "",
    description: card.querySelector(".description-input")?.value || ""
  }));

  // Skills
  const skillCards = document.querySelectorAll(".skills-grid .skill-card");
  const skills = Array.from(skillCards).map(card => ({
    name: card.querySelector(".skill-name")?.textContent.trim() || "",
    level: card.querySelector(".skill-level")?.textContent.trim() || ""
  }));

  // Projects
  const projectCards = document.querySelectorAll(".projects-grid .project-item, .projects-grid .card");
const projects = Array.from(projectCards).map(card => ({
  name: card.querySelector(".project-name-input")?.value || "",
  startDate: card.querySelector(".start-date-btn .date-text")?.textContent.trim() || "",
  endDate: card.querySelector(".end-date-btn .date-text")?.textContent.trim() || "",
  url: card.querySelector(".project-url-input")?.value || "",
  description: card.querySelector(".description-input")?.value || ""
}));

  // Final JSON
  const resumeData = {
    personalInfo,
    experience,
    education,
    skills,
    projects
  };

  console.log("📦 Sending resume data to backend:", resumeData);

  // Send to backend
  fetch("http://localhost/smart_resume_app/save_resume.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(resumeData)
  })
    .then(response => response.json())
    .then(data => {
      if (data.status === "success") {
        alert("✅ Resume saved successfully!");
      } else {
        console.error("❌ Server error:", data.message);
        alert("❌ Failed to save resume: " + data.message);
      }
    })
    .catch(error => {
      console.error("🚫 Network error:", error);
      alert("🚫 Could not connect to the server.");
    });
}



    
    
    // Show save notification
    const notification = document.createElement('div');
    notification.className = 'save-notification';
    notification.textContent = 'Resume saved successfully!';
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  
  
  function loadResumeData() {
    const savedData = localStorage.getItem('resumeData');
    const savedTemplate = localStorage.getItem('currentTemplate');
    
    if (savedData) {
      resumeData = JSON.parse(savedData);
    }
    
    if (savedTemplate) {
      currentTemplate = savedTemplate;
    }
  }
  
  // Export resume to PDF
   const { jsPDF } = window.jspdf;
    
    // Get the resume preview element
    const resumePreview = document.getElementById('resume-preview');
    const fullName = `${resumeData.personalInfo.firstName || ''} ${resumeData.personalInfo.lastName || ''}`.trim();
    const fileName = fullName ? `${fullName} - Resume.pdf` : 'Resume.pdf';
    
    // Create a new PDF with letter size (8.5 x 11 inches)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'in',
      format: 'letter'
    });
    
    // Add html2canvas script if not already loaded
    if (typeof html2canvas === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      script.onload = function() {
        continueExport();
      };
      document.head.appendChild(script);
    } else {
      continueExport();
    }
    
    function continueExport() {
      // Set up the options for html2canvas
      const options = {
        scale: 2,
        useCORS: true,
        allowTaint: true
      };
      
      // Use html2canvas to capture the preview as an image
      html2canvas(resumePreview, options).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        
        // Calculate the proper dimensions to fit the letter size
        const imgWidth = 8; // 8 inches width (with margins)
        const pageHeight = 11; // 11 inches height
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 0.5; // 0.5 inch margin from top
        
        // Add the first page
        pdf.addImage(imgData, 'PNG', 0.5, position, imgWidth, imgHeight); // 0.5 inch margin from left
        heightLeft -= pageHeight - 1; // 1 inch for margins (0.5 top + 0.5 bottom)
        
        // Add new pages if the content is long
        while (heightLeft > 0) {
          position = 0.5 - (pageHeight - 1); // Start at top of the new page
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0.5, position, imgWidth, imgHeight);
          heightLeft -= (pageHeight - 1);
        }
        
        // Save the PDF
        pdf.save(fileName);
      });
    }
    window.generatePDF = function () {
  const preview = document.getElementById("resume-preview");

  if (!preview) {
    alert("❌ Resume preview not found.");
    return;
  }

  // Delay to ensure fonts/images render fully
  setTimeout(() => {
    html2canvas(preview, {
      allowTaint: true,
      useCORS: true,
      scale: 2,
      backgroundColor: "#ffffff" // ensures white background
    })
      .then(canvas => {
        const imgData = canvas.toDataURL("image/jpeg", 1.0); // ✅ Use JPEG instead of PNG
        const pdf = new jspdf.jsPDF("p", "pt", "a4");

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = Math.min(pageWidth / canvasWidth, pageHeight / canvasHeight);

        const imgWidth = canvasWidth * ratio;
        const imgHeight = canvasHeight * ratio;

        const x = (pageWidth - imgWidth) / 2;
        const y = 20;

        // ✅ Corrected this line
        pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);

        pdf.save("resume.pdf");
      })
      .catch(error => {
        console.error("❌ PDF Export Failed:", error);
        alert("🚫 Failed to generate PDF. Please check your resume preview.");
      });
  }, 500); // wait 0.5 seconds before rendering
};
  
// ✅ Attach event listeners once DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("export-btn").addEventListener("click", window.generatePDF);
  document.getElementById("save-btn").addEventListener("click", saveResumeData);
})
;


window.generatePDF = function () {
  const preview = document.getElementById("resume-preview");

  if (!preview) {
    alert("❌ Resume preview not found.");
    return;
  }

  setTimeout(() => {
    html2canvas(preview, {
      allowTaint: true,
      useCORS: true,
      scale: 2,
      backgroundColor: "#ffffff"
    }).then(canvas => {
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF("p", "pt", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = Math.min(pageWidth / canvasWidth, pageHeight / canvasHeight);

      const imgWidth = canvasWidth * ratio;
      const imgHeight = canvasHeight * ratio;
      const x = (pageWidth - imgWidth) / 2;
      const y = 20;

      pdf.addImage(imgData, "JPEG", x, y, imgWidth, imgHeight);
      pdf.save("resume.pdf");
    }).catch(error => {
      console.error("❌ PDF Export Failed:", error);
      alert("🚫 Failed to generate PDF. Please check your resume preview.");
    });
  }, 500);
};
