class XeroxManager {
    constructor() {
        this.professors = [];
        this.currentMonth = 'agosto';
        this.currentEditingId = null;
        this.githubConfig = {
            token: localStorage.getItem('github_token'),
            repo: localStorage.getItem('github_repo')
        };
        this.isLoggedIn = localStorage.getItem('xerox_logged_in') === 'true';
        this.init();
    }

    init() {
        this.setupLoginListeners();
        this.checkAuthStatus();
        
        if (this.isLoggedIn) {
            this.showMainApp();
            this.loadData();
            this.setupEventListeners();
            this.populateDefaultData();
            this.updateDisplay();
            this.checkSyncConfig();
            this.autoSync();
        } else {
            this.showLoginScreen();
        }
    }

    setupEventListeners() {
        // Month selector
        document.getElementById('month').addEventListener('change', (e) => {
            this.currentMonth = e.target.value;
            this.loadData();
            this.updateDisplay();
        });

        // Add professor button
        document.getElementById('addProfessor').addEventListener('click', () => {
            this.openModal();
        });

        // Export/Import buttons
        document.getElementById('exportData').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('importBtn').addEventListener('click', () => {
            document.getElementById('importData').click();
        });

        document.getElementById('importData').addEventListener('change', (e) => {
            this.importData(e);
        });

        // Sync and config buttons
        document.getElementById('syncBtn').addEventListener('click', () => {
            this.syncData();
        });

        document.getElementById('configBtn').addEventListener('click', () => {
            this.openConfigModal();
        });

        // Config modal events
        document.querySelector('.close-config').addEventListener('click', () => {
            this.closeConfigModal();
        });

        document.getElementById('cancelConfig').addEventListener('click', () => {
            this.closeConfigModal();
        });

        document.getElementById('saveConfig').addEventListener('click', () => {
            this.saveGithubConfig();
        });

        document.getElementById('testConnection').addEventListener('click', () => {
            this.testGithubConnection();
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Modal events
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('professorForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProfessor();
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('professorModal');
            const configModal = document.getElementById('configModal');
            if (e.target === modal) {
                this.closeModal();
            }
            if (e.target === configModal) {
                this.closeConfigModal();
            }
        });
    }

    populateDefaultData() {
        const storageKey = `xerox_data_${this.currentMonth}`;
        const existingData = localStorage.getItem(storageKey);
        
        if (!existingData && this.currentMonth === 'agosto') {
            const defaultProfessors = [
                { name: 'Ana Claudia Ruiz', discipline: 'Inglês', quota: 400, used: 0, discount: 0 },
                { name: 'Anselmo Provazi', discipline: 'Ed. Física', quota: 400, used: 0, discount: 0 },
                { name: 'Alessandra Bonato', discipline: 'Matemática', quota: 400, used: 0, discount: 0 },
                { name: 'Bruno Fonseca', discipline: 'História', quota: 400, used: 0, discount: 0 },
                { name: 'Claudia Cilene', discipline: 'Matemática', quota: 400, used: 0, discount: 0 },
                { name: 'Cristina Ap.Canassa', discipline: 'Matemática', quota: 400, used: 0, discount: 0 },
                { name: 'Iléia Ribeiro', discipline: 'Ciência', quota: 400, used: 0, discount: 0 },
                { name: 'Lara Cristina', discipline: 'Ciência', quota: 400, used: 0, discount: 0 },
                { name: 'Rosana Barbosa', discipline: 'Língua Portuguesa', quota: 400, used: 0, discount: 0 },
                { name: 'Rosana Barbosa', discipline: 'Assistente Peb II', quota: 200, used: 0, discount: 0 },
                { name: 'Murilo Alexandre', discipline: 'Língua Portuguesa', quota: 400, used: 0, discount: 0 },
                { name: 'Sandra Cristina Lima', discipline: 'Língua Portuguesa', quota: 400, used: 0, discount: 0 },
                { name: 'Márcia Pinheiro', discipline: 'História', quota: 400, used: 0, discount: 0 },
                { name: 'Natalia Carvalho', discipline: 'Adjunta / Prof de Orientação', quota: 400, used: 0, discount: 0 },
                { name: 'Natalia Mariano', discipline: 'Ed. Física', quota: 150, used: 0, discount: 0 },
                { name: 'Neusa Cristina', discipline: 'Inglês', quota: 400, used: 0, discount: 0 },
                { name: 'Maria Ferreira', discipline: 'Geografia', quota: 400, used: 0, discount: 0 },
                { name: 'João Morita', discipline: 'Geografia', quota: 400, used: 0, discount: 0 },
                { name: 'Quinha', discipline: 'Matemática', quota: 400, used: 0, discount: 0 },
                { name: 'Eva Moreira', discipline: 'Língua Portuguesa', quota: 400, used: 0, discount: 0 },
                { name: 'Renata Paulo', discipline: 'Arte', quota: 400, used: 0, discount: 0 },
                { name: 'Edna Marli', discipline: 'Assistente Peb II', quota: 200, used: 0, discount: 0 },
                { name: 'Maristela Salata', discipline: 'Espanhol', quota: 400, used: 0, discount: 0 },
                { name: 'Mirian Alves', discipline: 'Arte', quota: 200, used: 0, discount: 0 }
            ];

            this.professors = defaultProfessors.map((prof, index) => ({
                ...prof,
                id: Date.now() + index
            }));

            this.saveData();
        }
    }

    loadData() {
        const storageKey = `xerox_data_${this.currentMonth}`;
        const data = localStorage.getItem(storageKey);
        this.professors = data ? JSON.parse(data) : [];
    }

    saveData() {
        const storageKey = `xerox_data_${this.currentMonth}`;
        localStorage.setItem(storageKey, JSON.stringify(this.professors));
    }

    updateDisplay() {
        this.updateTable();
        this.updateSummary();
    }

    updateTable() {
        const tbody = document.getElementById('professorsBody');
        tbody.innerHTML = '';

        this.professors.forEach(professor => {
            const row = document.createElement('tr');
            const remaining = professor.quota - professor.used;
            const usagePercent = professor.quota > 0 ? (professor.used / professor.quota) * 100 : 0;
            
            let progressClass = '';
            if (usagePercent >= 80) progressClass = 'high';
            else if (usagePercent >= 60) progressClass = 'medium';

            row.innerHTML = `
                <td><strong>${professor.name}</strong></td>
                <td>${this.getDisciplineEmoji(professor.discipline)} ${professor.discipline}</td>
                <td><strong>${professor.quota}</strong></td>
                <td>
                    <input type="number" class="usage-input" 
                           value="${professor.used}" 
                           min="0" 
                           max="${professor.quota}"
                           onchange="xeroxManager.updateUsage(${professor.id}, this.value)">
                    <div class="progress-bar">
                        <div class="progress-fill ${progressClass}" style="width: ${usagePercent}%"></div>
                    </div>
                </td>
                <td><strong style="color: ${remaining < 0 ? '#ff6b6b' : '#28a745'}">${remaining}</strong></td>
                <td>${professor.discount}%</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-secondary" onclick="xeroxManager.editProfessor(${professor.id})" style="padding: 6px 10px; font-size: 0.8rem;">✏️</button>
                        <button class="btn-danger" onclick="xeroxManager.deleteProfessor(${professor.id})">🗑️</button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updateSummary() {
        const totalProfessors = this.professors.length;
        const totalCopies = this.professors.reduce((sum, prof) => sum + prof.quota, 0);
        const usedCopies = this.professors.reduce((sum, prof) => sum + prof.used, 0);
        const remainingCopies = totalCopies - usedCopies;

        document.getElementById('totalProfessors').textContent = totalProfessors;
        document.getElementById('totalCopies').textContent = totalCopies.toLocaleString();
        document.getElementById('usedCopies').textContent = usedCopies.toLocaleString();
        document.getElementById('remainingCopies').textContent = remainingCopies.toLocaleString();
    }

    getDisciplineEmoji(discipline) {
        const emojis = {
            'Inglês': '🇬🇧',
            'Ed. Física': '🏃‍♂️',
            'Matemática': '🔢',
            'História': '📜',
            'Ciência': '🔬',
            'Língua Portuguesa': '📝',
            'Geografia': '🌍',
            'Arte': '🎨',
            'Espanhol': '🇪🇸',
            'Adjunta / Prof de Orientação': '👩‍💼',
            'Assistente Peb II': '👩‍🏫'
        };
        return emojis[discipline] || '📚';
    }

    openModal(professor = null) {
        const modal = document.getElementById('professorModal');
        const form = document.getElementById('professorForm');
        const title = document.getElementById('modalTitle');

        if (professor) {
            title.textContent = '✏️ Editar Professor';
            document.getElementById('professorName').value = professor.name;
            document.getElementById('discipline').value = professor.discipline;
            document.getElementById('quota').value = professor.quota;
            document.getElementById('used').value = professor.used;
            document.getElementById('discount').value = professor.discount;
            this.currentEditingId = professor.id;
        } else {
            title.textContent = '➕ Adicionar Professor';
            form.reset();
            document.getElementById('quota').value = 400;
            document.getElementById('used').value = 0;
            document.getElementById('discount').value = 0;
            this.currentEditingId = null;
        }

        modal.style.display = 'block';
    }

    closeModal() {
        document.getElementById('professorModal').style.display = 'none';
        this.currentEditingId = null;
    }

    saveProfessor() {
        const name = document.getElementById('professorName').value.trim();
        const discipline = document.getElementById('discipline').value;
        const quota = parseInt(document.getElementById('quota').value);
        const used = parseInt(document.getElementById('used').value);
        const discount = parseFloat(document.getElementById('discount').value);

        if (!name) {
            alert('⚠️ Por favor, preencha o nome do professor');
            return;
        }

        const professorData = {
            name,
            discipline,
            quota,
            used,
            discount
        };

        if (this.currentEditingId) {
            // Edit existing professor
            const index = this.professors.findIndex(p => p.id === this.currentEditingId);
            if (index !== -1) {
                this.professors[index] = { ...professorData, id: this.currentEditingId };
            }
        } else {
            // Add new professor
            professorData.id = Date.now();
            this.professors.push(professorData);
        }

        this.saveData();
        this.updateDisplay();
        this.closeModal();
    }

    editProfessor(id) {
        const professor = this.professors.find(p => p.id === id);
        if (professor) {
            this.openModal(professor);
        }
    }

    deleteProfessor(id) {
        if (confirm('🗑️ Tem certeza que deseja excluir este professor?')) {
            this.professors = this.professors.filter(p => p.id !== id);
            this.saveData();
            this.updateDisplay();
        }
    }

    updateUsage(id, newUsage) {
        const professor = this.professors.find(p => p.id === id);
        if (professor) {
            professor.used = Math.max(0, parseInt(newUsage) || 0);
            if (professor.used > professor.quota) {
                professor.used = professor.quota;
            }
            this.saveData();
            this.updateDisplay();
        }
    }

    exportData() {
        const totalCopies = this.professors.reduce((sum, prof) => sum + prof.quota, 0);
        const usedCopies = this.professors.reduce((sum, prof) => sum + prof.used, 0);
        const remainingCopies = totalCopies - usedCopies;
        const currentDate = new Date().toLocaleDateString('pt-BR');
        
        // Create PDF content
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text('📋 COTAS PARA XEROX', 105, 20, { align: 'center' });
        
        doc.setFontSize(14);
        doc.setFont(undefined, 'normal');
        doc.text(`Mês: ${this.currentMonth.toUpperCase()}`, 105, 30, { align: 'center' });
        doc.text(`Data: ${currentDate}`, 105, 40, { align: 'center' });
        
        // Summary
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('RESUMO:', 20, 55);
        doc.setFont(undefined, 'normal');
        doc.text(`Total de Professores: ${this.professors.length}`, 20, 65);
        doc.text(`Total de Cópias: ${totalCopies.toLocaleString()}`, 20, 75);
        doc.text(`Cópias Usadas: ${usedCopies.toLocaleString()}`, 20, 85);
        doc.text(`Cópias Restantes: ${remainingCopies.toLocaleString()}`, 20, 95);
        
        // Table header
        let yPosition = 115;
        doc.setFont(undefined, 'bold');
        doc.text('PROFESSOR(A)', 20, yPosition);
        doc.text('DISCIPLINA', 80, yPosition);
        doc.text('COTA', 130, yPosition);
        doc.text('USADO', 150, yPosition);
        doc.text('RESTANTE', 170, yPosition);
        
        // Draw line under header
        doc.line(20, yPosition + 2, 190, yPosition + 2);
        
        // Table content
        yPosition += 10;
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        
        this.professors.forEach((professor, index) => {
            if (yPosition > 270) { // New page if needed
                doc.addPage();
                yPosition = 20;
            }
            
            const remaining = professor.quota - professor.used;
            
            doc.text(professor.name, 20, yPosition);
            doc.text(professor.discipline, 80, yPosition);
            doc.text(professor.quota.toString(), 130, yPosition);
            doc.text(professor.used.toString(), 150, yPosition);
            doc.text(remaining.toString(), 170, yPosition);
            
            yPosition += 8;
        });
        
        // Save PDF
        const fileName = `xerox_cotas_${this.currentMonth}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        
        alert('📄 PDF exportado com sucesso!');
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.professors && Array.isArray(data.professors)) {
                    if (confirm(`📁 Importar dados do mês ${data.month || 'desconhecido'}?\n\nIsso substituirá os dados atuais.`)) {
                        this.professors = data.professors.map(prof => ({
                            ...prof,
                            id: prof.id || Date.now() + Math.random()
                        }));
                        
                        if (data.month) {
                            this.currentMonth = data.month;
                            document.getElementById('month').value = data.month;
                        }
                        
                        this.saveData();
                        this.updateDisplay();
                        alert('✅ Dados importados com sucesso!');
                    }
                } else {
                    alert('❌ Arquivo inválido. Por favor, selecione um arquivo de exportação válido.');
                }
            } catch (error) {
                alert('❌ Erro ao ler o arquivo. Verifique se é um arquivo JSON válido.');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);
        
        // Reset file input
        event.target.value = '';
    }

    // GitHub Sync Functions
    checkSyncConfig() {
        const status = document.getElementById('syncStatus');
        if (this.githubConfig.token && this.githubConfig.repo) {
            status.textContent = '✅ Configurado';
            status.style.color = '#28a745';
        } else {
            status.textContent = '❌ Não configurado';
            status.style.color = '#dc3545';
        }
    }

    openConfigModal() {
        const modal = document.getElementById('configModal');
        document.getElementById('githubToken').value = this.githubConfig.token || '';
        document.getElementById('githubRepo').value = this.githubConfig.repo || '';
        modal.style.display = 'block';
        this.checkSyncConfig();
    }

    closeConfigModal() {
        document.getElementById('configModal').style.display = 'none';
    }

    async saveGithubConfig() {
        const token = document.getElementById('githubToken').value.trim();
        const repo = document.getElementById('githubRepo').value.trim();

        if (!token || !repo) {
            alert('⚠️ Por favor, preencha todos os campos');
            return;
        }

        this.githubConfig.token = token;
        this.githubConfig.repo = repo;

        localStorage.setItem('github_token', token);
        localStorage.setItem('github_repo', repo);

        this.checkSyncConfig();
        alert('✅ Configuração salva com sucesso!');
    }

    async testGithubConnection() {
        if (!this.githubConfig.token || !this.githubConfig.repo) {
            alert('⚠️ Configure primeiro o token e repositório');
            return;
        }

        try {
            const response = await fetch(`https://api.github.com/repos/${this.githubConfig.repo}`, {
                headers: {
                    'Authorization': `token ${this.githubConfig.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (response.ok) {
                alert('✅ Conexão com GitHub estabelecida com sucesso!');
            } else {
                alert('❌ Erro na conexão. Verifique o token e repositório.');
            }
        } catch (error) {
            alert('❌ Erro de conexão: ' + error.message);
        }
    }

    async syncData() {
        if (!this.githubConfig.token || !this.githubConfig.repo) {
            alert('⚠️ Configure primeiro a sincronização no botão ⚙️');
            return;
        }

        try {
            // Try to download first (in case there are updates from other devices)
            await this.downloadFromGithub();
            
            // Then upload current data
            await this.uploadToGithub();
            
            alert('✅ Dados sincronizados com sucesso!');
        } catch (error) {
            console.error('Sync error:', error);
            alert('❌ Erro na sincronização: ' + error.message);
        }
    }

    async downloadFromGithub() {
        const fileName = `xerox_data_${this.currentMonth}.json`;
        
        try {
            const response = await fetch(`https://api.github.com/repos/${this.githubConfig.repo}/contents/${fileName}`, {
                headers: {
                    'Authorization': `token ${this.githubConfig.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const content = JSON.parse(atob(data.content));
                
                // Check if remote data is newer
                const localData = JSON.parse(localStorage.getItem(`xerox_data_${this.currentMonth}`) || '[]');
                const remoteTimestamp = new Date(content.lastModified || 0);
                const localTimestamp = new Date(localStorage.getItem(`xerox_data_${this.currentMonth}_timestamp`) || 0);
                
                if (remoteTimestamp > localTimestamp) {
                    this.professors = content.professors || [];
                    this.saveData();
                    this.updateDisplay();
                    console.log('📥 Dados baixados do GitHub');
                }
            }
        } catch (error) {
            // File might not exist yet, which is okay
            console.log('No remote data found, will create new file');
        }
    }

    async uploadToGithub() {
        const fileName = `xerox_data_${this.currentMonth}.json`;
        const data = {
            professors: this.professors,
            month: this.currentMonth,
            lastModified: new Date().toISOString(),
            totalCopies: this.professors.reduce((sum, prof) => sum + prof.quota, 0),
            usedCopies: this.professors.reduce((sum, prof) => sum + prof.used, 0)
        };

        const content = btoa(JSON.stringify(data, null, 2));

        try {
            // First, try to get the file to get its SHA (for updates)
            let sha = null;
            try {
                const getResponse = await fetch(`https://api.github.com/repos/${this.githubConfig.repo}/contents/${fileName}`, {
                    headers: {
                        'Authorization': `token ${this.githubConfig.token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                
                if (getResponse.ok) {
                    const existingFile = await getResponse.json();
                    sha = existingFile.sha;
                }
            } catch (e) {
                // File doesn't exist, will create new
            }

            // Upload/update the file
            const uploadData = {
                message: `📊 Atualizar dados de ${this.currentMonth} - ${new Date().toLocaleString('pt-BR')}`,
                content: content
            };

            if (sha) {
                uploadData.sha = sha;
            }

            const response = await fetch(`https://api.github.com/repos/${this.githubConfig.repo}/contents/${fileName}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.githubConfig.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(uploadData)
            });

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }

            // Save timestamp of successful upload
            localStorage.setItem(`xerox_data_${this.currentMonth}_timestamp`, new Date().toISOString());
            console.log('📤 Dados enviados para GitHub');

        } catch (error) {
            throw new Error(`Erro ao enviar para GitHub: ${error.message}`);
        }
    }

    async autoSync() {
        // Auto-sync on page load if configured
        if (this.githubConfig.token && this.githubConfig.repo) {
            try {
                await this.downloadFromGithub();
            } catch (error) {
                console.log('Auto-sync failed:', error.message);
            }
        }
    }

    // Override saveData to trigger auto-upload
    saveData() {
        const storageKey = `xerox_data_${this.currentMonth}`;
        localStorage.setItem(storageKey, JSON.stringify(this.professors));
        
        // Auto-upload after save if configured
        if (this.githubConfig.token && this.githubConfig.repo) {
            setTimeout(() => {
                this.uploadToGithub().catch(error => {
                    console.log('Auto-upload failed:', error.message);
                });
            }, 1000); // Delay to avoid too many requests
        }
    }

    // Authentication Functions
    setupLoginListeners() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
    }

    checkAuthStatus() {
        // Check if session expired (24 hours)
        const loginTime = localStorage.getItem('xerox_login_time');
        const now = Date.now();
        const dayInMs = 24 * 60 * 60 * 1000; // 24 hours

        if (loginTime && (now - parseInt(loginTime)) > dayInMs) {
            this.logout();
        }
    }

    handleLogin() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const errorDiv = document.getElementById('loginError');

        // Simple authentication - você pode mudar essas credenciais
        const validCredentials = {
            'admin': 'xerox2024',
            'central': 'senha123',
            'usuario': 'cotas456'
        };

        if (validCredentials[username] && validCredentials[username] === password) {
            // Login successful
            this.login(username);
        } else {
            // Login failed
            errorDiv.textContent = '❌ Usuário ou senha incorretos!';
            setTimeout(() => {
                errorDiv.textContent = '';
            }, 3000);
            
            // Clear password field
            document.getElementById('password').value = '';
        }
    }

    login(username) {
        this.isLoggedIn = true;
        localStorage.setItem('xerox_logged_in', 'true');
        localStorage.setItem('xerox_username', username);
        localStorage.setItem('xerox_login_time', Date.now().toString());
        
        this.showMainApp();
        
        // Initialize app components
        this.loadData();
        this.setupEventListeners();
        this.populateDefaultData();
        this.updateDisplay();
        this.checkSyncConfig();
        this.autoSync();
    }

    logout() {
        this.isLoggedIn = false;
        localStorage.removeItem('xerox_logged_in');
        localStorage.removeItem('xerox_username');
        localStorage.removeItem('xerox_login_time');
        
        this.showLoginScreen();
        
        // Clear form
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        document.getElementById('loginError').textContent = '';
    }

    showLoginScreen() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('mainApp').style.display = 'none';
    }

    showMainApp() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
    }
}

// Initialize the application
const xeroxManager = new XeroxManager();

// Make xeroxManager globally accessible for inline event handlers
window.xeroxManager = xeroxManager;