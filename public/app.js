document.addEventListener('DOMContentLoaded', () => {

    // Hamburger Menu Logic
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector("nav ul");

    if (hamburger) {
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navMenu.classList.toggle("active");
        });

        document.querySelectorAll("nav ul li a").forEach(n => n.addEventListener("click", () => {
            hamburger.classList.remove("active");
            navMenu.classList.remove("active");
        }));
    }

    // Name Input - Only Letters allowed (A-Z, á-ú, etc) Function
    const nameInput = document.getElementById('patientName');
    if (nameInput) {
        nameInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, '');
        });
    }

    // CPF Mask Function
    const cpfInput = document.getElementById('patientCpf');
    if (cpfInput) {
        cpfInput.addEventListener('input', (e) => {
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

    // Form submission
    const form = document.getElementById('appointmentForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Verificar se o usuário está logado usando nosso JWT e Role armazenados
            const token = localStorage.getItem('token');
            if (!token) {
                alert("Para garantir a segurança do seu Agendamento, você precisa criar uma continha rápida primeiro ou Entrar!");
                window.location.href = 'login.html';
                return;
            }

            const getVal = id => document.getElementById(id).value;
            const spinner = document.getElementById('btnSpinner');
            const submitBtn = document.getElementById('submitBtn');
            const btnText = document.querySelector('.btn-text');

            submitBtn.disabled = true;
            spinner.style.display = 'inline-block';
            btnText.style.display = 'none';

            try {
                // Postando os agendamentos direto para nossa API em Node / SQLite (Seguro)
                const res = await fetch('http://localhost:3000/api/appointments', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        service: getVal('serviceType') || 'Consulta Geral',
                        date: getVal('date'),
                        time: getVal('time')
                    })
                });

                if (res.ok) {
                    alert('Consulta agendada no sistema com sucesso!');
                    form.reset();
                    // Redireciona pro Painel dele para ele checar
                    window.location.href = 'dashboard-cliente.html';
                } else {
                    const data = await res.json();
                    alert(data.error || 'Erro ao agendar consulta. Verifique as datas disponíveis.');
                }
            } catch (error) {
                alert('O Servidor da Clínica parece estar desligado no momento.');
            } finally {
                spinner.style.display = 'none';
                btnText.style.display = 'inline-block';
                submitBtn.disabled = false;
            }
        });
    }
});
