# Loading and Error Handling System Documentation

## Overview

A production-ready, comprehensive loading and error handling system has been implemented across the Vishnu Car Consulting platform. This system provides users with clear feedback during API requests, page transitions, and error states.

## Components

### 1. **LoadingSpinner** (`components/LoadingSpinner.jsx`)

A branded, luxury-themed loading animation featuring:

- **Car Animation**: Luxury car silhouette moving along a circular glowing track
- **Purple Gradient Theme**: Matches website branding with purple-to-pink gradients
- **Rotating Messages**: Randomly displays loading messages:
  - "Loading Vehicles..."
  - "Finding Your Perfect Car..."
  - "Preparing Marketplace..."
  - "Fetching Inventory..."
  - "Connecting to Showroom..."
- **Three Display Modes**:
  - `fullScreen={true}` - Full screen overlay (default)
  - `fullScreen={false}` - Inline component
  - Size options: `small`, `default`, `large`

**Usage**:
```jsx
import LoadingSpinner from '@/components/LoadingSpinner';

// Full screen loader
<LoadingSpinner fullScreen={true} />

// Inline loader
<LoadingSpinner fullScreen={false} size="default" />
```

### 2. **Skeleton Loaders**

#### SkeletonCarCard (`components/SkeletonCarCard.jsx`)
Animated placeholder for car cards with:
- Image placeholder with shimmer
- Title skeleton
- Price skeleton
- Specs placeholders
- Button skeleton

**Usage**:
```jsx
import SkeletonCarCard from '@/components/SkeletonCarCard';

{loading ? (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
    {[...Array(6)].map((_, i) => <SkeletonCarCard key={i} />)}
  </div>
) : (
  // Actual content
)}
```

#### SkeletonCarDetails (`components/SkeletonCarDetails.jsx`)
Placeholder for car details page with:
- Large image skeleton
- Title and price skeletons
- Specification grid skeletons
- Description section skeleton
- Action buttons skeleton

**Usage**:
```jsx
import SkeletonCarDetails from '@/components/SkeletonCarDetails';

{loading ? <SkeletonCarDetails /> : <CarDetailsContent />}
```

### 3. **Error Pages**

#### NotFound (`pages/NotFound.jsx`)
Beautiful 404 error page with:
- Large animated "404" heading
- Car illustration animation
- Helpful message: "Looks like this vehicle has left the showroom."
- Navigation buttons to Home and Browse Cars

#### ServerError (`pages/ServerError.jsx`)
500 error page with:
- Alert icon animation
- Error code display
- Maintenance message
- Retry and Go Home buttons
- Status indicator animation

#### EmptyState (`components/EmptyState.jsx`)
Reusable empty state component for:
- No search results
- No filtered cars
- No data available

**Usage**:
```jsx
import EmptyState from '@/components/EmptyState';

{cars.length === 0 ? (
  <EmptyState 
    title="No vehicles found"
    message="Try adjusting your filters"
    onClearFilters={handleClearFilters}
    icon="search"
  />
) : (
  // Car list
)}
```

### 4. **Global Loading Context** (`context/loadingContext.js`)

Manages global loading states across the application:

```javascript
const { 
  isLoading,      // Global loading state
  startLoading,   // Start loading
  stopLoading,    // Stop loading
  pageTransition, // Page transition state
  startPageTransition,
  stopPageTransition
} = useLoading();
```

**Usage**:
```jsx
import { useLoading } from '@/context/loadingContext';

function MyComponent() {
  const { isLoading, startLoading, stopLoading } = useLoading();
  
  const handleAction = async () => {
    startLoading();
    try {
      // Do something
    } finally {
      stopLoading();
    }
  };
}
```

### 5. **Toast Notification System** (`utils/toastNotifications.js`)

Premium toast notifications using React Hot Toast:

**Functions**:
- `showSuccessToast(message)` - Green success notification
- `showErrorToast(message)` - Red error notification
- `showWarningToast(message)` - Orange warning notification
- `showInfoToast(message)` - Blue info notification
- `showLoadingToast(message)` - Purple loading notification
- `dismissToast(toastId)` - Dismiss specific toast

**Usage**:
```javascript
import { showSuccessToast, showErrorToast } from '@/utils/toastNotifications';

try {
  const result = await apiCall();
  showSuccessToast('Operation successful!');
} catch (error) {
  showErrorToast('Operation failed. Please try again.');
}
```

### 6. **Error Boundary** (`components/ErrorBoundary.jsx`)

Catches and displays React errors gracefully:

- Prevents white screen of death
- Shows helpful error message
- Development mode shows error details
- Provides "Go Back Home" button

