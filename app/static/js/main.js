/**
 * Main JavaScript file for the Survey Platform
 */

// On document ready
document.addEventListener('DOMContentLoaded', function() {

    // Auto-hide flash messages after 5 seconds
    setTimeout(function() {
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(function(alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        });
    }, 5000);

    // Add active class to current nav item
    const currentLocation = window.location.pathname;
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    navLinks.forEach(function(link) {
        if (link.getAttribute('href') === currentLocation) {
            link.classList.add('active');
        }
    });

    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
    
    // Confirmation modal handler
    const confirmBtns = document.querySelectorAll('.btn-confirm');
    confirmBtns.forEach(function(btn) {
        btn.addEventListener('click', function(event) {
            if (!confirm(this.dataset.confirmMessage || 'Are you sure you want to proceed?')) {
                event.preventDefault();
            }
        });
    });
    
    // Form validation
    const forms = document.querySelectorAll('.needs-validation');
    Array.from(forms).forEach(function (form) {
        form.addEventListener('submit', function (event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });
    
    // Handle survey completion form
    const surveyCompletionForm = document.getElementById('surveyCompletionForm');
    if (surveyCompletionForm) {
        surveyCompletionForm.addEventListener('submit', function(event) {
            const responseId = document.getElementById('response_id').value;
            if (!responseId || isNaN(responseId)) {
                event.preventDefault();
                alert('Please enter a valid Response ID');
            }
        });
    }
    
    // Search functionality for tables
    const searchInputs = document.querySelectorAll('.table-search');
    searchInputs.forEach(function(input) {
        input.addEventListener('keyup', function() {
            const tableId = this.dataset.tableTarget;
            const table = document.getElementById(tableId);
            if (table) {
                const value = this.value.toLowerCase();
                const rows = table.querySelectorAll('tbody tr');
                
                rows.forEach(function(row) {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.indexOf(value) > -1 ? '' : 'none';
                });
            }
        });
    });
    
    // Countdown timer for session expiration
    function startSessionTimer(expiryMinutes) {
        if (!expiryMinutes) return;
        
        const expiryTime = new Date().getTime() + (expiryMinutes * 60 * 1000);
        const timerDisplay = document.getElementById('session-timer');
        
        if (!timerDisplay) return;
        
        const timerInterval = setInterval(function() {
            const now = new Date().getTime();
            const distance = expiryTime - now;
            
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            timerDisplay.innerHTML = minutes + "m " + seconds + "s";
            
            if (distance < 0) {
                clearInterval(timerInterval);
                timerDisplay.innerHTML = "Session expired";
                window.location.href = '/auth/login';
            } else if (distance < 300000) { // 5 minutes
                timerDisplay.classList.add('text-danger');
            }
        }, 1000);
    }
    
    // Start session timer if the element exists
    const sessionTimeout = document.getElementById('session-timeout');
    if (sessionTimeout) {
        startSessionTimer(parseInt(sessionTimeout.value));
    }
    
    // Toggle password visibility
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    togglePasswordBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            const targetId = this.dataset.target;
            const passwordInput = document.getElementById(targetId);
            
            if (passwordInput) {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                
                // Toggle icon
                this.querySelector('i').classList.toggle('fa-eye');
                this.querySelector('i').classList.toggle('fa-eye-slash');
            }
        });
    });
});
