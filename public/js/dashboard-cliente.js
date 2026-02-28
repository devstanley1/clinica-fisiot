const API_BASE = 'http://localhost:3000/api/appointments';

document.addEventListener('DOMContentLoaded', async () => {

    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');

    // Segurança: Redireciona se não houver Token ou for o Papel Errado
    if (!token || role === 'admin' || role === 'recepcao') {
        window.location.href = 'login.html';
        return;
    }

    // Saudações
    const userName = localStorage.getItem('userName');
    if (userName) document.getElementById('clientNameDisplay').textContent = userName;

    // Logout Genérico
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.clear();
        window.location.href = 'index.html';
    });

    // Puxando o histórico assíncrono do Banco de Dados
    async function fetchMyAppointments() {
        const listDiv = document.getElementById('appointmentsList');
        try {
            const res = await fetch(`${API_BASE}/my`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const pts = await res.json();

            if (!res.ok) {
                listDiv.innerHTML = `<p style="color:var(--text-muted)">Falha na autenticação. Por favor, faça login novamente.</p>`;
                return;
            }

            if (pts.length === 0) {
                listDiv.innerHTML = `<p style="color:var(--text-muted)">Você não possui nenhum agendamento histórico.</p>`;
                return;
            }

            // Gerando Cards HTML com os dados do Banco SQLite
            listDiv.innerHTML = pts.map(apt => `
                <div class="apt-card">
                    <div>
                        <h4 style="margin-bottom: 0.3rem; color: var(--primary-dark)">Consulta: ${apt.service}</h4>
                        <p style="color: var(--text-muted); font-size: 0.95rem;">📅 Dia: <strong>${apt.date}</strong> às <strong>${apt.time}</strong></p>
                        <span style="font-size: 0.85rem; color: #166534; background: #dcfce7; padding: 0.2rem 0.6rem; border-radius: 4px;">Status: ${apt.status}</span>
                    </div>
                    <button class="btn-danger" onclick="cancelApt(${apt.id})">Cancelar Consulta</button>
                </div>
            `).join('');

        } catch (error) {
            listDiv.innerHTML = `<p style="color:var(--text-muted)">Falha crítica de Conexão com o Servidor.</p>`;
        }
    }

    // Variável Window para poder ser chamada no onclick do HTML renderizado
    window.cancelApt = async (id) => {
        if (!confirm("Tem certeza que deseja cancelar esta consulta? Essa ação é vitalícia.")) return;

        try {
            const res = await fetch(`${API_BASE}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                alert("Consulta cancelada e apagada.");
                fetchMyAppointments(); // Refresh automático
            } else {
                alert("Erro ao excluir. Tente novamente.");
            }
        } catch (error) {
            alert("Falha de conexão.");
        }
    };

    fetchMyAppointments();
});
