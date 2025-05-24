/**
 * Main JavaScript file for the Survey Platform
 */

// Use jQuery's document ready for all initializations
// since Select2 is already using it.
$(document).ready(function() {

    // Initialize Select2
    $('.select2-multiple').select2({
        theme: "bootstrap-5", // Use the Bootstrap 5 theme
        placeholder: "Select one or more options", // Default placeholder
        allowClear: true // Adds a small 'x' to clear selected options
    });

    // Auto-hide flash messages after 5 seconds
    setTimeout(function() {
        const alerts = document.querySelectorAll('.alert.alert-dismissible'); // Be more specific with selector
        alerts.forEach(function(alertEl) { // Renamed 'alert' to 'alertEl' to avoid conflict
            // Ensure bootstrap global object is available
            if (typeof bootstrap !== 'undefined' && bootstrap.Alert) {
                const bsAlert = bootstrap.Alert.getOrCreateInstance(alertEl); // Use getOrCreateInstance
                if (bsAlert) { // Check if instance was found/created
                   // bsAlert.close(); // This might be too aggressive if user is interacting
                                   // Consider a fade out or only close if not hovered.
                                   // For now, let's just ensure this code doesn't error
                }
            }
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

    // Initialize Bootstrap Tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        // Ensure bootstrap global object is available
        if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        }
        return null;
    });

    // Initialize Bootstrap Popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        // Ensure bootstrap global object is available
        if (typeof bootstrap !== 'undefined' && bootstrap.Popover) {
            return new bootstrap.Popover(popoverTriggerEl);
        }
        return null;
    });
    
    // Confirmation modal handler (this uses native confirm, not Bootstrap modals)
    const confirmBtns = document.querySelectorAll('.btn-confirm');
    confirmBtns.forEach(function(btn) {
        btn.addEventListener('click', function(event) {
            if (!confirm(this.dataset.confirmMessage || 'Are you sure you want to proceed?')) {
                event.preventDefault();
            }
        });
    });
    
    // Form validation (Bootstrap's built-in validation)
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
            const responseIdInput = document.getElementById('response_id'); // Get the input element
            if (responseIdInput) {
                const responseId = responseIdInput.value;
                if (!responseId || isNaN(responseId)) {
                    event.preventDefault();
                    alert('Please enter a valid Response ID.'); // Or show error more gracefully
                }
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
        if (!expiryMinutes || isNaN(expiryMinutes) || expiryMinutes <= 0) return;
        
        const expiryTime = new Date().getTime() + (expiryMinutes * 60 * 1000);
        const timerDisplay = document.getElementById('session-timer');
        
        if (!timerDisplay) return;
        
        const timerInterval = setInterval(function() {
            const now = new Date().getTime();
            const distance = expiryTime - now;
            
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            if (timerDisplay) { // Check again in case it was removed
                timerDisplay.innerHTML = minutes + "m " + seconds + "s";
            }
            
            if (distance < 0) {
                clearInterval(timerInterval);
                if (timerDisplay) {
                    timerDisplay.innerHTML = "Session expired";
                }
                // Consider a more graceful redirect or modal
                window.location.href = '/auth/logout'; // Redirect to logout to clear server session too
            } else if (distance < 300000) { // 5 minutes
                if (timerDisplay) {
                    timerDisplay.classList.add('text-danger');
                }
            }
        }, 1000);
    }
    
    // Start session timer if the element exists
    const sessionTimeoutElement = document.getElementById('session-timeout'); // Renamed variable
    if (sessionTimeoutElement) {
        startSessionTimer(parseInt(sessionTimeoutElement.value, 10)); // Add radix 10
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
                
                const icon = this.querySelector('i');
                if (icon) {
                    icon.classList.toggle('fa-eye');
                    icon.classList.toggle('fa-eye-slash');
                }
            }
        });
    });

}); // End of $(document).ready()