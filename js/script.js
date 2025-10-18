document.addEventListener('DOMContentLoaded', () => {
    // --- 1. INISIALISASI ELEMEN DOM ---
    const todoForm = document.getElementById('todo-form');
    const taskInput = document.getElementById('task-input');
    const deadlineInput = document.getElementById('deadline-input');
    const todoList = document.getElementById('todo-list');
    const errorMessage = document.getElementById('error-message');
    const searchInput = document.getElementById('search-input');
    const filterStatus = document.getElementById('filter-status');
    const deleteAllButton = document.getElementById('delete-all-button');

    // Inisialisasi array tugas dari Local Storage atau array kosong
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Fungsi untuk menyimpan tugas ke Local Storage
    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    // Fungsi untuk menampilkan pesan error
    const displayError = (message) => {
        errorMessage.textContent = message;
        setTimeout(() => {
            errorMessage.textContent = ''; 
        }, 3000);
    };

    // --- 2. FUNGSI VALIDASI INPUT ---
    const validateInput = (task, deadline) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        
        if (!task.trim()) {
            displayError('Nama tugas tidak boleh kosong!');
            return false;
        }

        if (!deadline) {
            displayError('Deadline harus diisi!');
            return false;
        }

        const selectedDate = new Date(deadline);
        
        if (selectedDate < today) {
            displayError('Tanggal deadline tidak boleh di masa lalu!');
            return false;
        }

        return true;
    };


    // --- 3. FUNGSI RENDER TUGAS ---
    const renderTasks = (taskList = tasks) => {
        todoList.innerHTML = ''; 

        if (taskList.length === 0) {
            todoList.innerHTML = '<tr><td colspan="4" class="no-task">Tidak ada tugas ditemukan.</td></tr>';
            return;
        }

        taskList.forEach(task => {
            const row = todoList.insertRow();
            row.className = task.completed ? 'completed-row' : 'pending-row';

            // Kolom Tugas
            const taskCell = row.insertCell(0);
            taskCell.textContent = task.name;
            taskCell.className = task.completed ? 'completed' : '';

            // Kolom Deadline (Format Tampilan)
            const deadlineCell = row.insertCell(1);
            // Format tanggal agar lebih mudah dibaca (misal: 17/10/2025)
            const formattedDate = new Date(task.deadline).toLocaleDateString('id-ID'); 
            deadlineCell.textContent = formattedDate;

            // Kolom Status (Centang)
            const statusCell = row.insertCell(2);
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'status-checkbox';
            checkbox.checked = task.completed;
            checkbox.dataset.id = task.id; 
            
            checkbox.addEventListener('change', toggleTaskStatus);
            statusCell.appendChild(checkbox);

            // Kolom Aksi (Hapus)
            const actionsCell = row.insertCell(3);
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Hapus';
            deleteBtn.className = 'btn btn-action';
            deleteBtn.dataset.id = task.id; 
            
            deleteBtn.addEventListener('click', deleteTask);
            actionsCell.appendChild(deleteBtn);
        });
    };

    // --- 4. FUNGSI TAMBAH TUGAS ---
    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const task = taskInput.value.trim();
        const deadline = deadlineInput.value;

        if (validateInput(task, deadline)) {
            const newTask = {
                id: Date.now(), 
                name: task,
                deadline: deadline,
                completed: false
            };

            tasks.push(newTask);
            saveTasks();
            renderTasks();

            // Reset form
            taskInput.value = '';
            deadlineInput.value = '';
        }
    });

    // --- 5. FUNGSI HAPUS TUGAS SATUAN ---
    const deleteTask = (e) => {
        const taskId = parseInt(e.target.dataset.id);
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        applyFiltersAndSearch(); 
    };

    // --- 6. FUNGSI UBAH STATUS TUGAS ---
    const toggleTaskStatus = (e) => {
        const taskId = parseInt(e.target.dataset.id);
        const taskIndex = tasks.findIndex(task => task.id === taskId);

        if (taskIndex > -1) {
            tasks[taskIndex].completed = e.target.checked;
            saveTasks();
            applyFiltersAndSearch(); 
        }
    };

    // --- 7. FUNGSI HAPUS SEMUA TUGAS ---
    deleteAllButton.addEventListener('click', () => {
        if (confirm('Yakin ingin menghapus SEMUA tugas? Aksi ini tidak bisa dibatalkan!')) {
            tasks = [];
            saveTasks();
            renderTasks();
        }
    });

    // --- 8. FUNGSI FILTER & PENCARIAN ---
    const applyFiltersAndSearch = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const statusFilter = filterStatus.value;
        
        let filteredTasks = tasks;

        // Filter Status
        if (statusFilter !== 'all') {
            filteredTasks = filteredTasks.filter(task => 
                statusFilter === 'completed' ? task.completed : !task.completed
            );
        }

        // Filter/Cari Berdasarkan Kata Kunci
        if (searchTerm) {
            filteredTasks = filteredTasks.filter(task => 
                task.name.toLowerCase().includes(searchTerm)
            );
        }
        
        renderTasks(filteredTasks);
    };

    // Event Listeners untuk Filter
    searchInput.addEventListener('keyup', applyFiltersAndSearch);
    filterStatus.addEventListener('change', applyFiltersAndSearch);

    // Render tugas saat halaman dimuat
    renderTasks();
});