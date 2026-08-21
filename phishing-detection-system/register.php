<?php
require_once 'includes/functions.php';
if (isLoggedIn()) redirect('');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register - PhishGuard AI</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <style>
        .auth-box { max-width: 400px; margin: 5rem auto; }
        .auth-header { text-align: center; margin-bottom: 2rem; }
        .auth-header h1 { color: var(--primary); margin-bottom: 0.5rem; }
        .auth-header p { color: var(--text-light); }
        .error-msg { background: #fee2e2; color: #991b1b; padding: 0.75rem; border-radius: 8px; margin-bottom: 1rem; display: none; }
        .success-msg { background: #dcfce7; color: #166534; padding: 0.75rem; border-radius: 8px; margin-bottom: 1rem; }
    </style>
</head>
<body>
    <div class="background-shell">
        <canvas id="bg-particles"></canvas>
        <div class="signal-ring ring-1"></div>
        <div class="signal-ring ring-2"></div>
        <div class="glow-orb orb-1"></div>
        <div class="glow-orb orb-2"></div>
        <div class="grid-overlay"></div>
    </div>
    <div class="page-shell">
    <nav class="navbar">
        <a href="index.php" class="navbar-brand">PhishGuard AI</a>
        <div class="nav-links">
            <a href="index.php">Home</a>
            <a href="login.php">Login</a>
        </div>
    </nav>
    <div class="container auth-box">
        <div class="auth-header">
            <h1>Register</h1>
            <p>Create your account to start detecting phishing attacks.</p>
        </div>
        
        <div class="card">
            <div id="errorMsg" class="error-msg"></div>
            <div id="successMsg" class="success-msg" style="display:none;"></div>
            
            <form id="registerForm">
                <input type="hidden" name="action" value="register">
                
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" name="username" required placeholder="Choose a username">
                </div>
                
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" required placeholder="your@email.com">
                </div>
                
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" name="password" required minlength="6" placeholder="Min 6 characters">
                </div>
                
                <button type="submit" class="btn btn-primary btn-block" id="registerBtn">
                    <span class="spinner" style="display:none;border-color:transparent;border-top-color:white;"></span>
                    Create Account
                </button>
            </form>
            
            <div class="auth-links" style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border);">
                Already have an account? <a href="login.php"><strong>Login here</strong></a>
                <br>
                <a href="index.php" style="color: var(--primary);">Return to Home</a>
            </div>
        </div>
    </div>
    </div>
    <script src="assets/js/app.js"></script>
    <script>
        document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btn = document.getElementById('registerBtn');
            const spinner = btn.querySelector('.spinner');
            const errorDiv = document.getElementById('errorMsg');
            const successDiv = document.getElementById('successMsg');
            
            btn.disabled = true;
            spinner.style.display = 'inline-block';
            errorDiv.style.display = 'none';
            successDiv.style.display = 'none';
            
            try {
                const formData = new FormData(e.target);
                const response = await fetch('api/auth.php', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                
                if (data.success) {
                    successDiv.textContent = 'Registration successful! Redirecting to login...';
                    successDiv.style.display = 'block';
                    setTimeout(() => {
                        window.location.href = 'login.php?registered=1';
                    }, 1500);
                } else {
                    errorDiv.textContent = data.message || 'Registration failed';
                    errorDiv.style.display = 'block';
                }
            } catch (err) {
                errorDiv.textContent = 'Network error. Please try again.';
                errorDiv.style.display = 'block';
            } finally {
                btn.disabled = false;
                spinner.style.display = 'none';
            }
        });
    </script>
</body>
</html>