const API_BASE = 'http://localhost:3000/api/auth';

document.addEventListener('DOMContentLoaded', () => {

    // CPF Masking Only on Registration
    const regCpf = document.getElementById('regCpf');
    if (regCpf) {
        regCpf.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
            if (value.length > 11) value = value.slice(0, 11); // Max 11 digits

            // Format to 000.000.000-00
            if (value.length > 9) {
                value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
            } else if (value.length > 6) {
                value = value.replace(/(\d{3})(\d{3})(\d{3})/, "$1.$2.$3");
            } else if (value.length > 3) {
                value = value.replace(/(\d{3})(\d{3})/, "$1.$2");
            }
            e.target.value = value;
        });
    }

    // Only Letters for Name Form
    const regName = document.getElementById('regName');
    if (regName) {
        regName.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, '');
        });
    }

    // Common Loading Function UI
    function toggleLoading(btnId, spinnerId, isLoad, fallbackIdMessage) {
        const btn = document.getElementById(btnId);
        const spinner = document.getElementById(spinnerId);
        const txt = btn.querySelector('.btn-text');
        const msg = document.getElementById(fallbackIdMessage);

        btn.disabled = isLoad;
        txt.style.display = isLoad ? 'none' : 'inline-block';
        spinner.style.display = isLoad ? 'inline-block' : 'none';
        if (isLoad) {
            msg.className = 'form-message'; // clear previous alerts
        }
    }

    // [1] Handle Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            toggleLoading('submitLogBtn', 'btnLogSpinner', true, 'formLogMessage');

            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            try {
                const res = await fetch(`${API_BASE}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();
                const msgBox = document.getElementById('formLogMessage');

                if (res.ok) {
                    msgBox.textContent = "Login Aprovado! Redirecionando...";
                    msgBox.classList.add('msg-success');

                    // Save JWT and User Data
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userRole', data.role);
                    localStorage.setItem('userName', data.name);

                    setTimeout(() => {
                        if (data.role === 'admin' || data.role === 'recepcao') {
                            window.location.href = 'dashboard-admin.html';
                        } else {
                            window.location.href = 'dashboard-cliente.html';
                        }
                    }, 1000);

                } else {
                    msgBox.textContent = data.error || "Erro ao conectar com API.";
                    msgBox.classList.add('msg-error');
                    toggleLoading('submitLogBtn', 'btnLogSpinner', false, 'formLogMessage');
                }
            } catch (err) {
                document.getElementById('formLogMessage').textContent = "Servidor Offline.";
                document.getElementById('formLogMessage').classList.add('msg-error');
                toggleLoading('submitLogBtn', 'btnLogSpinner', false, 'formLogMessage');
            }
        });
    }

    // [2] Handle Database Registration
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            toggleLoading('submitRegBtn', 'btnRegSpinner', true, 'formRegMessage');

            const payload = {
                name: document.getElementById('regName').value.trim(),
                email: document.getElementById('regEmail').value,
                password: document.getElementById('regPassword').value,
                cpf: document.getElementById('regCpf').value.replace(/\D/g, '') // Send numeric to DB
            };

            if (payload.cpf.length !== 11) {
                const b = document.getElementById('formRegMessage');
                b.textContent = "Seu CPF é inválido.";
                b.classList.add('msg-error');
                toggleLoading('submitRegBtn', 'btnRegSpinner', false, 'formRegMessage');
                return;
            }

            try {
                const res = await fetch(`${API_BASE}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await res.json();
                const msgBox = document.getElementById('formRegMessage');

                if (res.ok) {
                    msgBox.textContent = data.message;
                    msgBox.classList.add('msg-success');

                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);

                } else {
                    msgBox.textContent = data.error || "Erro ao conectar.";
                    msgBox.classList.add('msg-error');
                    toggleLoading('submitRegBtn', 'btnRegSpinner', false, 'formRegMessage');
                }
            } catch (err) {
                document.getElementById('formRegMessage').textContent = "Servidor Offline.";
                document.getElementById('formRegMessage').classList.add('msg-error');
                toggleLoading('submitRegBtn', 'btnRegSpinner', false, 'formRegMessage');
            }
        });
    }

    // [3] Mock Recover API
    const recoverForm = document.getElementById('recoverForm');
    if (recoverForm) {
        recoverForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            toggleLoading('submitRecBtn', 'btnRecSpinner', true, 'formRecMessage');

            try {
                const res = await fetch(`${API_BASE}/recover`, { method: 'POST' });
                const data = await res.json();

                const msgBox = document.getElementById('formRecMessage');
                msgBox.textContent = data.message;
                msgBox.classList.add('msg-success');

            } catch (err) {
                document.getElementById('formRecMessage').textContent = "Servidor Offline.";
                document.getElementById('formRecMessage').classList.add('msg-error');
            }
            toggleLoading('submitRecBtn', 'btnRecSpinner', false, 'formRecMessage');
        });
    }
});
