# Employee API Management System

🚀 **API-driven web application for comprehensive API testing and employee data management**

## 📁 Project Structure

```
code/
├── index.html          # Main HTML with API controls and dynamic table
├── style.css           # Modern CSS with API controls styling
├── script.js           # JavaScript with full API integration
└── README.md           # Project documentation
```

## 🎯 **API Testing Features**

### ✅ **Complete CRUD Operations via APIs**
- **GET** `/api/employees` - Fetch all employees
- **POST** `/api/employees` - Create new employee  
- **PUT** `/api/employees/:id` - Update employee
- **DELETE** `/api/employees/:id` - Delete employee
- **POST** `/api/export` - Export data via API

### ✅ **API Configuration**
```javascript
const API_CONFIG = {
    baseUrl: 'https://jsonplaceholder.typicode.com',
    endpoints: {
        employees: '/users',
        export: '/posts'
    },
    timeout: 10000
};
```

### ✅ **Real API Integration**
- Uses **JSONPlaceholder** API for testing
- Transforms API responses to employee format
- Handles API errors and loading states
- Comprehensive HTTP status code handling

## 🛠 **API Testing Capabilities**

### **HTTP Methods Testing**
- ✅ **GET**: Fetch employee data from API
- ✅ **POST**: Create new employees via API
- ✅ **PUT**: Update existing employees via API  
- ✅ **DELETE**: Remove employees via API

### **Error Handling Testing**
- Network timeouts and failures
- HTTP status code validation
- Response format validation
- API endpoint testing

### **Loading States & UI Feedback**
- Loading indicators during API calls
- Status messages for success/error states
- Button disable/enable based on loading
- Real-time API status updates

## 🎮 **Interactive Controls**

### **Primary Actions**
- **Load Employees (GET)** - Fetches data from API
- **Add Employee (POST)** - Creates via API call
- **Refresh Data** - Reloads from API
- **Export via API (POST)** - Server-side export

### **Table Actions (Per Row)**
- **Edit Button** - Updates via PUT API
- **Delete Button** - Removes via DELETE API

### **Form Operations**
- Dynamic form for adding/editing
- Form validation and submission
- Real-time API integration

## 📊 **API Response Structure**

### Employee Data Format
```json
{
  "id": "001",
  "name": "John Smith", 
  "email": "john.smith@company.com",
  "department": "Engineering",
  "phone": "(555) 123-4567",
  "hireDate": "2022-03-15",
  "status": "Active"
}
```

### API Response Format
```json
{
  "success": true,
  "data": [...],
  "count": 15,
  "error": null
}
```

## 🧪 **Testing Functions**

### **Built-in Validation**
```javascript
// Validate table structure and API state
validateTableStructure()

// Get current API statistics  
getAPIStats()

// Check loading states
isLoading
```

### **Testing Scenarios**
- **API Connectivity** - Test endpoint availability
- **CRUD Operations** - Full create/read/update/delete cycle
- **Error Handling** - Network failures, timeouts, bad responses
- **Loading States** - UI behavior during API calls
- **Data Transformation** - API response to UI format
- **Export Functionality** - Both local CSV and API export

## 🎯 **Automated Testing Ready**

### **Selectors for API Testing**
```javascript
// API Control Buttons
'[data-testid="load-employees-btn"]'
'[data-testid="add-employee-btn"]'
'[data-testid="export-api-btn"]'

// Form Elements
'#input-name', '#input-email', '#input-department'
'[data-testid="submit-employee-btn"]'

// Status Elements
'[data-testid="loading-text"]'
'[data-testid="status-text"]'
'[data-testid="api-endpoint"]'

// Table Elements
'[data-testid="data-table"]'
'[data-testid="table-row-X"]'
'[data-testid="edit-btn-X"]'
'[data-testid="delete-btn-X"]'
```

## 🔧 **API Configuration**

### **Environment Variables**
```javascript
// Customize API endpoints
API_CONFIG.baseUrl = 'https://your-api.com'
API_CONFIG.endpoints.employees = '/api/v1/employees'
API_CONFIG.timeout = 15000
```

### **Mock vs Real APIs**
- **Development**: Uses JSONPlaceholder (fake API)
- **Testing**: Can be configured for any REST API
- **Production**: Point to your actual API endpoints

## 🎮 **How to Use for API Testing**

### **1. Load Application**
```bash
# Open index.html in browser
open code/index.html
```

### **2. Test API Operations**
1. Click **"Load Employees (GET)"** - Tests GET endpoint
2. Click **"Add Employee (POST)"** - Tests POST endpoint  
3. Edit any employee - Tests PUT endpoint
4. Delete an employee - Tests DELETE endpoint
5. Click **"Export via API (POST)"** - Tests export endpoint

### **3. Monitor API Activity**
- Watch status messages for API responses
- Check browser console for detailed logs
- Observe loading states and error handling

### **4. Automated Testing**
```javascript
// Example Cypress test
cy.get('[data-testid="load-employees-btn"]').click()
cy.get('[data-testid="loading-indicator"]').should('be.visible')
cy.get('[data-testid="status-text"]').should('contain', 'Successfully loaded')
```

## 🔍 **API Testing Scenarios**

### **Basic CRUD Testing**
1. **GET** - Load employees list
2. **POST** - Create new employee
3. **PUT** - Update existing employee  
4. **DELETE** - Remove employee
5. **Validation** - Check response formats

### **Error Testing**
- Network connectivity issues
- Invalid API endpoints
- Malformed request data
- HTTP error status codes
- Timeout scenarios

### **Performance Testing**
- API response times
- Loading state duration
- Concurrent request handling
- Data size limitations

## 💡 **Benefits for API Testing**

✅ **Real API Integration** - Uses actual HTTP calls  
✅ **Complete CRUD Coverage** - All REST operations  
✅ **Error Simulation** - Network and API errors  
✅ **Response Validation** - Data format checking  
✅ **Loading States** - Async operation testing  
✅ **Status Monitoring** - Real-time API feedback  
✅ **Easy Configuration** - Switchable API endpoints  
✅ **Testing Framework Ready** - Cypress/Playwright compatible  

---

**Perfect for API Testing with Postman, Cypress, Playwright, or any testing framework!**  
**Ready for both manual and automated API testing scenarios.**