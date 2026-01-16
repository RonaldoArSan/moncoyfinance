# Calendar Component Documentation

## Overview

The Calendar component is a feature-rich, visual calendar designed for displaying and managing commitments/events. It includes a beautiful modal for viewing commitment details and supports both light and dark modes.

## Components

### 1. Calendar (`components/calendar.tsx`)

The main calendar component that displays a monthly view with commitments.

#### Props

```typescript
interface CalendarProps {
  commitments: Commitment[];        // Array of commitments to display
  darkMode: boolean;                 // Enable dark mode styling
  onDayClick: (dayData: {           // Callback when clicking a day with commitments
    date: string;
    commitments: Commitment[];
  }) => void;
  onEmptyDayClick?: (date: string) => void;  // Optional: Callback when clicking an empty day
}
```

#### Features

- **Monthly View**: Full month calendar grid with proper week alignment
- **Portuguese Localization**: Month and day names in Portuguese
- **Month Navigation**: Previous/Next month buttons
- **Commitment Display**: Shows up to 2 commitments per day with overflow indicator
- **Status Color Coding**:
  - Green: Confirmed (`confirmado`)
  - Yellow: Pending (`pendente`)
  - Red: Canceled (`cancelado`)
- **Today Highlight**: Current day highlighted with blue background
- **Hover Effects**: Smooth transitions and hover states
- **Dark Mode Support**: Complete dark mode theming
- **Responsive**: Works on all screen sizes

#### Usage Example

```tsx
import { Calendar } from "@/components/calendar";

function MyPage() {
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [darkMode, setDarkMode] = useState(false);

  const handleDayClick = (dayData: { date: string; commitments: Commitment[] }) => {
    console.log('Day clicked:', dayData.date);
    // Open modal or navigate to details
  };

  const handleEmptyDayClick = (date: string) => {
    console.log('Empty day clicked:', date);
    // Open form to create new commitment
  };

  return (
    <Calendar
      commitments={commitments}
      darkMode={darkMode}
      onDayClick={handleDayClick}
      onEmptyDayClick={handleEmptyDayClick}
    />
  );
}
```

### 2. Commitments Modal (`components/modals/commitments-modal.tsx`)

A modal dialog for displaying all commitments for a selected date.

#### Props

```typescript
interface CommitmentsModalProps {
  open: boolean;                                    // Modal open state
  onOpenChange: (open: boolean) => void;           // Callback to control modal state
  date: string;                                     // Selected date (YYYY-MM-DD)
  commitments: Commitment[];                       // Commitments for the selected date
  onAddCommitment?: () => void;                    // Optional: Callback for adding new commitment
  onSelectCommitment?: (commitment: Commitment) => void;  // Optional: Callback for selecting a commitment
}
```

#### Features

- **Formatted Date Display**: Shows full date with weekday (e.g., "terça-feira, 15 de outubro de 2025")
- **Sorted by Time**: Commitments automatically sorted by time
- **Detailed View**: Shows time, title, description, status, category, and priority
- **Status Icons**: Visual status indicators with icons
- **Empty State**: Friendly message when no commitments exist
- **Add Button**: Optional button to add new commitments
- **Clickable Commitments**: Optional click handler for individual commitments
- **Scrollable**: Handles many commitments with scrollable content
- **Responsive**: Adapts to different screen sizes

#### Usage Example

```tsx
import { CommitmentsModal } from "@/components/modals/commitments-modal";

function MyPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedCommitments, setSelectedCommitments] = useState<Commitment[]>([]);

  const handleAddCommitment = () => {
    console.log('Add new commitment for', selectedDate);
    // Open form or navigate
  };

  const handleSelectCommitment = (commitment: Commitment) => {
    console.log('Selected commitment:', commitment);
    // Edit or view details
  };

  return (
    <CommitmentsModal
      open={modalOpen}
      onOpenChange={setModalOpen}
      date={selectedDate}
      commitments={selectedCommitments}
      onAddCommitment={handleAddCommitment}
      onSelectCommitment={handleSelectCommitment}
    />
  );
}
```

### 3. Commitment Type (`types/commitment.ts`)

TypeScript interface for commitment objects.

```typescript
export interface Commitment {
  id: string;
  title: string;
  date: string;                                    // Format: YYYY-MM-DD
  time: string;                                    // Format: HH:MM
  description?: string;
  status: 'confirmado' | 'pendente' | 'cancelado';
  category?: string;
  priority?: 'high' | 'medium' | 'low';
}
```

## Complete Integration Example

See `/app/calendar-demo/page.tsx` for a complete working example that demonstrates:
- Calendar with sample commitments
- Modal integration
- Dark mode toggle
- Event handlers
- Legend for status colors

## Styling

The components use Tailwind CSS classes and support both light and dark modes. Key styling features:

- **Rounded corners**: Modern `rounded-xl` design
- **Shadows**: Subtle shadows for depth
- **Transitions**: Smooth hover and state transitions
- **Color scheme**: Semantic colors for status (green/yellow/red)
- **Spacing**: Consistent padding and gaps
- **Typography**: Clear hierarchy with bold days and readable text

## Dependencies

- React
- lucide-react (for icons)
- Tailwind CSS
- Radix UI Dialog (for modal)
- Radix UI Badge (for status badges)

## Customization

### Changing Colors

Edit the Tailwind classes in the component files:
- Calendar day cells: Look for `bg-*` and `border-*` classes
- Commitment badges: Update the status-based color classes
- Today highlight: Modify `bg-blue-*` classes

### Adding More Commitment Info Per Day

Modify the `slice(0, 2)` in `calendar.tsx` to show more commitments:

```tsx
{dayCommitments.slice(0, 3).map(commitment => (
  // ... commitment display
))}
```

### Custom Date Formatting

The modal uses Portuguese date formatting. To change:

```tsx
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {  // Change locale here
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
```

## Browser Support

Works in all modern browsers that support:
- CSS Grid
- Flexbox
- ES6+
- React 18+

## Accessibility

- Semantic HTML structure
- ARIA labels on navigation buttons
- Keyboard navigation support (via Radix UI Dialog)
- Focus management
- Screen reader friendly

## Performance

- Minimal re-renders with proper React hooks
- Efficient date calculations
- Optimized for up to 100+ commitments per month
- Lazy rendering of commitment details in modal

## Future Enhancements

Potential improvements:
- Drag & drop support for moving commitments
- Multi-day events
- Week/Day view modes
- Export to calendar formats (iCal, etc.)
- Recurrence support
- Reminder notifications
- Integration with backend API
