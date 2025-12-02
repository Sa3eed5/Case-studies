/**
 * Employee API Management System
 * API-driven application for comprehensive API testing
 * Requires authentication to access
 */

// Authentication check
function checkAuthentication() {
    const SESSION_KEY = 'employee_management_session';
    const session = localStorage.getItem(SESSION_KEY);
    
    if (!session) {
        window.location.href = 'login.html';
        return false;
    }
    
    try {
        const sessionData = JSON.parse(session);
        const now = new Date().getTime();
        const sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
        
        if (!sessionData.timestamp || (now - sessionData.timestamp > sessionTimeout)) {
            localStorage.removeItem(SESSION_KEY);
            window.location.href = 'login.html';
            return false;
        }
        
        // Update user display
        const userElement = document.getElementById('current-user');
        if (userElement && sessionData.username) {
            userElement.textContent = sessionData.username;
        }
        
        return true;
    } catch (error) {
        localStorage.removeItem(SESSION_KEY);
        window.location.href = 'login.html';
        return false;
    }
}

// Logout function
function logout() {
    const SESSION_KEY = 'employee_management_session';
    localStorage.removeItem(SESSION_KEY);
    window.location.href = 'login.html';
}

// API Configuration
const API_CONFIG = {
    baseUrl: 'https://jsonplaceholder.typicode.com', // Mock API for testing
    endpoints: {
        employees: '/users', // Using users endpoint as employees
        export: '/posts' // Using posts endpoint for export simulation
    },
    timeout: 15000, // Increased to 15 seconds
    maxRetries: 2
};

// Application State
let employees = [];
let isLoading = false;
let editingEmployee = null;

/**
 * API Service Functions
 */
class EmployeeAPI {
    
