document.addEventListener('DOMContentLoaded', () => {
    const showDbBtn = document.getElementById('show-db-btn');
    const adminContentWrapper = document.getElementById('admin-content-wrapper');
    const passwordInput = document.getElementById('admin-password-input');
    const submitPasswordBtn = document.getElementById('submit-admin-password');
    const authError = document.getElementById('admin-auth-error');
    const dbViewerContent = document.getElementById('db-viewer-content');

    let authToken = '';

    if (showDbBtn) {
        showDbBtn.addEventListener('click', () => {
            const isVisible = adminContentWrapper.style.display === 'block';
            adminContentWrapper.style.display = isVisible ? 'none' : 'block';
        });
    }

    const handleAuth = async () => {
        const password = passwordInput.value;
        if (!password) {
            authError.textContent = 'Password is required.';
            return;
        }

        authToken = password;
        authError.textContent = '';

        try {
            const response = await fetch('/api/admin/tables', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (response.ok) {
                const { tables } = await response.json();
                displayTables(tables);
            } else {
                authError.textContent = 'Authentication failed.';
                dbViewerContent.innerHTML = '';
            }
        } catch (error) {
            authError.textContent = 'An error occurred.';
            dbViewerContent.innerHTML = '';
        }
    };

    const displayTables = (tables) => {
        const tablesList = document.createElement('ul');
        tablesList.style.listStyle = 'none';
        tablesList.style.padding = '0';

        tables.forEach(tableName => {
            const li = document.createElement('li');
            li.textContent = tableName;
            li.style.cursor = 'pointer';
            li.style.padding = '8px';
            li.style.borderBottom = '1px solid #eee';
            li.addEventListener('click', () => {
                document.querySelectorAll('#db-viewer-content ul li').forEach(item => item.style.backgroundColor = 'transparent');
                li.style.backgroundColor = '#e0e0e0';
                fetchTableContent(tableName);
            });
            tablesList.appendChild(li);
        });

        dbViewerContent.innerHTML = '';
        dbViewerContent.appendChild(tablesList);
    };

    const fetchTableContent = async (tableName) => {
        try {
            const response = await fetch(`/api/admin/tables/${tableName}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (response.ok) {
                const { content } = await response.json();
                renderTable(content, tableName);
            } else {
                alert('Failed to load table content.');
            }
        } catch (error) {
            alert('An error occurred while fetching data.');
        }
    };

    const renderTable = (data, tableName) => {
        let tableContainer = document.getElementById(`table-container-${tableName}`);
        if (!tableContainer) {
            tableContainer = document.createElement('div');
            tableContainer.id = `table-container-${tableName}`;
            dbViewerContent.appendChild(tableContainer);
        }

        if (!data || data.length === 0) {
            tableContainer.innerHTML = '<h3>No data in this table.</h3>';
            return;
        }

        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');
        const headerRow = document.createElement('tr');

        Object.keys(data[0]).forEach(key => {
            const th = document.createElement('th');
            th.textContent = key;
            th.style.border = '1px solid #ddd';
            th.style.padding = '8px';
            th.style.backgroundColor = '#f2f2f2';
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

        data.forEach(rowData => {
            const row = document.createElement('tr');
            Object.values(rowData).forEach(value => {
                const td = document.createElement('td');
                td.textContent = value;
                td.style.border = '1px solid #ddd';
                td.style.padding = '8px';
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });

        table.appendChild(thead);
        table.appendChild(tbody);
        tableContainer.innerHTML = `<h3>${tableName}</h3>`;
        tableContainer.appendChild(table);
    };

    if (submitPasswordBtn) {
        submitPasswordBtn.addEventListener('click', handleAuth);
    }
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleAuth();
        });
    }
});
