# Loading & Error Handling - Quick Reference

## Installation

All components are already integrated and ready to use. Ensure `react-hot-toast` is installed:

```bash
npm install react-hot-toast
```

## Quick Examples

### 1. Show Toast Notifications

```javascript
import { showSuccessToast, showErrorToast } from '@/utils/toastNotifications';

// Success
showSuccessToast('Vehicle added successfully!');

// Error
showErrorToast('Failed to add vehicle. Please try again.');

// Warning
showWarningToast('This action cannot be undone.');

// Info
showInfoToast('Your request is being processed.');
```

### 2. Loading States for API Calls

```javascript
import { useState } from 'react';
import { showErrorToast } from '@/utils/toastNotifications';

export default function MyComponent() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api.fetchData();
        setData(response.data);
      } catch (error) {
        showErrorToast(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <>
      {loading ? <LoadingSpinner fullScreen={false} /> : <Content />}
    </>
  );
}
```

### 3. Skeleton Loaders for Lists

```javascript
import SkeletonCarCard from '@/components/SkeletonCarCard';

{loading ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
    {[...Array(6)].map((_, i) => <SkeletonCarCard key={i} />)}
  </div>
) : (
  // Actual car cards here
)}
```

### 4. Empty States

```javascript
import EmptyState from '@/components/EmptyState';

{cars.length === 0 ? (
  <EmptyState 
    title="No vehicles found"
    message="Try adjusting your search filters"
    onClearFilters={() => setFilters({})}
    icon="search"
  />
) : (
  // Car list
)}
```

### 5. Handle Form Submission with Loading

```javascript
import { showSuccessToast, showErrorToast } from '@/utils/toastNotifications';

const handleSubmit = async (formData) => {
  setSubmitting(true);
  try {
    const response = await api.submit(formData);
    showSuccessToast('Form submitted successfully!');
    // Reset form or redirect
  } catch (error) {
    showErrorToast(error.response?.data?.message || 'Submission failed');
  } finally {
    setSubmitting(false);
  }
};
```

### 6. Use Global Loading Context

```javascript
import { useLoading } from '@/context/loadingContext';

export default function MyComponent() {
  const { isLoading, startLoading, stopLoading } = useLoading();

  const handleAction = async () => {
    startLoading();
    try {
      // Do something
    } finally {
      stopLoading();
    }
  };

  return (
    <>
      {isLoading && <LoadingSpinner fullScreen={true} />}
      <button onClick={handleAction}>Start Action</button>
    </>
  );
}
```

### 7. Error Pages

#### Route to 404
```javascript
import NotFound from '@/pages/NotFound';

// In App.jsx routes
<Route path="*" element={<NotFound />} />
```

#### Route to 500 (Server Error)
```javascript
import ServerError from '@/pages/ServerError';

// When API returns 500
<Route path="/500" element={<ServerError />} />
```

## Component Props

### LoadingSpinner

```jsx
<LoadingSpinner 
  fullScreen={true}      // true = overlay, false = inline
  size="default"         // 'small' | 'default' | 'large'
/>
```

### SkeletonCarCard
No props needed - renders a card skeleton with shimmer effect.

### SkeletonCarDetails
No props needed - renders a full details page skeleton.

### EmptyState

```jsx
<EmptyState 
  title="string"                  // Display title
  message="string"                // Description message
  onClearFilters={function}       // Callback for clear button
  showClearButton={boolean}       // Show/hide clear button
  icon="car|search|filter"        // Icon type
/>
```

## API Error Response Pattern

When API returns an error, follow this pattern:

```javascript
try {
  const response = await api.call();
} catch (error) {
  // Error object structure:
  // error.response.status    - HTTP status code
  // error.response.data.message - User-friendly error message
  
  const message = error.response?.data?.message || 'An error occurred';
  showErrorToast(message);
}
```

## Common Patterns

### Pattern 1: Fetch with Loading State

```javascript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);

useEffect(() => {
  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get('/data');
      setData(res.data);
    } catch (err) {
      showErrorToast(err.message);
    } finally {
      setLoading(false);
    }
  };
  fetch();
}, []);

return (
  <>
    {loading && <SkeletonCarDetails />}
    {!loading && data && <DataContent data={data} />}
  </>
);
```

### Pattern 2: Search with Results

```javascript
const [results, setResults] = useState([]);
const [searching, setSearching] = useState(false);

const handleSearch = async (query) => {
  setSearching(true);
  try {
    const res = await api.search(query);
    setResults(res.data);
  } catch (err) {
    showErrorToast('Search failed');
    setResults([]);
  } finally {
    setSearching(false);
  }
};

return (
  <>
    {searching && <LoadingSpinner fullScreen={false} />}
    {results.length === 0 && !searching && <EmptyState icon="search" />}
    {results.map(item => <Item key={item.id} {...item} />)}
  </>
);
```

### Pattern 3: Form Submission

```javascript
const [submitting, setSubmitting] = useState(false);

const handleSubmit = async (formData) => {
  setSubmitting(true);
  const toastId = showLoadingToast('Submitting...');
  
  try {
    await api.submit(formData);
    dismissToast(toastId);
    showSuccessToast('Submitted successfully!');
  } catch (err) {
    dismissToast(toastId);
    showErrorToast(err.message);
  } finally {
    setSubmitting(false);
  }
};
```

## Best Practices

1. **Always show loading**: Use skeletons instead of blank screens
2. **Provide feedback**: Always show success/error toasts
3. **Handle all cases**: Loading, success, error, and empty states
4. **Keep messages clear**: User-friendly error messages
5. **Prevent double submission**: Disable buttons while loading
6. **Clean up**: Cancel requests on component unmount
7. **Accessibility**: Provide ARIA labels for loading states

## Troubleshooting

### Toast doesn't appear
- Ensure `<Toaster />` is in App.jsx
- Check browser console for errors

### Skeleton never shows
- Verify `loading` state is being set
- Check component is conditionally rendering skeleton

### Error boundary not catching errors
- Only catches React render errors, not API errors
- Use try-catch for async operations

### Images loading slowly
- Implement lazy loading with IntersectionObserver
- Use image placeholders/skeletons
- Consider CDN for image optimization

## Performance Tips

1. Use React.memo for skeleton components
2. Lazy load heavy components with Suspense
3. Debounce search/filter API calls
4. Cancel previous requests on new request
5. Use pagination for large lists
6. Implement request caching

## Customization Guide

### Change Loading Messages
Edit `LoadingSpinner.jsx` messages array:

```javascript
const messages = [
  'Loading Vehicles...',
  'Finding Your Perfect Car...',
  // Add more messages
];
```

### Change Toast Position
Edit `App.jsx` Toaster config:

```jsx
<Toaster position="bottom-right" />
```

### Customize Loading Colors
Edit `LoadingSpinner.jsx` gradient colors to match your theme.

---

For detailed documentation, see [LOADING_ERROR_HANDLING.md](./LOADING_ERROR_HANDLING.md)
