document.addEventListener('DOMContentLoaded', () => {
    const authContainer = document.getElementById('auth-container');
    const adminPanel = document.getElementById('admin-panel');
    const passwordInput = document.getElementById('password-input');
    const submitPasswordBtn = document.getElementById('submit-password');
    const authError = document.getElementById('auth-error');

    const tablesList = document.getElementById('tables-list');
    const currentTableName = document.getElementById('current-table-name');
    const tableContent = document.getElementById('table-content');

    let authToken = '';

    const handleAuth = async () => {
        const password = passwordInput.value;
        if (!password) {
            authError.textContent = 'Password is required.';
            return;
        }

        authToken = password; // Using the password directly as a bearer token

        try {
            const response = await fetch('/api/admin/tables', {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (response.ok) {
                authContainer.style.display = 'none';
                adminPanel.style.display = 'flex';
                const { tables } = await response.json();
                displayTables(tables);
            } else {
                authError.textContent = 'Authentication failed. Please check the password.';
            }
        } catch (error) {
            authError.textContent = 'An error occurred. Please try again.';
        }
    };

    const displayTables = (tables) => {
        tablesList.innerHTML = '';
        tables.forEach(tableName => {
            const li = document.createElement('li');
            li.textContent = tableName;
            li.dataset.tableName = tableName;
            li.addEventListener('click', () => {
                document.querySelectorAll('#tables-list li').forEach(item => item.classList.remove('active'));
                li.classList.add('active');
                fetchTableContent(tableName);
            });
            tablesList.appendChild(li);
        });
    };

    const fetchTableContent = async (tableName) => {
        currentTableName.textContent = `Content of: ${tableName}`;
        tableContent.innerHTML = '<p>Loading...</p>';

        try {
            const response = await fetch(`/api/admin/tables/${tableName}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (response.ok) {
                const { content } = await response.json();
                renderTable(content);
            } else {
                tableContent.innerHTML = '<p class="error-message">Failed to load table content.</p>';
            }
        } catch (error) {
            tableContent.innerHTML = '<p class="error-message">An error occurred while fetching data.</p>';
        }
    };

    const renderTable = (data) => {
        if (!data || data.length === 0) {
            tableContent.innerHTML = '<p>No data in this table.</p>';
            return;
        }

        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');
        const headerRow = document.createElement('tr');

        // Create headers
        Object.keys(data[0]).forEach(key => {
            const th = document.createElement('th');
            th.textContent = key;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

        // Create rows
        data.forEach(rowData => {
            const row = document.createElement('tr');
            Object.values(rowData).forEach(value => {
                const td = document.createElement('td');
                td.textContent = value;
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });

        table.appendChild(thead);
        table.appendChild(tbody);
        tableContent.innerHTML = '';
        tableContent.appendChild(table);
    };

    submitPasswordBtn.addEventListener('click', handleAuth);
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAuth();
        }
    });
});