    /**
     * GET /api/employees - Fetch all employees
     */
    static async getAllEmployees(retryCount = 0) {
        try {
            updateLoadingState(true, retryCount > 0 ? `Retrying... (${retryCount}/${API_CONFIG.maxRetries})` : 'Fetching employees...');
            updateStatus('Loading employees from API...', 'info');
            
            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
            
            const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.employees}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Transform API data to employee format
            const transformedEmployees = data.slice(0, 15).map((user, index) => ({
                id: String(user.id).padStart(3, '0'),
                name: user.name,
                email: user.email,
                department: getDepartmentByIndex(index),
                phone: user.phone || `(555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
                hireDate: getRandomHireDate(),
                status: getStatusByIndex(index)
            }));

            employees = transformedEmployees;
            updateStatus(`Successfully loaded ${employees.length} employees`, 'success');
            updateTable();
            
            return { success: true, data: transformedEmployees, count: transformedEmployees.length };
            
        } catch (error) {
            console.error('API Error:', error);
            
            // Retry logic for network-related errors
            if ((error.name === 'AbortError' || error.name === 'NetworkError' || error.message.includes('Failed to fetch')) 
                && retryCount < API_CONFIG.maxRetries) {
                console.log(`Retrying... Attempt ${retryCount + 1}/${API_CONFIG.maxRetries}`);
                await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Progressive delay
                return this.getAllEmployees(retryCount + 1);
            }
            
            let errorMessage = error.message;
            
            // Handle specific error types
            if (error.name === 'AbortError') {
                errorMessage = 'Request timed out after retries. Please check your connection and try again.';
            } else if (error.name === 'NetworkError' || !navigator.onLine) {
                errorMessage = 'Network error. Please check your internet connection.';
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Unable to connect to server. Please try again later.';
            }
            
            updateStatus(`Failed to load employees: ${errorMessage}`, 'error');
            return { success: false, error: errorMessage };
        } finally {
            updateLoadingState(false);
        }
    }

    /**
     * POST /api/employees - Create new employee
     */
    static async createEmployee(employeeData) {
        try {
            updateLoadingState(true, 'Creating employee...');
            updateStatus('Creating new employee via API...', 'info');

            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

            const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.employees}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(employeeData),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            // Simulate adding to local state
            const newEmployee = {
                id: String(employees.length + 1).padStart(3, '0'),
                ...employeeData
            };
            
            employees.unshift(newEmployee);
            updateStatus('Employee created successfully', 'success');
            updateTable();
            
            return { success: true, data: newEmployee };
            
        } catch (error) {
            console.error('API Error:', error);
            let errorMessage = error.message;
            
            // Handle specific error types
            if (error.name === 'AbortError') {
                errorMessage = 'Request timed out. Please check your connection and try again.';
            } else if (error.name === 'NetworkError' || !navigator.onLine) {
                errorMessage = 'Network error. Please check your internet connection.';
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Unable to connect to server. Please try again later.';
            }
            
            updateStatus(`Failed to create employee: ${errorMessage}`, 'error');
            return { success: false, error: errorMessage };
        } finally {
            updateLoadingState(false);
        }
    }

    /**
     * PUT /api/employees/:id - Update employee
     */
    static async updateEmployee(id, employeeData) {
        try {
            updateLoadingState(true, 'Updating employee...');
            updateStatus('Updating employee via API...', 'info');

            const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.employees}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(employeeData),
                signal: AbortSignal.timeout(API_CONFIG.timeout)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            // Update local state
            const index = employees.findIndex(emp => emp.id === id);
            if (index !== -1) {
                employees[index] = { id, ...employeeData };
            }
            
            updateStatus('Employee updated successfully', 'success');
            updateTable();
            
            return { success: true, data: result };
            
        } catch (error) {
            console.error('API Error:', error);
            updateStatus(`Failed to update employee: ${error.message}`, 'error');
            return { success: false, error: error.message };
        } finally {
            updateLoadingState(false);
        }
    }

    /**
     * DELETE /api/employees/:id - Delete employee
     */
    static async deleteEmployee(id) {
        try {
            updateLoadingState(true, 'Deleting employee...');
            updateStatus('Deleting employee via API...', 'info');

            const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.employees}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                signal: AbortSignal.timeout(API_CONFIG.timeout)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Remove from local state
            employees = employees.filter(emp => emp.id !== id);
            
            updateStatus('Employee deleted successfully', 'success');
            updateTable();
            
            return { success: true };
            
        } catch (error) {
            console.error('API Error:', error);
            updateStatus(`Failed to delete employee: ${error.message}`, 'error');
            return { success: false, error: error.message };
        } finally {
            updateLoadingState(false);
        }
    }

    /**
     * POST /api/export - Export data via API
     */
    static async exportEmployees() {
        try {
            updateLoadingState(true, 'Exporting via API...');
            updateStatus('Exporting employee data via API...', 'info');

            const exportData = {
                title: 'Employee Data Export',
                body: employees.map(emp => 
                    `${emp.id},${emp.name},${emp.email},${emp.department},${emp.phone},${emp.hireDate},${emp.status}`
                ).join('\n'),
                userId: 1,
                timestamp: new Date().toISOString(),
                recordCount: employees.length
            };

            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

            const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.export}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(exportData),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            updateStatus(`Data exported via API successfully (${employees.length} records)`, 'success');
            
            // Also trigger local CSV download
            downloadCSV();
            
            return { success: true, data: result, exportedCount: employees.length };
            
        } catch (error) {
            console.error('API Error:', error);
            let errorMessage = error.message;
            
            // Handle specific error types
            if (error.name === 'AbortError') {
                errorMessage = 'Export timed out. Please try again.';
            } else if (error.name === 'NetworkError' || !navigator.onLine) {
                errorMessage = 'Network error. Please check your internet connection.';
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Unable to connect to server. Please try again later.';
            }
            
            updateStatus(`Failed to export via API: ${errorMessage}`, 'error');
            return { success: false, error: errorMessage };
        } finally {
            updateLoadingState(false);
        }
    }
}

/**
 * Export Functions
 */

/**
 * Download CSV file locally
 */
function downloadCSV() {
    if (employees.length === 0) {
        updateStatus('No data available to export', 'error');
        return;
    }

    try {
        // Create CSV content
        const headers = ['ID', 'Name', 'Email', 'Department', 'Phone', 'Hire Date', 'Status'];
        const csvContent = [
            headers.join(','),
            ...employees.map(emp => [
                emp.id,
                `"${emp.name}"`,
                emp.email,
                `"${emp.department}"`,
                emp.phone,
                emp.hireDate,
                emp.status
            ].join(','))
        ].join('\n');

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `employees_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        updateStatus(`CSV file downloaded successfully (${employees.length} records)`, 'success');
    } catch (error) {
        console.error('CSV Export Error:', error);
        updateStatus(`Failed to export CSV: ${error.message}`, 'error');
    }
}

/**
 * Export to CSV (button click handler)
 */
function exportToCSV() {
    if (employees.length === 0) {
        updateStatus('No data available to export. Please load employees first.', 'error');
        return;
    }
    
    updateStatus('Preparing CSV export...', 'info');
    downloadCSV();
}

/**
 * Export via API (button click handler)
 */
async function exportViaAPI() {
    if (employees.length === 0) {
        updateStatus('No data available to export. Please load employees first.', 'error');
        return;
    }
    
    const result = await EmployeeAPI.exportEmployees();
    
    if (result.success) {
        console.log('Export API Response:', result.data);
    }
    
    return result;
}

/**
 * UI Update Functions
 */
function updateLoadingState(loading, message = 'Loading...') {
    isLoading = loading;
    const loadingIndicator = document.getElementById('loading-indicator');
    const loadingText = document.getElementById('loading-text');
    
    if (loading) {
        loadingIndicator.classList.remove('hidden');
        loadingText.textContent = message;
        disableButtons(true);
    } else {
        loadingIndicator.classList.add('hidden');
        disableButtons(false);
    }
}

function updateStatus(message, type = 'info') {
    const statusElement = document.getElementById('status-text');
    statusElement.textContent = message;
    
    // Remove previous type classes
    statusElement.classList.remove('status-success', 'status-error', 'status-info');
    statusElement.classList.add(`status-${type}`);
    
    console.log(`[${type.toUpperCase()}] ${message}`);
}

function disableButtons(disabled) {
    const buttons = document.querySelectorAll('.api-btn, #exportButton, #exportApiBtn');
    buttons.forEach(btn => {
        btn.disabled = disabled;
    });
}

function updateTable() {
    const tbody = document.getElementById('table-body');
    const exportButton = document.getElementById('exportButton');
    
    if (employees.length === 0) {
        tbody.innerHTML = `
            <tr id="no-data-row" class="no-data-row">
                <td colspan="8" data-testid="no-data-message" class="no-data-message">
                    No employees loaded. Click "Load Employees" to fetch data from API.
                </td>
            </tr>
        `;
        exportButton.disabled = true;
        return;
    }
    
    tbody.innerHTML = employees.map((employee, index) => `
        <tr data-testid="table-row-${index + 1}" id="row-${index + 1}" class="data-row employee-row" data-xpath="//tr[@id='row-${index + 1}']">
            <td data-testid="table-cell-${index + 1}-id" id="cell-${index + 1}-id" class="data-cell id-cell" data-xpath="//td[@id='cell-${index + 1}-id']">${employee.id}</td>
            <td data-testid="table-cell-${index + 1}-name" id="cell-${index + 1}-name" class="data-cell name-cell" data-xpath="//td[@id='cell-${index + 1}-name']">${employee.name}</td>
            <td data-testid="table-cell-${index + 1}-email" id="cell-${index + 1}-email" class="data-cell email-cell" data-xpath="//td[@id='cell-${index + 1}-email']">${employee.email}</td>
            <td data-testid="table-cell-${index + 1}-department" id="cell-${index + 1}-department" class="data-cell department-cell" data-xpath="//td[@id='cell-${index + 1}-department']">${employee.department}</td>
            <td data-testid="table-cell-${index + 1}-phone" id="cell-${index + 1}-phone" class="data-cell phone-cell" data-xpath="//td[@id='cell-${index + 1}-phone']">${employee.phone}</td>
            <td data-testid="table-cell-${index + 1}-hiredate" id="cell-${index + 1}-hiredate" class="data-cell hiredate-cell" data-xpath="//td[@id='cell-${index + 1}-hiredate']">${employee.hireDate}</td>
            <td data-testid="table-cell-${index + 1}-status" id="cell-${index + 1}-status" class="data-cell status-cell status-${employee.status.toLowerCase()}" data-xpath="//td[@id='cell-${index + 1}-status']">${employee.status}</td>
            <td data-testid="table-cell-${index + 1}-actions" id="cell-${index + 1}-actions" class="data-cell actions-cell" data-xpath="//td[@id='cell-${index + 1}-actions']">
                <div class="action-buttons">
                    <button data-testid="edit-btn-${index + 1}" class="action-btn edit-btn" onclick="editEmployee('${employee.id}')">Edit</button>
                    <button data-testid="delete-btn-${index + 1}" class="action-btn delete-btn" onclick="deleteEmployee('${employee.id}')">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
    
    exportButton.disabled = false;
}

/**
 * Form Management
 */
function showEmployeeForm(employee = null) {
    const formSection = document.getElementById('employee-form-section');
    const formTitle = document.getElementById('form-title');
    const form = document.getElementById('employee-form');
    
    editingEmployee = employee;
    
    if (employee) {
        formTitle.textContent = 'Edit Employee';
        document.getElementById('input-name').value = employee.name;
        document.getElementById('input-email').value = employee.email;
        document.getElementById('input-department').value = employee.department;
        document.getElementById('input-phone').value = employee.phone;
        document.getElementById('input-hiredate').value = employee.hireDate;
        document.getElementById('input-status').value = employee.status;
    } else {
        formTitle.textContent = 'Add New Employee';
        form.reset();
    }
    
    formSection.classList.remove('hidden');
}

function hideEmployeeForm() {
    const formSection = document.getElementById('employee-form-section');
    const form = document.getElementById('employee-form');
    
    formSection.classList.add('hidden');
    form.reset();
    editingEmployee = null;
}

/**
 * CRUD Operations
 */
async function loadEmployees() {
    await EmployeeAPI.getAllEmployees();
}

async function submitEmployee(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('input-name').value.trim(),
        email: document.getElementById('input-email').value.trim(),
        department: document.getElementById('input-department').value,
        phone: document.getElementById('input-phone').value.trim(),
        hireDate: document.getElementById('input-hiredate').value,
        status: document.getElementById('input-status').value
    };
    
    if (editingEmployee) {
        await EmployeeAPI.updateEmployee(editingEmployee.id, formData);
    } else {
        await EmployeeAPI.createEmployee(formData);
    }
    
    hideEmployeeForm();
}

async function editEmployee(id) {
    const employee = employees.find(emp => emp.id === id);
    if (employee) {
        showEmployeeForm(employee);
    }
}

async function deleteEmployee(id) {
    if (confirm('Are you sure you want to delete this employee?')) {
        await EmployeeAPI.deleteEmployee(id);
    }
}

async function refreshData() {
    await loadEmployees();
}

/**
 * Export Functions
 */
function exportToCSV() {
    if (employees.length === 0) {
        alert('No employee data to export. Please load employees first.');
        return;
    }
    
    const headers = ['ID', 'Name', 'Email', 'Department', 'Phone', 'Hire Date', 'Status'];
    const csvContent = [
        headers.join(','),
        ...employees.map(emp => 
            [emp.id, emp.name, emp.email, emp.department, emp.phone, emp.hireDate, emp.status]
                .map(field => `"${field.toString().replace(/"/g, '""')}"`)
                .join(',')
        )
    ].join('\n');
    
