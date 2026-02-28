const API_BASE = 'http://localhost:3000/api/appointments';

document.addEventListener('DOMContentLoaded', async () => {

    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');

    // Segurança: Redireciona se não for Cargo Superior (Admin)
    if (!token || (role !== 'admin' && role !== 'recepcao')) {
        window.location.href = 'login.html';
        return;
    }

    // Logout Específico
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.clear();
        window.location.href = 'index.html';
    });

    // Puxando TODA a agenda do Banco de Dados
    async function fetchAllAppointments() {
        const listDiv = document.getElementById('adminAppointmentsList');
        try {
            const res = await fetch(`${API_BASE}/all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const pts = await res.json();

            if (!res.ok) {
                listDiv.innerHTML = `<p style="color:var(--text-muted)">Acesso Administrativo não validado ou expirado.</p>`;
                return;
            }

            if (pts.length === 0) {
                listDiv.innerHTML = `<p style="color:var(--text-muted)">Não existem agendamentos no sistema atualmente.</p>`;
                return;
            }

            listDiv.innerHTML = pts.map(apt => `
                <div class="apt-card">
                    <div>
                        <h4 style="margin-bottom: 0.3rem;">Paciente: <span style="color:var(--primary-dark)">${apt.clientName || 'Desconhecido'}</span></h4>
                        <p style="color: var(--text-muted); font-size: 0.95rem;">📅 Agendamento: <strong>${apt.date}</strong> às <strong>${apt.time}</strong></p>
                        <p style="font-size: 0.9rem; margin-top: 0.4rem;">🩺 Serviço: <strong>${apt.service}</strong> | <span style="color: #64748b;">(Status: ${apt.status})</span></p>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            listDiv.innerHTML = `<p style="color:var(--text-muted)">Falha crítica de Conexão com o Banco de Dados.</p>`;
        }
    }

    fetchAllAppointments();
});