**Usage** (in App.jsx):
```jsx
<ErrorBoundary>
  {/* App content */}
</ErrorBoundary>
```

### 7. **useLoadingAPI Hook** (`hooks/useLoadingAPI.js`)

Custom hook for managing API request loading states:

```javascript
const { loading, error, executeAsync, clearError } = useLoadingAPI();

const handleFetch = async () => {
  await executeAsync(
    () => apiCall(),
    (result) => console.log('Success', result),
    (error) => console.log('Error', error)
  );
};
```

## Implementation Across Pages

### Home Page
- Skeleton loaders for featured cars and new arrivals
- Error handling with toast notifications
- Loading spinner on initial load

### Cars Page (Browse)
- Grid of skeleton loaders while fetching
- Empty state for no search results
- Error toast notifications
- Pagination with smooth transitions

### Car Details Page
- Full page skeleton loader
- Proper 404 page for missing cars
- Error handling with fallback UI
- Image loading states

### Sell Car Page
- Multi-step form with loading states
- Loading toast during submission
- Success notification with booking ID
- Error handling for failed submissions

### Login/Signup Pages
- Loading spinner during authentication
- Toast notifications for success/error
- Error messages for validation failures
- Redirect on successful login

### Admin Dashboard
- Loading states for inventory management
- Error handling for bulk operations
- Toast notifications for actions

## Global App Setup

The system is integrated into `App.jsx`:

```jsx
<ErrorBoundary>
  <LoadingProvider>
    <Router>
      <RouteTransitionLoader />
      <Toaster position="top-right" />
      {/* Routes */}
    </Router>
  </LoadingProvider>
</ErrorBoundary>
```

## API Error Handling Strategy

All API calls now follow this pattern:

```javascript
useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiCall();
      setData(response.data);
    } catch (error) {
      const message = error?.response?.data?.message || 'An error occurred';
      showErrorToast(message);
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, []);
```

## Best Practices

### 1. Always Show Loading States
- Use skeleton loaders instead of blank screens
- Show spinners for API calls
- Display loading text for user clarity

### 2. Use Toast Notifications
- Success: "Operation completed successfully"
- Error: "Failed to complete operation. Please try again."
- Warning: For important alerts
- Info: For general information

### 3. Handle All Error Scenarios
- Network errors
- Validation errors
- Server errors (500)
- Not found errors (404)
- Unauthorized errors (401)

### 4. Prevent Layout Shift
- Use skeleton loaders with consistent dimensions
- Maintain placeholder heights
- Use CSS Grid/Flexbox for consistent layouts

### 5. Loading Messages
- Keep messages clear and concise
- Use action-oriented language
- Randomly rotate messages to prevent monotony

## Customization

### Custom Loading Spinner Colors
Edit `LoadingSpinner.jsx` gradient colors:

```jsx
from-purple-500 via-purple-400 to-pink-400  // Current theme
// Change to your colors
```

### Toast Notification Position
In `App.jsx`:

```jsx
<Toaster 
  position="top-right"  // or top-left, bottom-right, etc.
/>
```

### Custom Empty State
```jsx
<EmptyState 
  title="Custom Title"
  message="Custom message"
  icon="car|search|filter"
  onClearFilters={handleClear}
  showClearButton={true}
/>
```

## Performance Optimization

### Image Loading
- Use `IntersectionObserver` for lazy loading
- Show skeleton while image loads
- Provide fallback images

### Preventing Unnecessary Requests
- Use React Query or SWR for caching
- Debounce filter changes
- Cancel previous requests on unmount

### Smooth Transitions
- Use `motion.AnimatePresence` for exit animations
- Fade between loading and content states
- Maintain 60fps animations with GPU acceleration

## Testing Considerations

### Loading States
- Test with network throttling (Chrome DevTools)
- Verify skeleton loaders render correctly
- Check for proper cleanup on unmount

### Error Handling
- Simulate API failures
- Verify error messages display
- Check error boundary catches React errors

### Toast Notifications
- Verify toast appears/dismisses
- Check multiple toasts stack properly
- Verify toast auto-dismiss after delay

## Future Enhancements

1. **Progressive Image Loading**: Blur-up effect with LQIP
2. **Optimistic Updates**: Update UI before API response
3. **Retry Logic**: Auto-retry failed API calls
4. **Request Cancellation**: Cancel long-running requests
5. **Analytics**: Track loading times and errors
6. **Accessibility**: ARIA labels for loading states

## Support

For questions or issues:
1. Check component prop documentation
2. Review usage examples in existing pages
3. Inspect browser console for errors
4. Verify API endpoints are responding