    downloadCSV(csvContent, 'employees-data.csv');
    updateStatus('CSV file downloaded successfully', 'success');
}

async function exportViaAPI() {
    if (employees.length === 0) {
        alert('No employee data to export. Please load employees first.');
        return;
    }
    
    await EmployeeAPI.exportEmployees();
}

function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }
}

/**
 * Utility Functions
 */
function getDepartmentByIndex(index) {
    const departments = ['Engineering', 'Marketing', 'Sales', 'Human Resources', 'Finance', 'Operations', 'IT Support', 'Legal', 'Research & Development', 'Customer Service', 'Quality Assurance', 'Product Management', 'Business Development', 'Design', 'Security'];
    return departments[index % departments.length];
}

function getStatusByIndex(index) {
    const statuses = ['Active', 'Inactive', 'Pending'];
    return statuses[index % statuses.length];
}

function getRandomHireDate() {
    const start = new Date(2016, 0, 1);
    const end = new Date(2024, 11, 31);
    const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return randomDate.toISOString().split('T')[0];
}

/**
 * Validation Functions (for API Testing)
 */
function validateTableStructure() {
    const results = {
        hasTable: !!document.querySelector('[data-testid="data-table"]'),
        hasHeaders: document.querySelectorAll('thead th').length > 0,
        hasDataRows: document.querySelectorAll('tbody tr:not(.no-data-row)').length > 0,
        rowCount: employees.length,
        hasExportButtons: !!document.querySelector('[data-testid="export-button"]') && !!document.querySelector('[data-testid="export-api-btn"]'),
        hasAPIControls: !!document.querySelector('[data-testid="load-employees-btn"]'),
        hasForm: !!document.querySelector('#employee-form'),
        apiEndpoint: `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.employees}`,
        loadingState: isLoading
    };
    
    console.log('Table Structure Validation:', results);
    return results;
}

