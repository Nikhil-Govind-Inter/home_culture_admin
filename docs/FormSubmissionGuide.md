# Form Submission Guide: Fixing Content-Type Issues

## The Problem You Identified

When submitting forms with file uploads, a common error occurs:
```
Unexpected token '-' in JSON at position 0
```

This happens because:
- **Header says**: `Content-Type: application/json`
- **Body contains**: `multipart/form-data` with boundary `------WebKitFormBoundary...`
- **Server expects**: JSON but receives multipart data

## ✅ **Correct Solution**

### **For File Uploads (FormData)**
```typescript
const response = await fetch(url, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    // ❌ DON'T set Content-Type for FormData
    // 'Content-Type': 'application/json' // WRONG!
  },
  body: formData, // Browser sets Content-Type automatically
});
```

### **For JSON Data**
```typescript
const response = await fetch(url, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json', // ✅ Required for JSON
  },
  body: JSON.stringify(data),
});
```

## 🔧 **Implementation in Your Forms**

### **Option 1: Use Our Standardized API Util**
```typescript
import { apiCall } from "@/utils/apiUtils";

// Automatically handles Content-Type based on data
const createItem = (data: FormData) => 
  apiCall("/endpoint", { method: "POST", data });
```

### **Option 2: Manual Implementation**
```typescript
const submitForm = async (data: FormData) => {
  const response = await fetch("/api/endpoint", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
      // No Content-Type header - let browser set it
    },
    body: data,
  });
  
  if (!response.ok) throw new Error("Failed to submit");
  return response.json();
};
```

## 📋 **Forms to Check/Update**

### **✅ Already Correct (No Content-Type with FormData)**
- `BlogCreateForm.tsx` - lines 36-42
- Forms using `createBlogWithFile` function

### **⚠️ Need to Verify**
Check these forms for file upload handling:
- `ProvidersForm.tsx` 
- `SliderForm.tsx`
- `TestimonialsForm.tsx`
- Any form using `FileUpload` component

### **🔍 Pattern to Look For**
```typescript
// ❌ PROBLEMATIC PATTERN
headers: {
  'Content-Type': 'application/json', // Wrong for FormData!
  Authorization: `Bearer ${token}`,
},
body: formData, // This is FormData, not JSON

// ✅ CORRECT PATTERN  
headers: {
  Authorization: `Bearer ${token}`,
  // No Content-Type - browser sets multipart/form-data
},
body: formData,
```

## 🚀 **Best Practices**

### **1. Let Browser Handle Content-Type for FormData**
```typescript
// ✅ Browser automatically sets:
// Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...
const formData = new FormData();
fetch(url, { body: formData }); // No Content-Type header
```

### **2. Use Smart Helper Function**
```typescript
const submitData = async (url: string, data: any) => {
  const headers: HeadersInit = { Authorization: `Bearer ${token}` };
  let body: BodyInit;
  
  if (data instanceof FormData) {
    // Don't set Content-Type for FormData
    body = data;
  } else {
    // Set Content-Type for JSON
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(data);
  }
  
  return fetch(url, { method: 'POST', headers, body });
};
```

### **3. Check Data Type Before Headers**
```typescript
const hasFiles = Object.values(data).some(v => v instanceof File);
const headers = hasFiles 
  ? { Authorization: `Bearer ${token}` }
  : { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
```

## 🛠️ **Quick Fix Commands**

### **Find Problematic Patterns**
```bash
# Search for Content-Type with FormData
grep -r "Content-Type.*application/json" src/pages --include="*.tsx" -A 5 -B 5
```

### **Find FormData Usage**
```bash
# Find FormData creation
grep -r "new FormData" src/pages --include="*.tsx" -A 10 -B 5
```

## 📝 **Updated Template**
Use this pattern in all forms:
```typescript
const submitForm = async (data: FormData | object) => {
  const headers: HeadersInit = {
    Authorization: `Bearer ${getAuthToken()}`,
  };
  
  let body: BodyInit;
  
  if (data instanceof FormData) {
    body = data; // Browser sets multipart/form-data
  } else {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(data);
  }
  
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body,
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  return response.json();
};
```

## ✅ **Summary**

**The Golden Rule**: When sending `FormData`, never set `Content-Type` header manually. Let the browser handle it automatically with the proper boundary.

This ensures your file uploads work correctly with the server's multipart/form-data parser!