function getAPIStats() {
    return {
        employeeCount: employees.length,
        apiBaseUrl: API_CONFIG.baseUrl,
        endpoints: API_CONFIG.endpoints,
        currentStatus: document.getElementById('status-text').textContent,
        isLoading: isLoading,
        lastUpdate: new Date().toISOString()
    };
}

/**
 * Event Listeners and Initialization
 */
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication first
    if (!checkAuthentication()) {
        return; // Will redirect to login
    }
    
    // Button event listeners
    document.getElementById('loadEmployeesBtn').addEventListener('click', loadEmployees);
    document.getElementById('addEmployeeBtn').addEventListener('click', () => showEmployeeForm());
    document.getElementById('refreshBtn').addEventListener('click', refreshData);
    document.getElementById('exportButton').addEventListener('click', exportToCSV);
    document.getElementById('exportApiBtn').addEventListener('click', exportViaAPI);
    
    // Logout button event listener
    document.getElementById('logout-btn').addEventListener('click', logout);
    
    // Form event listeners
    document.getElementById('employee-form').addEventListener('submit', submitEmployee);
    document.getElementById('cancel-form-btn').addEventListener('click', hideEmployeeForm);
    
    // Initialize status
    updateStatus('Application initialized. Ready for API operations.', 'info');
    updateTable(); // Show no data message initially
    
    // Add CSS classes for status styling
    const style = document.createElement('style');
    style.textContent = `
        .status-success { color: #22c55e !important; }
        .status-error { color: #ef4444 !important; }
        .status-info { color: #4facfe !important; }
        .header-section { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-bottom: 20px; 
            padding-bottom: 15px; 
            border-bottom: 2px solid #e1e8ed; 
        }
        .user-info { 
            display: flex; 
            align-items: center; 
            gap: 15px; 
        }
        .logout-btn { 
            background: #ff4757; 
            color: white; 
            border: none; 
            padding: 8px 16px; 
            border-radius: 5px; 
            cursor: pointer; 
            font-size: 14px; 
            transition: background-color 0.3s; 
        }
        .logout-btn:hover { 
            background: #ff3838; 
        }
        #welcome-user { 
            color: #667eea; 
            font-weight: 500; 
        }
    `;
    document.head.appendChild(style);
    
    console.log('Employee API Management System initialized');
    console.log('Available functions: loadEmployees(), validateTableStructure(), getAPIStats()');
    console.log('API Endpoints:', API_CONFIG);
});